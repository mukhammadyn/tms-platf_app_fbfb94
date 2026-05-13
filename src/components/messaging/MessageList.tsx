import React from 'react'
import { cn, formatDate, truncate, getInitials } from '@/lib/utils'
import type { Message } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Paperclip } from 'lucide-react'

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  order_update: 'Order',
  bid_notification: 'Bid',
  system: 'System',
  alert: 'Alert',
  finance: 'Finance',
}

const MESSAGE_TYPE_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'destructive' | 'success' | 'secondary'> = {
  order_update: 'info',
  bid_notification: 'default',
  system: 'secondary',
  alert: 'destructive',
  finance: 'success',
}

interface MessageListProps {
  messages: Message[]
  selectedId: string | null
  onSelect: (msg: Message) => void
  isLoading?: boolean
  filterType: string
  filterRead: string
  onFilterTypeChange: (v: string) => void
  onFilterReadChange: (v: string) => void
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  isLoading,
  filterType,
  filterRead,
  onFilterTypeChange,
  onFilterReadChange,
}: MessageListProps) {
  const filtered = messages.filter((m) => {
    if (filterType !== 'all' && m.message_type !== filterType) return false
    if (filterRead === 'unread' && m.is_read) return false
    if (filterRead === 'read' && !m.is_read) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="flex-1 h-8 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="all">All Types</option>
            <option value="order_update">Order Update</option>
            <option value="bid_notification">Bid</option>
            <option value="system">System</option>
            <option value="alert">Alert</option>
            <option value="finance">Finance</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => onFilterReadChange(e.target.value)}
            className="flex-1 h-8 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} message{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <Mail className="h-8 w-8 opacity-30" />
            <p className="text-sm">No messages found</p>
          </div>
        ) : (
          <ul>
            {filtered.map((msg) => (
              <li key={msg.guid}>
                <button
                  onClick={() => onSelect(msg)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50',
                    selectedId === msg.guid && 'bg-primary/5 border-l-2 border-l-primary',
                    !msg.is_read && 'bg-blue-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(msg.subject)}
                        </AvatarFallback>
                      </Avatar>
                      {!msg.is_read && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('text-sm truncate', !msg.is_read ? 'font-semibold' : 'font-medium')}>
                          {msg.subject ?? '(No Subject)'}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {truncate(msg.body, 80)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {msg.message_type && (
                          <Badge
                            variant={MESSAGE_TYPE_VARIANTS[msg.message_type] ?? 'secondary'}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {MESSAGE_TYPE_LABELS[msg.message_type] ?? msg.message_type}
                          </Badge>
                        )}
                        {msg.attachment && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
