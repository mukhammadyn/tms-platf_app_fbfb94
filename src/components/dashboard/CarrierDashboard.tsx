import React from 'react'
import { KpiRow, KpiItem } from '@/components/dashboard/KpiRow'
import { useCarrierStats } from '@/hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { formatCurrency, formatDate, truncate } from '@/lib/utils'
import { Truck, Users, BarChart3, DollarSign, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { Order, Bid, Vehicle, DriverProfile } from '@/types'
import type { Column } from '@/components/shared/DataTable'

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

const orderColumns: Column<Order>[] = [
  { key: 'order_number', label: 'Order #', render: (row) => <span className="font-mono text-xs font-semibold">{row.order_number ?? '—'}</span> },
  { key: 'order_type', label: 'Type', render: (row) => <Badge variant="secondary" className="capitalize text-[11px]">{row.order_type ?? '—'}</Badge> },
  { key: 'cargo_weight_kg', label: 'Weight (kg)', render: (row) => row.cargo_weight_kg ?? '—' },
  { key: 'pickup_address', label: 'Route', render: (row) => (
    <span className="text-xs">{truncate(row.pickup_address, 16)} → {truncate(row.delivery_address, 16)}</span>
  )},
  { key: 'price', label: 'Price', render: (row) => <span className="font-medium">{formatCurrency(row.price ?? 0)}</span> },
  { key: 'pickup_date', label: 'Pickup', render: (row) => formatDate(row.pickup_date) },
]

const bidColumns: Column<Bid>[] = [
  { key: 'guid', label: 'Bid ID', render: (row) => <span className="font-mono text-xs">{(row.guid ?? '').slice(0, 8)}...</span> },
  { key: 'bid_amount', label: 'Amount', render: (row) => formatCurrency(row.bid_amount ?? 0) },
  { key: 'proposed_pickup_date', label: 'Proposed Pickup', render: (row) => formatDate(row.proposed_pickup_date) },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge variant={row.status === 'accepted' ? 'success' : row.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
      {row.status ?? '—'}
    </Badge>
  )},
]

export function CarrierDashboard() {
  const { isLoading, orders, vehicles, bids, drivers, stats } = useCarrierStats()

  const kpiItems: KpiItem[] = [
    {
      label: 'Active Loads',
      value: stats.activeLoads,
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-600',
      trend: 'up',
      trendValue: 'In transit',
    },
    {
      label: 'Available Drivers',
      value: stats.availableDrivers,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      trend: 'neutral',
      trendValue: 'Ready to dispatch',
    },
    {
      label: 'Fleet Utilization',
      value: `${stats.fleetUtilization}%`,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-violet-100 text-violet-600',
      trend: stats.fleetUtilization > 50 ? 'up' : 'down',
      trendValue: `${vehicles.filter(v => v.status === 'on_trip').length}/${vehicles.length} vehicles`,
    },
    {
      label: 'Revenue (MTD)',
      value: formatCurrency(stats.revenue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      trend: 'up',
      trendValue: 'Completed loads',
    },
  ]

  const availableOrders = orders.filter(o => o.status === 'open')
  const myBids = bids.slice(0, 5)

  const bidStatusSummary = [
    { label: 'Pending', count: bids.filter(b => b.status === 'pending').length, color: 'text-amber-600', icon: <Clock className="h-4 w-4" /> },
    { label: 'Accepted', count: bids.filter(b => b.status === 'accepted').length, color: 'text-emerald-600', icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: 'Rejected', count: bids.filter(b => b.status === 'rejected').length, color: 'text-destructive', icon: <XCircle className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <KpiRow items={kpiItems} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bid Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Bids Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bidStatusSummary.map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <span className="text-lg font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Availability Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Driver Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
              </div>
            ) : drivers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No driver profiles found</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {drivers.slice(0, 6).map((d, i) => (
                  <div key={d.guid} className="flex items-center gap-2 p-2 rounded-lg border border-border">
                    <div className="relative">
                      <img
                        src={d.photo ?? thumbPool[i % thumbPool.length]}
                        alt="Driver"
                        className="h-8 w-8 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))' }}
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                        d.status === 'available' ? 'bg-emerald-500' :
                        d.status === 'on_trip' ? 'bg-amber-500' : 'bg-muted-foreground'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{d.license_class ?? '—'}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{d.status ?? 'unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Loads Map */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Loads Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-48 relative overflow-hidden">
              <img
                src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/e366fe8e-ab6b-4255-9660-88f1f8b50f56_img_00.jpg"
                alt="Fleet map"
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))' }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-1 opacity-80" />
                  <p className="text-sm font-medium">{stats.activeLoads} active loads</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Available Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Order>
            columns={orderColumns}
            data={availableOrders.slice(0, 8)}
            isLoading={isLoading}
            emptyMessage="No available orders at the moment."
          />
        </CardContent>
      </Card>

      {/* My Bids */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">My Recent Bids</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Bid>
            columns={bidColumns}
            data={myBids}
            isLoading={isLoading}
            emptyMessage="No bids submitted yet."
          />
        </CardContent>
      </Card>
    </div>
  )
}
