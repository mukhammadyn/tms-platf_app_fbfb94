import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { BadgeProps } from '@/components/ui/badge'

interface UserRoleBadgeProps {
  role?: string | null
  className?: string
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  if (!role) return <Badge variant="outline" className={className}>Unknown</Badge>

  const normalized = (role ?? '').toLowerCase()

  const variantMap: Record<string, BadgeProps['variant']> = {
    admin: 'destructive',
    shipper: 'info',
    carrier: 'success',
    driver: 'warning',
    freelancer: 'default',
  }

  const labelMap: Record<string, string> = {
    admin: 'Admin',
    shipper: 'Shipper',
    carrier: 'Carrier',
    driver: 'Driver',
    freelancer: 'Freelancer',
  }

  const variant = variantMap[normalized] ?? 'secondary'
  const label = labelMap[normalized] ?? role

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
