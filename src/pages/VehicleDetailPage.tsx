import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, MapPin, Package, Maximize2, Calendar, AlertTriangle, Truck, User, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useVehicle } from '@/hooks/useDriversVehicles'
import { useApiQuery } from '@/hooks/useApi'
import { extractSingle, extractList } from '@/lib/apiUtils'
import { formatDate, getInitials, cn } from '@/lib/utils'
import type { Vehicle, User as UserType, Order, DriverProfile } from '@/types'

// Inline vehicle form modal
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateVehicle } from '@/hooks/useDriversVehicles'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

const vehicleTypes = ['flatbed', 'dry_van', 'reefer', 'tanker', 'container', 'lowboy', 'step_deck', 'box_truck', 'other']
const vehicleStatuses = ['available', 'on_trip', 'maintenance', 'inactive']

function vehicleStatusVariant(status: string | undefined) {
  switch (status) {
    case 'available': return 'success' as const
    case 'on_trip': return 'warning' as const
    case 'maintenance': return 'info' as const
    case 'inactive': return 'secondary' as const
    default: return 'outline' as const
  }
}

function isExpiringSoon(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  const diff = d.getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

function isExpired(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  return d.getTime() < Date.now()
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  const { data, isLoading } = useVehicle(id ?? '')
  const vehicle = extractSingle<Vehicle>(data)

  const { data: driverProfilesData } = useApiQuery<unknown>(['driver_profiles'], '/v2/items/driver_profiles')
  const driverProfiles = extractList<DriverProfile>(driverProfilesData)
  const assignedDriver = driverProfiles.find((dp) => dp.users_id === vehicle?.users_id)

  const { data: userDataRaw } = useApiQuery<unknown>(
    ['users', vehicle?.users_id ?? ''],
    '/v2/items/users/' + (vehicle?.users_id ?? ''),
    undefined,
    { enabled: !!vehicle?.users_id }
  )
  const assignedUser = extractSingle<UserType>(userDataRaw)

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const allOrders = extractList<Order>(ordersData)
  const vehicleOrders = allOrders.filter((o) => o.vehicles_id === vehicle?.guid)

  const updateMutation = useUpdateVehicle()

  function openEdit() {
    if (!vehicle) return
    setEditForm({
      plate_number: vehicle.plate_number ?? '',
      vehicle_type: vehicle.vehicle_type ?? '',
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      year: String(vehicle.year ?? ''),
      max_payload_kg: String(vehicle.max_payload_kg ?? ''),
      max_volume_m3: String(vehicle.max_volume_m3 ?? ''),
      status: vehicle.status ?? 'available',
      insurance_expiry: vehicle.insurance_expiry ?? '',
      inspection_expiry: vehicle.inspection_expiry ?? '',
      photo: vehicle.photo ?? '',
    })
    setEditOpen(true)
  }

  function handleUpdate() {
    if (!vehicle) return
    updateMutation.mutate({
      guid: vehicle.guid,
      plate_number: editForm.plate_number || undefined,
      vehicle_type: (editForm.vehicle_type || undefined) as Vehicle['vehicle_type'],
      make: editForm.make || undefined,
      model: editForm.model || undefined,
      year: editForm.year ? Number(editForm.year) : undefined,
      max_payload_kg: editForm.max_payload_kg ? Number(editForm.max_payload_kg) : undefined,
      max_volume_m3: editForm.max_volume_m3 ? Number(editForm.max_volume_m3) : undefined,
      status: (editForm.status || undefined) as Vehicle['status'],
      insurance_expiry: editForm.insurance_expiry || undefined,
      inspection_expiry: editForm.inspection_expiry || undefined,
      photo: editForm.photo || undefined,
    }, { onSuccess: () => setEditOpen(false) })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Vehicle not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vehicles
        </Button>
      </div>
    )
  }

  const photoSrc = vehicle.photo ?? thumbPool[0]
  const insuranceWarn = isExpired(vehicle.insurance_expiry) ? 'expired' : isExpiringSoon(vehicle.insurance_expiry) ? 'soon' : 'ok'
  const inspectionWarn = isExpired(vehicle.inspection_expiry) ? 'expired' : isExpiringSoon(vehicle.inspection_expiry) ? 'soon' : 'ok'

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Vehicles
        </Button>
        <Button onClick={openEdit}>
          <Edit className="h-4 w-4 mr-2" /> Edit Vehicle
        </Button>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative h-56 bg-muted">
          <img
            src={photoSrc}
            alt={`${vehicle.make ?? ''} ${vehicle.model ?? ''}`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-1">
              <Badge variant={vehicleStatusVariant(vehicle.status)} className="capitalize">
                {(vehicle.status ?? '—').replace('_', ' ')}
              </Badge>
              {vehicle.vehicle_type && (
                <Badge variant="info" className="capitalize">
                  {(vehicle.vehicle_type).replace('_', ' ')}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {vehicle.make ?? '—'} {vehicle.model ?? ''}
            </h1>
            <p className="text-white/80 text-sm">{vehicle.plate_number ?? '—'} · {vehicle.year ?? '—'}</p>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Max Payload</span>
              <span className="font-semibold flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                {vehicle.max_payload_kg ?? '—'} kg
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Max Volume</span>
              <span className="font-semibold flex items-center gap-1">
                <Maximize2 className="h-4 w-4 text-muted-foreground" />
                {vehicle.max_volume_m3 ?? '—'} m³
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Location</span>
              <span className="text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {vehicle.current_lat && vehicle.current_lng
                  ? `${vehicle.current_lat.toFixed(4)}, ${vehicle.current_lng.toFixed(4)}`
                  : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Total Trips</span>
              <span className="font-semibold">{vehicleOrders.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Maintenance & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Insurance Expiry</span>
              <div className="flex items-center gap-1.5">
                {insuranceWarn !== 'ok' && (
                  <AlertTriangle className={cn('h-4 w-4', insuranceWarn === 'expired' ? 'text-destructive' : 'text-amber-500')} />
                )}
                <span className={cn('text-sm font-medium',
                  insuranceWarn === 'expired' && 'text-destructive',
                  insuranceWarn === 'soon' && 'text-amber-600'
                )}>
                  {vehicle.insurance_expiry ? formatDate(vehicle.insurance_expiry) : '—'}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inspection Expiry</span>
              <div className="flex items-center gap-1.5">
                {inspectionWarn !== 'ok' && (
                  <AlertTriangle className={cn('h-4 w-4', inspectionWarn === 'expired' ? 'text-destructive' : 'text-amber-500')} />
                )}
                <span className={cn('text-sm font-medium',
                  inspectionWarn === 'expired' && 'text-destructive',
                  inspectionWarn === 'soon' && 'text-amber-600'
                )}>
                  {vehicle.inspection_expiry ? formatDate(vehicle.inspection_expiry) : '—'}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <Badge variant={vehicleStatusVariant(vehicle.status)} className="capitalize">
                {(vehicle.status ?? '—').replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Driver */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Assigned Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedUser ? (
              <Link to={assignedDriver ? `/drivers/${assignedDriver.guid}` : '#'} className="flex items-center gap-4 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={assignedUser.avatar ?? ''} />
                  <AvatarFallback>{getInitials(assignedUser.full_name ?? assignedUser.login)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{assignedUser.full_name ?? assignedUser.login ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">{assignedUser.email ?? '—'}</p>
                  {assignedDriver && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info">{assignedDriver.license_class ?? '—'}</Badge>
                      {assignedDriver.hazmat_certified && <Badge variant="warning">HazMat</Badge>}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No driver assigned to this vehicle.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trip History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Trip History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicleOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No trips recorded for this vehicle.</p>
          ) : (
            <div className="space-y-3">
              {vehicleOrders.slice(0, 10).map((order) => (
                <Link
                  key={order.guid}
                  to={`/orders/${order.guid}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{order.order_number ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.pickup_address ?? '—'} → {order.delivery_address ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'completed' ? 'success' :
                      order.status === 'in_transit' ? 'warning' :
                      order.status === 'cancelled' ? 'destructive' : 'info'
                    }>
                      {order.status ?? '—'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(order.pickup_date ?? '')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <FormModal
        open={editOpen}
        title="Edit Vehicle"
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
        submitLabel="Update"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Plate Number</Label>
              <Input value={editForm.plate_number ?? ''} onChange={(e) => setEditForm(f => ({ ...f, plate_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select value={editForm.vehicle_type ?? ''} onValueChange={(v) => setEditForm(f => ({ ...f, vehicle_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input value={editForm.make ?? ''} onChange={(e) => setEditForm(f => ({ ...f, make: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={editForm.model ?? ''} onChange={(e) => setEditForm(f => ({ ...f, model: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input type="number" value={editForm.year ?? ''} onChange={(e) => setEditForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={editForm.status ?? 'available'} onValueChange={(v) => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vehicleStatuses.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Max Payload (kg)</Label>
              <Input type="number" value={editForm.max_payload_kg ?? ''} onChange={(e) => setEditForm(f => ({ ...f, max_payload_kg: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Volume (m³)</Label>
              <Input type="number" value={editForm.max_volume_m3 ?? ''} onChange={(e) => setEditForm(f => ({ ...f, max_volume_m3: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Insurance Expiry</Label>
              <Input type="date" value={editForm.insurance_expiry ?? ''} onChange={(e) => setEditForm(f => ({ ...f, insurance_expiry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Inspection Expiry</Label>
              <Input type="date" value={editForm.inspection_expiry ?? ''} onChange={(e) => setEditForm(f => ({ ...f, inspection_expiry: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Photo URL</Label>
            <Input value={editForm.photo ?? ''} onChange={(e) => setEditForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
