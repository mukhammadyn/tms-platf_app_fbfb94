import React from 'react'
import { KpiRow, KpiItem } from '@/components/dashboard/KpiRow'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { useAdminStats } from '@/hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { formatCurrency, formatDate, truncate } from '@/lib/utils'
import { Users, ShoppingCart, DollarSign, Percent, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { Order, User } from '@/types'
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
  { key: 'order_number', label: 'Order #', render: (row) => <span className="font-mono text-xs">{row.order_number ?? '—'}</span> },
  { key: 'order_type', label: 'Type', render: (row) => <Badge variant="secondary" className="capitalize">{row.order_type ?? '—'}</Badge> },
  { key: 'pickup_address', label: 'Route', render: (row) => (
    <span className="text-xs">{truncate(row.pickup_address, 20)} → {truncate(row.delivery_address, 20)}</span>
  )},
  { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price ?? 0) },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge variant={getOrderStatusVariant(row.status)} className="capitalize">{row.status ?? '—'}</Badge>
  )},
  { key: 'created_at', label: 'Date', render: (row) => formatDate(row.created_at) },
]

const userColumns: Column<User>[] = [
  { key: 'full_name', label: 'Name', render: (row) => <span className="font-medium">{row.full_name ?? row.login ?? '—'}</span> },
  { key: 'email', label: 'Email', render: (row) => <span className="text-xs text-muted-foreground">{row.email ?? '—'}</span> },
  { key: 'company_name', label: 'Company', render: (row) => row.company_name ?? '—' },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'destructive'} className="capitalize">
      {row.status ?? '—'}
    </Badge>
  )},
  { key: 'created_at', label: 'Joined', render: (row) => formatDate(row.created_at) },
]

export function AdminDashboard() {
  const { isLoading, orders, users, transactions, notifications, stats } = useAdminStats()

  const kpiItems: KpiItem[] = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-violet-100 text-violet-600',
      trend: 'up',
      trendValue: 'All time',
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      trend: 'up',
      trendValue: 'In progress',
    },
    {
      label: 'Revenue (MTD)',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      trend: 'up',
      trendValue: 'Month to date',
    },
    {
      label: 'Commission',
      value: formatCurrency(stats.commission),
      icon: <Percent className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-600',
      trend: 'neutral',
      trendValue: '5% of revenue',
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-red-100 text-red-600',
      trend: stats.pendingVerifications > 0 ? 'down' : 'neutral',
      trendValue: 'Requires action',
    },
  ]

  const ordersByStatus = [
    { status: 'open', count: orders.filter(o => o.status === 'open').length, color: 'bg-blue-500' },
    { status: 'bidding', count: orders.filter(o => o.status === 'bidding').length, color: 'bg-yellow-500' },
    { status: 'assigned', count: orders.filter(o => o.status === 'assigned').length, color: 'bg-purple-500' },
    { status: 'in_transit', count: orders.filter(o => o.status === 'in_transit').length, color: 'bg-orange-500' },
    { status: 'completed', count: orders.filter(o => o.status === 'completed').length, color: 'bg-green-500' },
    { status: 'cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-500' },
  ]
  const totalOrders = orders.length || 1

  const pendingUsers = users.filter(u => u.status === 'pending')

  return (
    <div className="space-y-6">
      <KpiRow items={kpiItems} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">System Health — Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground capitalize w-20 shrink-0">{item.status.replace('_', ' ')}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.round((item.count / totalOrders) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{orders.length}</p>
                  <p className="text-[11px] text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{orders.filter(o => o.status === 'completed').length}</p>
                  <p className="text-[11px] text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-destructive">{orders.filter(o => o.status === 'cancelled').length}</p>
                  <p className="text-[11px] text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base font-semibold">Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm text-muted-foreground">No pending alerts</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingUsers.slice(0, 5).map((u) => (
                  <li key={u.guid} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{u.full_name ?? u.login ?? u.email ?? '—'}</p>
                      <p className="text-[11px] text-muted-foreground">Awaiting verification</p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">Pending</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed notifications={notifications} isLoading={isLoading} />
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Order>
            columns={orderColumns}
            data={orders.slice(0, 10)}
            isLoading={isLoading}
            emptyMessage="No orders found."
          />
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<User>
            columns={userColumns}
            data={users.slice(0, 8)}
            isLoading={isLoading}
            emptyMessage="No users found."
          />
        </CardContent>
      </Card>
    </div>
  )
}
