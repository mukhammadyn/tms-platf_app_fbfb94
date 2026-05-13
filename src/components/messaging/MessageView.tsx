import React from 'react'
import { formatDate, getInitials } from '@/lib/utils'
import type { Message } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Paperclip, Package, Reply, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useApiQuery } from '@/hooks/useApi'
import { extractSingle } from '@/lib/apiUtils'
import type { Order } from '@/types'

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  order_update: 'Order Update',
  bid_notification: 'Bid Notification',
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

interface MessageViewProps {
  message: Message | null
  isLoading?: boolean
  onReply?: () => void
}

function LinkedOrderCard({ orderId }: { orderId: string }) {
  const { data, isLoading } = useApiQuery<unknown>(
    ['orders', orderId],
    '/v2/items/orders/' + orderId,
    undefined,
    { enabled: !!orderId }
  )
  const order = extractSingle<Order>(data)

  if (isLoading) return <Skeleton className="h-16 w-full" />
  if (!order) return null

  return (
    <Card className="mt-4">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Linked Order</p>
          <p className="text-sm font-semibold truncate">
            {order.order_number ?? 'Order'} — {order.cargo_description ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.pickup_address ?? '—'} → {order.delivery_address ?? '—'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
          <a href={`/orders/${orderId}`}>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

export function MessageView({ message, isLoading, onReply }: MessageViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <Mail className="h-12 w-12 opacity-20" />
        <p className="text-sm">Select a message to read</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {message.subject ?? '(No Subject)'}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {message.message_type && (
                <Badge variant={MESSAGE_TYPE_VARIANTS[message.message_type] ?? 'secondary'}>
                  {MESSAGE_TYPE_LABELS[message.message_type] ?? message.message_type}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(message.created_at)}
              </span>
              {message.is_read ? (
                <Badge variant="secondary" className="text-xs">Read</Badge>
              ) : (
                <Badge variant="info" className="text-xs">Unread</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={onReply}>
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>

        {/* Sender info */}
        <div className="flex items-center gap-2 mt-4">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(message.subject)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Message ID: <span className="font-mono text-xs">{message.guid?.slice(0, 8) ?? '—'}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="prose prose-sm max-w-none">
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {message.body ?? '(Empty message)'}
          </div>
        </div>

        {/* Attachment */}
        {message.attachment && (
          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground mb-2">Attachment</p>
            <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/30">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <a
                href={message.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {message.attachment}
              </a>
            </div>
          </div>
        )}

        {/* Linked Order */}
        {message.orders_id && (
          <LinkedOrderCard orderId={message.orders_id} />
        )}
      </div>
    </div>
  )
}
