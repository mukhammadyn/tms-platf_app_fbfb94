import React, { useState } from 'react'
import type { Notification } from '@/types'
import { NotificationItem } from './NotificationItem'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Bell, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  notifications.forEach((n) => {
    const d = n.created_at ? new Date(n.created_at) : null
    let label = 'Earlier'
    if (d && !isNaN(d.getTime())) {
      if (d.toDateString() === todayStr) label = 'Today'
      else if (d.toDateString() === yesterdayStr) label = 'Yesterday'
    }
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier']

interface NotificationCenterProps {
  notifications: Notification[]
  isLoading: boolean
  onMarkAllRead: () => void
  isMarkingRead: boolean
  filterType: string
  onFilterTypeChange: (v: string) => void
}

export function NotificationCenter({
  notifications,
  isLoading,
  onMarkAllRead,
  isMarkingRead,
  filterType,
  onFilterTypeChange,
}: NotificationCenterProps) {
  const filtered = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false
    return true
  })

  const groups = groupByDate(filtered)
  const unreadCount = filtered.filter((n) => !n.is_read).length

  const handleNotificationClick = (n: Notification) => {
    if (n.action_url) {
      window.location.href = n.action_url
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bid">Bid</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={isMarkingRead || unreadCount === 0}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Mark All Read
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <Bell className="h-10 w-10 opacity-20" />
            <p className="text-sm">No notifications found</p>
          </div>
        ) : (
          <div>
            {GROUP_ORDER.filter((g) => groups[g]?.length > 0).map((groupLabel) => (
              <div key={groupLabel}>
                <div className="px-4 py-2 bg-muted/40 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {groupLabel}
                  </span>
                </div>
                {groups[groupLabel].map((n) => (
                  <NotificationItem
                    key={n.guid}
                    notification={n}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
