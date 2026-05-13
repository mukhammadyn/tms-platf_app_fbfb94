import React from 'react'
import { cn, formatDate } from '@/lib/utils'
import type { Notification } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Package,
  DollarSign,
  AlertCircle,
  ShoppingCart,
  Settings,
  TrendingUp,
} from 'lucide-react'

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bid: TrendingUp,
  delivery: Package,
  finance: DollarSign,
  alert: AlertCircle,
  order: ShoppingCart,
  system: Settings,
}

const TYPE_COLORS: Record<string, string> = {
  bid: 'bg-purple-100 text-purple-600',
  delivery: 'bg-green-100 text-green-600',
  finance: 'bg-emerald-100 text-emerald-600',
  alert: 'bg-red-100 text-red-600',
  order: 'bg-blue-100 text-blue-600',
  system: 'bg-gray-100 text-gray-600',
}

const TYPE_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'> = {
  bid: 'default',
  delivery: 'success',
  finance: 'success',
  alert: 'destructive',
  order: 'info',
  system: 'secondary',
}

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface NotificationItemProps {
  notification: Notification
  onClick?: (n: Notification) => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type ?? 'system'] ?? Bell
  const colorClass = TYPE_COLORS[notification.type ?? 'system'] ?? TYPE_COLORS.system
  const badgeVariant = TYPE_BADGE_VARIANTS[notification.type ?? 'system'] ?? 'secondary'

  return (
    <button
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border transition-colors hover:bg-muted/40',
        !notification.is_read && 'bg-blue-50/40'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('text-sm truncate', !notification.is_read ? 'font-semibold' : 'font-medium')}>
            {notification.title ?? '—'}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {timeAgo(notification.created_at)}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.body ?? '—'}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {notification.type && (
            <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0 capitalize">
              {notification.type}
            </Badge>
          )}
          {notification.action_url && (
            <a
              href={notification.action_url}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-primary hover:underline"
            >
              View →
            </a>
          )}
        </div>
      </div>
    </button>
  )
}
