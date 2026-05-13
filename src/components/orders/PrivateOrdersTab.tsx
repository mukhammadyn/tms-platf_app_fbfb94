import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderFormModal } from '@/components/orders/OrderFormModal'
import { useOrders } from '@/hooks/useOrders'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import type { Order, User } from '@/types'
import type { Column } from '@/components/shared/DataTable'

export function PrivateOrdersTab() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useOrders({ order_type: 'private' })
  const allOrders = extractList<Order>(data)

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<{ guid: string; full_name?: string; login?: string; email?: string }>(usersData)

  const getUserName = (userId?: string) => {
    if (!userId) return '—'
    const u = users.find(u => u.guid === userId)
    return u ? (u.full_name ?? u.login ?? u.email ?? '—') : '—'
  }

  const filtered = allOrders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch =
      !search ||
      (o.order_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.pickup_address ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.delivery_address ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      render: row => (
        <span className="flex items-center gap-1.5 font-medium">
          <Lock className="h-3 w-3 text-muted-foreground" />
          {row.order_number ?? '—'}
        </span>
      ),
    },
    {
      key: 'cargo_description',
      label: 'Cargo',
      render: row => <span className="text-muted-foreground">{truncate(row.cargo_description, 35)}</span>,
    },
    {
      key: 'cargo_weight_kg',
      label: 'Weight',
      render: row => row.cargo_weight_kg != null ? `${row.cargo_weight_kg} kg` : '—',
    },
    {
      key: 'pickup_address',
      label: 'Route',
      render: row => (
        <span className="text-xs">
          {truncate(row.pickup_address, 20)} → {truncate(row.delivery_address, 20)}
        </span>
      ),
    },
    {
      key: 'users_id',
      label: 'Assigned Carrier',
      render: row => (
        <span className="font-medium text-primary">{getUserName(row.users_id)}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: row => formatCurrency(row.price ?? 0),
    },
    {
      key: 'pickup_date',
      label: 'Pickup Date',
      render: row => formatDate(row.pickup_date ?? ''),
    },
    {
      key: 'status',
      label: 'Status',
      render: row => <OrderStatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search private orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-52"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Private Order
        </Button>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Private orders are only visible to the assigned carrier. They are not listed publicly.
        </p>
      </div>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No private orders found."
        onRowClick={row => navigate(`/orders/${row.guid}`)}
      />

      <OrderFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        defaultType="private"
      />
    </div>
  )
}
