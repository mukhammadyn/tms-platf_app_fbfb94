import React from 'react'
import { KpiRow, KpiItem } from '@/components/dashboard/KpiRow'
import { useShipperStats } from '@/hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { formatCurrency, formatDate, truncate } from '@/lib/utils'
import { ShoppingCart, Truck, FileText, DollarSign, MapPin } from 'lucide-react'
import type { Order, Bid } from '@/types'
import type { Column } from '@/components/shared/DataTable'

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

const orderColumns: Column<Order>[] = [
  { key: 'order_number', label: 'Order #', render: (row) => <span className="font-mono text-xs font-semibold">{row.order_number ?? '—'}</span> },
  { key: 'order_type', label: 'Type', render: (row) => <Badge variant="secondary" className="capitalize text-[11px]">{row.order_type ?? '—'}</Badge> },
  { key: 'cargo_description', label: 'Cargo', render: (row) => <span className="text-xs">{truncate(row.cargo_description, 30)}</span> },
  { key: 'pickup_address', label: 'Route', render: (row) => (
    <div className="flex items-center gap-1 text-xs">
      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <span>{truncate(row.pickup_address, 15)} → {truncate(row.delivery_address, 15)}</span>
    </div>
  )},
  { key: 'price', label: 'Price', render: (row) => <span className="font-medium">{formatCurrency(row.price ?? 0)}</span> },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge variant={getOrderStatusVariant(row.status)} className="capitalize">{row.status ?? '—'}</Badge>
  )},
]

const bidColumns: Column<Bid>[] = [
  { key: 'guid', label: 'Bid ID', render: (row) => <span className="font-mono text-xs">{(row.guid ?? '').slice(0, 8)}...</span> },
  { key: 'bid_amount', label: 'Amount', render: (row) => <span className="font-semibold text-primary">{formatCurrency(row.bid_amount ?? 0)}</span> },
  { key: 'proposed_pickup_date', label: 'Pickup', render: (row) => formatDate(row.proposed_pickup_date) },
  { key: 'estimated_transit_hours', label: 'Transit Hrs', render: (row) => row.estimated_transit_hours ?? '—' },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge variant={row.status === 'accepted' ? 'success' : row.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
      {row.status ?? '—'}
    </Badge>
  )},
]

const thumbPool = [
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/535adcd3-0569-420d-9ebd-3b1caa087e2b_img_03.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/392a171f-7c47-4ce9-b933-c38a078bd1e6_img_04.jpg',
  'https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/ffcb0e6c-9406-41c5-ad25-4b5fea578077_img_05.jpg',
]

export function ShipperDashboard() {
  const { isLoading, orders, bids, stats } = useShipperStats()

  const kpiItems: KpiItem[] = [
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      trend: 'up',
      trendValue: 'Open + Assigned',
    },
    {
      label: 'Orders in Transit',
      value: stats.inTransit,
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-600',
      trend: 'neutral',
      trendValue: 'Currently moving',
    },
    {
      label: 'Pending Bids',
      value: stats.pendingBids,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-700',
      trend: stats.pendingBids > 0 ? 'up' : 'neutral',
      trendValue: 'Awaiting review',
    },
    {
      label: 'Total Spend (MTD)',
      value: formatCurrency(stats.totalSpend),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      trend: 'up',
      trendValue: 'Completed orders',
    },
  ]

  const orderTypeData = [
    { label: 'Classic', count: orders.filter(o => o.order_type === 'classic').length },
    { label: 'Tender', count: orders.filter(o => o.order_type === 'tender').length },
    { label: 'Private', count: orders.filter(o => o.order_type === 'private').length },
  ]
  const totalTypes = orderTypeData.reduce((s, d) => s + d.count, 0) || 1
  const typeColors = ['bg-primary', 'bg-amber-500', 'bg-violet-500']

  const tenderOrders = orders.filter(o => o.order_type === 'tender' && o.status === 'bidding')
  const recentOrders = orders.slice(0, 5)
  const pendingBidsList = bids.filter(b => b.status === 'pending').slice(0, 5)

  return (
    <div className="space-y-6">
      <KpiRow items={kpiItems} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Type donut-like */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Orders by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderTypeData.map((item, i) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full flex-shrink-0 ${typeColors[i]}`} />
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${typeColors[i]}`} style={{ width: `${Math.round((item.count / totalTypes) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-center">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Map placeholder */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Orders Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div className="h-56 relative overflow-hidden">
              <img
                src="https://cdn-api.ucode.run/ce87e4d2-ddf2-4fde-91d5-716b9e198bad/tms_platform_images/07e77e71-697c-431b-84b0-d1e0b2a24725_img_02.jpg"
                alt="Logistics map view"
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.background = 'linear-gradient(135deg,hsl(var(--muted)),hsl(var(--accent)/0.2))' }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-white text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-medium">{stats.inTransit} orders in transit</p>
                  <p className="text-xs opacity-70 mt-0.5">Live tracking available on Tracking page</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Order>
            columns={orderColumns}
            data={recentOrders}
            isLoading={isLoading}
            emptyMessage="No orders found."
          />
        </CardContent>
      </Card>

      {/* Pending Bids */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pending Bids</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Bid>
            columns={bidColumns}
            data={pendingBidsList}
            isLoading={isLoading}
            emptyMessage="No pending bids."
          />
        </CardContent>
      </Card>
    </div>
  )
}
