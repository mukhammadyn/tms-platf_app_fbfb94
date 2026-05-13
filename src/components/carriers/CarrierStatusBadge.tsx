import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { CarrierStatus } from '@/types'

interface CarrierStatusBadgeProps {
  status?: CarrierStatus | string | null
}

export function CarrierStatusBadge({ status }: CarrierStatusBadgeProps) {
  if (!status) return <Badge variant="outline">Unknown</Badge>

  switch (status) {
    case 'verified':
      return <Badge variant="success">Verified</Badge>
    case 'pending_review':
      return <Badge variant="warning">Pending Review</Badge>
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
