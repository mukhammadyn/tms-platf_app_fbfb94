import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useUnreadCount,
} from '@/hooks/useMessagingNotifications'
import { extractList } from '@/lib/apiUtils'
import type { Notification } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle2, AlertCircle, Package, DollarSign, TrendingUp } from 'lucide-react'

const KPI_ITEMS = [
  { label: 'Unread', icon: Bell, colorClass: 'text-primary bg-primary/10', key: 'unread' as const },
  { label: 'Alerts', icon: AlertCircle, colorClass: 'text-destructive bg-destructive/10', key: 'alert' as const },
  { label: 'Orders', icon: Package, colorClass: 'text-blue-600 bg-blue-100', key: 'order' as const },
  { label: 'Finance', icon: DollarSign, colorClass: 'text-emerald-600 bg-emerald-100', key: 'finance' as const },
  { label: 'Bids', icon: TrendingUp, colorClass: 'text-purple-600 bg-purple-100', key: 'bid' as const },
]

export function NotificationsPage() {
  const [filterType, setFilterType] = useState('all')

  const { data, isLoading } = useNotifications()
  const notifications = extractList<Notification>(data)

  const markAllRead = useMarkAllNotificationsRead()
  const { unreadNotifications } = useUnreadCount()

  const getCount = (key: string) => {
    if (key === 'unread') return notifications.filter((n) => !n.is_read).length
    return notifications.filter((n) => n.type === key).length
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on orders, bids, deliveries, and system alerts"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_ITEMS.map((item) => {
          const Icon = item.icon
          const count = getCount(item.key)
          return (
            <Card
              key={item.key}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (item.key === 'unread') {
                  setFilterType('all')
                } else {
                  setFilterType(item.key)
                }
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Notification Center */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Notification Center</h2>
            {unreadNotifications > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadNotifications} new
              </Badge>
            )}
          </div>
        </div>
        <div style={{ minHeight: '480px' }}>
          <NotificationCenter
            notifications={notifications}
            isLoading={isLoading}
            onMarkAllRead={() => markAllRead.mutate(undefined)}
            isMarkingRead={markAllRead.isPending}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
          />
        </div>
      </Card>
    </div>
  )
}
