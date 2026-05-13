import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Truck,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  Star,
  Package,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/shared/DataTable'
import { CarrierStatusBadge } from '@/components/carriers/CarrierStatusBadge'
import { CarrierDocumentsSection } from '@/components/carriers/CarrierDocumentsSection'
import { CarrierPerformanceStats } from '@/components/carriers/CarrierPerformanceStats'
import { useCarrier, useVerifyCarrier, useSuspendCarrier, useUpdateCarrierProfile } from '@/hooks/useCarriers'
import { useApiQuery } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import { getInitials, formatDate, truncate } from '@/lib/utils'
import type { CarrierProfile, User, Vehicle, DriverProfile, Order } from '@/types'
import type { Column } from '@/components/shared/DataTable'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

export function CarrierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CarrierProfile>>({})

  const { data: carrierData, isLoading } = useCarrier(id ?? '')
  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const { data: vehiclesData } = useApiQuery<unknown>(['vehicles'], '/v2/items/vehicles')
  const { data: driversData } = useApiQuery<unknown>(['driver_profiles'], '/v2/items/driver_profiles')
  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')

  const carrier = extractSingle<CarrierProfile>(carrierData)
  const users = extractList<User>(usersData)
  const vehicles = extractList<Vehicle>(vehiclesData)
  const driverProfiles = extractList<DriverProfile>(driversData)
  const allOrders = extractList<Order>(ordersData)

  const verifyMutation = useVerifyCarrier()
  const suspendMutation = useSuspendCarrier()
  const updateMutation = useUpdateCarrierProfile()

  const user = carrier ? users.find((u) => u.guid === carrier.users_id) : undefined

  // Fleet: vehicles belonging to this carrier's user
  const fleetVehicles = carrier
    ? vehicles.filter((v) => v.users_id === carrier.users_id)
    : []

  // Drivers: driver_profiles belonging to this carrier's user
  const linkedDrivers = carrier
    ? driverProfiles.filter((d) => d.users_id === carrier.users_id)
    : []

  // Recent orders
  const carrierOrders = carrier
    ? allOrders.filter((o) => o.users_id === carrier.users_id).slice(0, 10)
    : []

  const handleVerify = () => {
    if (!carrier) return
    verifyMutation.mutate({ guid: carrier.guid, status: 'verified' })
  }

  const handleSuspend = () => {
    if (!carrier) return
    suspendMutation.mutate({ guid: carrier.guid, status: 'suspended' })
  }

  const handleEditOpen = () => {
    if (!carrier) return
    setEditForm({
      mc_number: carrier.mc_number,
      dot_number: carrier.dot_number,
      fleet_size: carrier.fleet_size,
      insurance_provider: carrier.insurance_provider,
      insurance_policy_number: carrier.insurance_policy_number,
      operating_regions: carrier.operating_regions,
    })
    setEditOpen(true)
  }

  const handleEditSubmit = () => {
    if (!carrier) return
    updateMutation.mutate(
      { ...editForm, guid: carrier.guid },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  const vehicleColumns: Column<Vehicle>[] = [
    {
      key: 'photo',
      label: '',
      render: (row) => (
        <img
          src={row.photo ?? thumbPool[0]}
          alt={row.plate_number ?? 'vehicle'}
          loading="lazy"
          className="h-8 w-12 object-cover rounded"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.style.display = 'none'
          }}
        />
      ),
    },
    { key: 'plate_number', label: 'Plate', render: (row) => <span className="font-mono">{row.plate_number ?? '—'}</span> },
    { key: 'vehicle_type', label: 'Type', render: (row) => <Badge variant="outline">{row.vehicle_type ?? '—'}</Badge> },
    { key: 'make', label: 'Make/Model', render: (row) => <span>{`${row.make ?? ''} ${row.model ?? ''}`.trim() || '—'}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const v: Record<string, string> = { available: 'success', on_trip: 'info', maintenance: 'warning', inactive: 'secondary' }
        return <Badge variant={(v[row.status ?? ''] as any) ?? 'outline'}>{row.status ?? '—'}</Badge>
      },
    },
  ]

  const driverColumns: Column<DriverProfile>[] = [
    {
      key: 'photo',
      label: '',
      render: (row) => (
        <img
          src={row.photo ?? thumbPool[1]}
          alt="driver"
          loading="lazy"
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none' }}
        />
      ),
    },
    {
      key: 'users_id',
      label: 'Name',
      render: (row) => {
        const u = users.find((u) => u.guid === row.users_id)
        return <span>{u?.full_name ?? u?.login ?? '—'}</span>
      },
    },
    { key: 'license_class', label: 'License Class', render: (row) => <Badge variant="outline">{row.license_class ?? '—'}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const v: Record<string, string> = { available: 'success', on_trip: 'info', off_duty: 'secondary', inactive: 'outline' }
        return <Badge variant={(v[row.status ?? ''] as any) ?? 'outline'}>{row.status ?? '—'}</Badge>
      },
    },
    { key: 'experience_years', label: 'Experience', render: (row) => <span>{row.experience_years != null ? `${row.experience_years} yrs` : '—'}</span> },
  ]

  const orderColumns: Column<Order>[] = [
    { key: 'order_number', label: 'Order #', render: (row) => <span className="font-mono">{row.order_number ?? '—'}</span> },
    { key: 'order_type', label: 'Type', render: (row) => <Badge variant="outline">{row.order_type ?? '—'}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const v: Record<string, string> = { open: 'info', completed: 'success', cancelled: 'destructive', in_transit: 'warning', assigned: 'secondary' }
        return <Badge variant={(v[row.status ?? ''] as any) ?? 'outline'}>{row.status ?? '—'}</Badge>
      },
    },
    { key: 'pickup_address', label: 'Route', render: (row) => <span className="text-xs text-muted-foreground">{truncate(row.pickup_address, 25)} → {truncate(row.delivery_address, 25)}</span> },
    { key: 'pickup_date', label: 'Date', render: (row) => <span>{formatDate(row.pickup_date)}</span> },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!carrier) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Carrier not found</p>
        <Button variant="outline" onClick={() => navigate('/carriers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Carriers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/carriers')} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Back to Carriers
      </Button>

      {/* Hero */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img
          src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg"
          alt="Carrier hero"
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.style.display = 'none'
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background =
                'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-white">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.company_name ?? 'Carrier'} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.company_name ?? user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-white font-bold text-xl">
                {user?.company_name ?? user?.full_name ?? user?.login ?? 'Unknown Carrier'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <CarrierStatusBadge status={carrier.status} />
                {carrier.mc_number && (
                  <span className="text-white/80 text-xs font-mono">MC#{carrier.mc_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {carrier.status !== 'verified' && (
              <Button
                size="sm"
                variant="success"
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
                className="gap-1.5"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Verify
              </Button>
            )}
            {carrier.status !== 'suspended' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSuspend}
                disabled={suspendMutation.isPending}
                className="gap-1.5"
              >
                {suspendMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Suspend
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleEditOpen} className="gap-1.5 bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Company Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="text-muted-foreground">MC Number</span>
                <span className="font-mono">{carrier.mc_number ?? '—'}</span>
                <span className="text-muted-foreground">DOT Number</span>
                <span className="font-mono">{carrier.dot_number ?? '—'}</span>
                <span className="text-muted-foreground">Fleet Size</span>
                <span>{carrier.fleet_size != null ? `${carrier.fleet_size} vehicles` : '—'}</span>
                <span className="text-muted-foreground">Regions</span>
                <span>{carrier.operating_regions ?? '—'}</span>
              </div>
              {user && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    {user.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{user.address}</span>
                      </div>
                    )}
                    {user.rating != null && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-sm font-medium">{user.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <CarrierDocumentsSection carrier={carrier} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance */}
          <CarrierPerformanceStats carrierId={carrier.guid} userId={carrier.users_id} />

          {/* Tabs: Fleet, Drivers, Orders */}
          <Tabs defaultValue="fleet">
            <TabsList>
              <TabsTrigger value="fleet">
                <Truck className="h-3.5 w-3.5 mr-1.5" />
                Fleet ({fleetVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="drivers">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Drivers ({linkedDrivers.length})
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Orders ({carrierOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fleet" className="mt-4">
              <DataTable<Vehicle>
                columns={vehicleColumns}
                data={fleetVehicles}
                emptyMessage="No vehicles linked to this carrier."
                onRowClick={(v) => navigate(`/vehicles/${v.guid}`)}
              />
            </TabsContent>

            <TabsContent value="drivers" className="mt-4">
              <DataTable<DriverProfile>
                columns={driverColumns}
                data={linkedDrivers}
                emptyMessage="No drivers linked to this carrier."
                onRowClick={(d) => navigate(`/drivers/${d.guid}`)}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <DataTable<Order>
                columns={orderColumns}
                data={carrierOrders}
                emptyMessage="No orders for this carrier."
                onRowClick={(o) => navigate(`/orders/${o.guid}`)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        open={editOpen}
        title="Edit Carrier Profile"
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>MC Number</Label>
              <Input
                value={editForm.mc_number ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, mc_number: e.target.value }))}
                placeholder="MC-XXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>DOT Number</Label>
              <Input
                value={editForm.dot_number ?? ''}
                onChange={(e) => setEditForm((f) => ({ ...f, dot_number: e.target.value }))}
                placeholder="DOT-XXXXXXX"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fleet Size</Label>
            <Input
              type="number"
              value={editForm.fleet_size ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, fleet_size: Number(e.target.value) || undefined }))
              }
              placeholder="Number of vehicles"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Insurance Provider</Label>
            <Input
              value={editForm.insurance_provider ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, insurance_provider: e.target.value }))
              }
              placeholder="Provider name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Policy Number</Label>
            <Input
              value={editForm.insurance_policy_number ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, insurance_policy_number: e.target.value }))
              }
              placeholder="Policy number"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Operating Regions</Label>
            <Input
              value={editForm.operating_regions ?? ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, operating_regions: e.target.value }))
              }
              placeholder="e.g. Southeast, Midwest"
            />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
