import React, { useState } from 'react'
import { FormModal } from '@/components/shared/FormModal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { useSendMessage } from '@/hooks/useMessagingNotifications'
import type { User, Order } from '@/types'

interface ComposeMessageModalProps {
  open: boolean
  onClose: () => void
  defaultOrderId?: string
}

export function ComposeMessageModal({ open, onClose, defaultOrderId }: ComposeMessageModalProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [messageType, setMessageType] = useState('system')
  const [recipientId, setRecipientId] = useState('')
  const [orderId, setOrderId] = useState(defaultOrderId ?? '')

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<User>(usersData)

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const orders = extractList<Order>(ordersData)

  const sendMessage = useSendMessage()

  const handleSubmit = () => {
    if (!subject.trim() || !body.trim()) return
    const payload: Record<string, unknown> = {
      subject: subject.trim(),
      body: body.trim(),
      message_type: messageType,
      is_read: false,
    }
    if (recipientId) payload.users_id = recipientId
    if (orderId) payload.orders_id = orderId

    sendMessage.mutate(payload as Parameters<typeof sendMessage.mutate>[0], {
      onSuccess: () => {
        setSubject('')
        setBody('')
        setMessageType('system')
        setRecipientId('')
        setOrderId('')
        onClose()
      },
    })
  }

  return (
    <FormModal
      open={open}
      title="Compose Message"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={sendMessage.isPending}
      submitLabel="Send Message"
    >
      <div className="space-y-4">
        {/* Recipient */}
        <div className="space-y-1.5">
          <Label>Recipient</Label>
          <Select value={recipientId} onValueChange={setRecipientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.guid} value={u.guid || 'unknown'}>
                  {u.full_name ?? u.login ?? u.email ?? u.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Type */}
        <div className="space-y-1.5">
          <Label>Message Type</Label>
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_update">Order Update</SelectItem>
              <SelectItem value="bid_notification">Bid Notification</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Linked Order */}
        <div className="space-y-1.5">
          <Label>Linked Order (optional)</Label>
          <Select value={orderId} onValueChange={setOrderId}>
            <SelectTrigger>
              <SelectValue placeholder="Link to an order..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— No order —</SelectItem>
              {orders.map((o) => (
                <SelectItem key={o.guid} value={o.guid || 'unknown'}>
                  {o.order_number ?? o.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <Label>Subject <span className="text-destructive">*</span></Label>
          <Input
            placeholder="Message subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <Label>Body <span className="text-destructive">*</span></Label>
          <Textarea
            placeholder="Write your message here..."
            className="min-h-[120px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </FormModal>
  )
}
