import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { Package, Bell, DollarSign, Truck, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Notification } from '@/types'

interface ActivityFeedProps {
  notifications: Notification[]
  isLoading?: boolean
}

function getTypeIcon(type: string | undefined) {
  switch (type) {
    case 'order': return <Package className="h-4 w-4" />
    case 'bid': return <DollarSign className="h-4 w-4" />
    case 'delivery': return <Truck className="h-4 w-4" />
    case 'alert': return <AlertCircle className="h-4 w-4" />
    case 'finance': return <DollarSign className="h-4 w-4" />
    default: return <Bell className="h-4 w-4" />
  }
}

function getTypeBadgeVariant(type: string | undefined): 'default' | 'info' | 'warning' | 'success' | 'destructive' {
  switch (type) {
    case 'order': return 'info'
    case 'bid': return 'default'
    case 'delivery': return 'success'
    case 'alert': return 'warning'
    case 'finance': return 'default'
    default: return 'default'
  }
}

export function ActivityFeed({ notifications, isLoading = false }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-6 pb-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground py-8">
            No recent activity
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.slice(0, 8).map((item) => (
              <li key={item.guid} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/40 transition-colors">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                  item.type === 'delivery' ? 'bg-emerald-100 text-emerald-600' :
                  item.type === 'finance' ? 'bg-blue-100 text-blue-600' :
                  'bg-primary/10 text-primary'
                }`}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{item.title ?? '—'}</p>
                    <Badge variant={getTypeBadgeVariant(item.type)} className="text-[10px] px-1.5 py-0">
                      {item.type ?? 'system'}
                    </Badge>
                    {!item.is_read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.body ?? '—'}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{formatDate(item.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
