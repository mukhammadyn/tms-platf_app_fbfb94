import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

interface OrderStatusBadgeProps {
  status?: string | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'destructive' | 'secondary' | 'outline' }> = {
  open: { label: 'Open', variant: 'info' },
  bidding: { label: 'Bidding', variant: 'warning' },
  assigned: { label: 'Assigned', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const key = status ?? ''
  const config = statusConfig[key] ?? { label: key || '—', variant: 'outline' as const }
  return (
    <Badge variant={config.variant}>{config.label}</Badge>
  )
}
