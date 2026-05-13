import React from 'react'
import { KpiRow, KpiItem } from '@/components/dashboard/KpiRow'
import { useDriverStats } from '@/hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import { Package, MapPin, BarChart3, Truck, Navigation, Clock, Star } from 'lucide-react'
import type { Order, TrackingUpdate } from '@/types'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

function getOrderStatusVariant(status: string | undefined): 'default' | 'info' | 'warning' | 'success' | 'destructive' | 'secondary' {
  switch (status) {
    case 'open': return 'info'
    case 'bidding': return 'warning'
    case 'assigned': return 'default'
    case 'in_transit': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'secondary'
  }
}

export function DriverDashboard() {
  const { isLoading, orders, tracking, currentAssignment, nextPickup, stats } = useDriverStats()

  const kpiItems: KpiItem[] = [
    {
      label: 'Current Assignment',
      value: currentAssignment?.order_number ?? 'None',
      icon: <Package className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      trendValue: currentAssignment ? 'In transit' : 'No active load',
    },
    {
      label: 'Next Pickup',
      value: nextPickup ? truncate(nextPickup.pickup_address, 18) : 'None',
      icon: <MapPin className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-600',
      trendValue: nextPickup ? formatDate(nextPickup.pickup_date) : 'No upcoming',
    },
    {
      label: 'Total Trips (MTD)',
      value: stats.completedTrips,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      trend: 'up',
      trendValue: 'Completed this month',
    },
  ]

  const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 5)

  return (
    <div className="space-y-6">
      <KpiRow items={kpiItems} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Order Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Current Assignment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : !currentAssignment ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No active assignment</p>
                <p className="text-xs text-muted-foreground">You will be notified when a new load is assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">{currentAssignment.order_number ?? '—'}</span>
                  <Badge variant={getOrderStatusVariant(currentAssignment.status)} className="capitalize">
                    {currentAssignment.status ?? '—'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">{currentAssignment.pickup_address ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(currentAssignment.pickup_date)}</p>
                    </div>
                  </div>
                  <div className="ml-1 h-6 w-px bg-border" />
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-sm font-medium">{currentAssignment.delivery_address ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(currentAssignment.delivery_date)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo</p>
                    <p className="text-sm font-medium">{truncate(currentAssignment.cargo_description, 20)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">{currentAssignment.cargo_weight_kg ?? '—'} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-medium">{currentAssignment.distance_km ?? '—'} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="text-sm font-medium">{formatCurrency(currentAssignment.price ?? 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Widget */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Navigation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-52 relative overflow-hidden">
              <img
                src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg"
                alt="Route navigation"
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))' }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                <div className="text-white">
                  {currentAssignment ? (
                    <>
                      <p className="text-xs opacity-70">Next stop</p>
                      <p className="text-sm font-semibold">{truncate(currentAssignment.delivery_address, 35)}</p>
                    </>
                  ) : (
                    <p className="text-sm opacity-70">No active route</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deliveries Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : completedOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No completed deliveries yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <ul className="space-y-4">
                {completedOrders.map((order, i) => (
                  <li key={order.guid} className="flex gap-4 relative">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 border-2 border-background flex items-center justify-center flex-shrink-0 z-10">
                      <Star className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold">{order.order_number ?? '—'}</span>
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">Completed</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {truncate(order.pickup_address, 20)} → {truncate(order.delivery_address, 20)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.delivery_date)}
                        </span>
                        <span className="text-[11px] font-medium text-foreground">{formatCurrency(order.price ?? 0)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking events */}
      {tracking.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Tracking Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tracking.slice(0, 5).map((t, i) => (
                <li key={t.guid} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <img
                    src={t.photo_proof ?? thumbPool[i % thumbPool.length]}
                    alt="Tracking proof"
                    loading="lazy"
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium capitalize">{t.event_type ?? '—'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.location_name ?? t.notes ?? '—'}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{formatDate(t.timestamp)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
