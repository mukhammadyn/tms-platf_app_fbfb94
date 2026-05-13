import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import type { Bid } from '@/types'
import type { Column } from '@/components/shared/DataTable'
import { Eye, CheckCircle, XCircle } from 'lucide-react'

function BidStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary'; label: string }> = {
    pending:  { variant: 'warning',     label: 'Pending' },
    accepted: { variant: 'success',     label: 'Accepted' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    withdrawn:{ variant: 'secondary',   label: 'Withdrawn' },
  }
  const s = status ?? 'pending'
  const cfg = map[s] ?? { variant: 'secondary', label: s }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

interface BidTableProps {
  bids: Bid[]
  isLoading?: boolean
  orders: { guid: string; order_number?: string }[]
  users: { guid: string; full_name?: string; company_name?: string }[]
  onView?: (bid: Bid) => void
  onAccept?: (bid: Bid) => void
  onReject?: (bid: Bid) => void
  showActions?: boolean
}

export function BidTable({
  bids,
  isLoading,
  orders,
  users,
  onView,
  onAccept,
  onReject,
  showActions = true,
}: BidTableProps) {
  const columns: Column<Bid>[] = [
    {
      key: 'bid_amount',
      label: 'Bid Amount',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(row.bid_amount ?? 0)}
        </span>
      ),
    },
    {
      key: 'orders_id',
      label: 'Order #',
      render: (row) => {
        const order = orders.find((o) => o.guid === row.orders_id)
        return <span className="text-sm">{order?.order_number ?? '—'}</span>
      },
    },
    {
      key: 'users_id',
      label: 'Carrier',
      render: (row) => {
        const user = users.find((u) => u.guid === row.users_id)
        return (
          <span className="text-sm">
            {user?.full_name ?? user?.company_name ?? '—'}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <BidStatusBadge status={row.status} />,
    },
    {
      key: 'proposed_pickup_date',
      label: 'Pickup Date',
      render: (row) => <span className="text-sm">{formatDate(row.proposed_pickup_date ?? '')}</span>,
    },
    {
      key: 'proposed_delivery_date',
      label: 'Delivery Date',
      render: (row) => <span className="text-sm">{formatDate(row.proposed_delivery_date ?? '')}</span>,
    },
    {
      key: 'estimated_transit_hours',
      label: 'Transit (hrs)',
      render: (row) => <span className="text-sm">{row.estimated_transit_hours ?? '—'}</span>,
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (row) => (
        <span className="text-sm text-muted-foreground">{truncate(row.notes, 40)}</span>
      ),
    },
    ...(showActions
      ? [
          {
            key: 'actions' as keyof Bid,
            label: 'Actions',
            render: (row: Bid) => (
              <div className="flex items-center gap-1">
                {onView && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onView(row) }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onAccept && row.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={(e) => { e.stopPropagation(); onAccept(row) }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {onReject && row.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => { e.stopPropagation(); onReject(row) }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <DataTable<Bid>
      columns={columns}
      data={bids}
      isLoading={isLoading}
      emptyMessage="No bids found."
      onRowClick={onView}
    />
  )
}
