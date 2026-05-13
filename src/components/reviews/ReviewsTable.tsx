import React from 'react'
import { Star, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import type { Review } from '@/types'
import { formatDate, truncate } from '@/lib/utils'

interface ReviewsTableProps {
  reviews: Review[]
  isLoading: boolean
  onRowClick: (review: Review) => void
  onToggleVisibility: (review: Review) => void
  isToggling: boolean
}

function StarRating({ rating }: { rating: number | null | undefined }) {
  const val = rating ?? 0
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= val ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">{val}/5</span>
    </div>
  )
}

function categoryBadgeVariant(cat: string | null | undefined) {
  switch (cat) {
    case 'overall': return 'default' as const
    case 'timeliness': return 'info' as const
    case 'communication': return 'success' as const
    case 'cargo_handling': return 'warning' as const
    case 'professionalism': return 'secondary' as const
    default: return 'outline' as const
  }
}

export function ReviewsTable({
  reviews,
  isLoading,
  onRowClick,
  onToggleVisibility,
  isToggling,
}: ReviewsTableProps) {
  const columns: Column<Review>[] = [
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => <StarRating rating={row.rating} />,
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <Badge variant={categoryBadgeVariant(row.category)}>
          {(row.category ?? 'general').replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (row) => (
        <span className="text-sm text-foreground">
          {truncate(row.comment, 60) || '—'}
        </span>
      ),
    },
    {
      key: 'orders_id',
      label: 'Order',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.orders_id ? row.orders_id.slice(0, 8) + '…' : '—'}
        </span>
      ),
    },
    {
      key: 'is_public',
      label: 'Visibility',
      render: (row) => (
        <Badge variant={row.is_public ? 'success' : 'secondary'}>
          {row.is_public ? 'Public' : 'Private'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: 'guid',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(row)
          }}
          disabled={isToggling}
          title={row.is_public ? 'Make Private' : 'Make Public'}
        >
          {row.is_public ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ]

  return (
    <DataTable<Review>
      columns={columns}
      data={reviews}
      isLoading={isLoading}
      emptyMessage="No reviews found."
      onRowClick={onRowClick}
    />
  )
}
