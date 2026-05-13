import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderFormModal } from '@/components/orders/OrderFormModal'
import { useOrders } from '@/hooks/useOrders'
import { extractList } from '@/lib/apiUtils'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import type { Order } from '@/types'
import type { Column } from '@/components/shared/DataTable'

export function ClassicOrdersTab() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useOrders({ order_type: 'classic' })
  const allOrders = extractList<Order>(data)

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
      render: row => <span className="font-medium">{row.order_number ?? '—'}</span>,
    },
    {
      key: 'cargo_description',
      label: 'Cargo',
      render: row => <span className="text-muted-foreground">{truncate(row.cargo_description, 40)}</span>,
    },
    {
      key: 'cargo_weight_kg',
      label: 'Weight',
      render: row => row.cargo_weight_kg != null ? `${row.cargo_weight_kg} kg` : '—',
    },
    {
      key: 'pickup_address',
      label: 'Pickup',
      render: row => <span className="text-xs">{truncate(row.pickup_address, 30)}</span>,
    },
    {
      key: 'delivery_address',
      label: 'Delivery',
      render: row => <span className="text-xs">{truncate(row.delivery_address, 30)}</span>,
    },
    {
      key: 'pickup_date',
      label: 'Date',
      render: row => formatDate(row.pickup_date ?? ''),
    },
    {
      key: 'price',
      label: 'Price',
      render: row => formatCurrency(row.price ?? 0),
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
            placeholder="Search orders..."
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
              <SelectItem value="bidding">Bidding</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Classic Order
        </Button>
      </div>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No classic orders found."
        onRowClick={row => navigate(`/orders/${row.guid}`)}
      />

      <OrderFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        defaultType="classic"
      />
    </div>
  )
}
