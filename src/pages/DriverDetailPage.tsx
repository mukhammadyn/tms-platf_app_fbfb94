import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Shield, Clock, Star, AlertTriangle, FileText, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { DriverFormModal } from '@/components/drivers/DriverFormModal'
import { useDriver } from '@/hooks/useDriversVehicles'
import { useApiQuery } from '@/hooks/useApi'
import { extractSingle, extractList } from '@/lib/apiUtils'
import { formatDate, getInitials, cn } from '@/lib/utils'
import type { DriverProfile, User, Order } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/55f659c3-b3a2-4556-b5db-fc5b94f7e77e_img_01.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg',
]

function statusDot(status: string | undefined) {
  switch (status) {
    case 'available': return 'bg-emerald-500'
    case 'on_trip': return 'bg-amber-500'
    case 'off_duty': return 'bg-gray-400'
    default: return 'bg-red-500'
  }
}

function driverStatusVariant(status: string | undefined) {
  switch (status) {
    case 'available': return 'success' as const
    case 'on_trip': return 'warning' as const
    case 'off_duty': return 'secondary' as const
    default: return 'destructive' as const
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

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading } = useDriver(id ?? '')
  const driver = extractSingle<DriverProfile>(data)

  const { data: userData } = useApiQuery<unknown>(
    ['users', driver?.users_id ?? ''],
    '/v2/items/users/' + (driver?.users_id ?? ''),
    undefined,
    { enabled: !!driver?.users_id }
  )
  const user = extractSingle<User>(userData)

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const allOrders = extractList<Order>(ordersData)
  const driverOrders = allOrders.filter((o) => o.users_id === driver?.users_id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Driver not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Drivers
        </Button>
      </div>
    )
  }

  const displayName = user?.full_name ?? user?.login ?? '—'
  const photoSrc = driver.photo ?? thumbPool[0]
  const rating = user?.rating ?? 0

  const licenseExpiryWarning = isExpired(driver.license_expiry) ? 'expired' : isExpiringSoon(driver.license_expiry) ? 'soon' : 'ok'
  const medicalExpiryWarning = isExpired(driver.medical_cert_expiry) ? 'expired' : isExpiringSoon(driver.medical_cert_expiry) ? 'soon' : 'ok'

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Drivers
        </Button>
        <Button onClick={() => setEditOpen(true)}>
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      {/* Hero Profile Card */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/10">
          <img
            src={photoSrc}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="absolute inset-0 flex items-end p-6">
            <div className="flex items-end gap-5">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={user?.avatar ?? photoSrc} />
                <AvatarFallback className="text-xl">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('h-2.5 w-2.5 rounded-full', statusDot(driver.status))} />
                  <Badge variant={driverStatusVariant(driver.status)}>
                    {(driver.status ?? '—').replace('_', ' ')}
                  </Badge>
                  {driver.hazmat_certified && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> HazMat
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rating</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn('h-4 w-4', s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                ))}
                <span className="text-sm font-medium ml-1">{rating > 0 ? rating.toFixed(1) : '—'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Experience</p>
              <p className="font-semibold flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {driver.experience_years ?? '—'} years
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-sm truncate">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              <p className="font-medium text-sm">{user?.phone ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License & Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Documents & License
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">License Number</span>
              <span className="font-medium text-sm">{driver.license_number ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">License Class</span>
              <Badge variant="info">{driver.license_class ?? '—'}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">License Expiry</span>
              <div className="flex items-center gap-1.5">
                {licenseExpiryWarning !== 'ok' && (
                  <AlertTriangle className={cn('h-4 w-4', licenseExpiryWarning === 'expired' ? 'text-destructive' : 'text-amber-500')} />
                )}
                <span className={cn('text-sm font-medium', licenseExpiryWarning === 'expired' && 'text-destructive', licenseExpiryWarning === 'soon' && 'text-amber-600')}>
                  {driver.license_expiry ? formatDate(driver.license_expiry) : '—'}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Medical Cert Expiry</span>
              <div className="flex items-center gap-1.5">
                {medicalExpiryWarning !== 'ok' && (
                  <AlertTriangle className={cn('h-4 w-4', medicalExpiryWarning === 'expired' ? 'text-destructive' : 'text-amber-500')} />
                )}
                <span className={cn('text-sm font-medium', medicalExpiryWarning === 'expired' && 'text-destructive', medicalExpiryWarning === 'soon' && 'text-amber-600')}>
                  {driver.medical_cert_expiry ? formatDate(driver.medical_cert_expiry) : '—'}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">HazMat Certified</span>
              {driver.hazmat_certified ? (
                <Badge variant="warning" className="flex items-center gap-1"><Shield className="h-3 w-3" /> Yes</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">No</span>
              )}
            </div>
            {user?.documents && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <a href={user.documents} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> View
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{driverOrders.filter(o => o.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed Trips</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{driverOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Assignments</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {driverOrders.length > 0
                    ? Math.round((driverOrders.filter(o => o.status === 'completed').length / driverOrders.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{rating > 0 ? rating.toFixed(1) : '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
              </div>
            </div>
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
          {driverOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No trip history found for this driver.</p>
          ) : (
            <div className="space-y-3">
              {driverOrders.slice(0, 10).map((order) => (
                <div key={order.guid} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
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
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(order.pickup_date ?? '')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DriverFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        driver={driver}
      />
    </div>
  )
}
