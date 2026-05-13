import React, { useState } from 'react'
import type { Order, TrackingUpdate } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDate, truncate } from '@/lib/utils'
import { Search, MapPin, Package, ChevronRight } from 'lucide-react'

interface TrackingOrderListProps {
  orders: Order[]
  trackingUpdates: TrackingUpdate[]
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
  isLoading?: boolean
}

const statusVariant = (status?: string) => {
  switch (status) {
    case 'in_transit': return 'warning'
    case 'completed': return 'success'
    case 'assigned': return 'info'
    case 'open': return 'secondary'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

export function TrackingOrderList({
  orders,
  trackingUpdates,
  selectedOrderId,
  onSelectOrder,
  isLoading = false,
}: TrackingOrderListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      search === '' ||
      (o.order_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.pickup_address ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.delivery_address ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const getLatestUpdate = (orderId: string) =>
    trackingUpdates
      .filter((u) => u.orders_id === orderId)
      .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())[0]

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'in_transit', 'assigned', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Package className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredOrders.map((order) => {
              const latestUpdate = getLatestUpdate(order.guid)
              const isSelected = selectedOrderId === order.guid
              return (
                <button
                  key={order.guid}
                  onClick={() => onSelectOrder(order.guid)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all duration-150',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {order.order_number ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={statusVariant(order.status)} className="text-xs py-0">
                        {order.status ?? '—'}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {truncate(order.pickup_address, 40) || '—'}
                      </span>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {truncate(order.delivery_address, 40) || '—'}
                      </span>
                    </div>
                  </div>

                  {latestUpdate && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Last: <span className="text-foreground">{latestUpdate.event_type ?? '—'}</span>
                        {latestUpdate.location_name ? ` · ${latestUpdate.location_name}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(latestUpdate.timestamp ?? '')}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
