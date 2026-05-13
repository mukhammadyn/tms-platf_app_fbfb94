import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { TransactionType } from '@/types'

interface TransactionTypeBadgeProps {
  type: TransactionType | string | undefined | null
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  switch (type) {
    case 'payment':
      return <Badge variant="success">Payment</Badge>
    case 'invoice':
      return <Badge variant="info">Invoice</Badge>
    case 'refund':
      return <Badge variant="destructive">Refund</Badge>
    case 'commission':
      return (
        <Badge
          className="border-transparent bg-purple-100 text-purple-800"
        >
          Commission
        </Badge>
      )
    case 'payout':
      return <Badge variant="warning">Payout</Badge>
    default:
      return <Badge variant="secondary">{type ?? '—'}</Badge>
  }
}
