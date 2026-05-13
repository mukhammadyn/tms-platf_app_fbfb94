import React, { useState } from 'react'
import { FormModal } from '@/components/shared/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { useCreateBid } from '@/hooks/useBids'
import type { Bid } from '@/types'

interface BidFormModalProps {
  open: boolean
  onClose: () => void
  preselectedOrderId?: string
}

export function BidFormModal({ open, onClose, preselectedOrderId }: BidFormModalProps) {
  const [orderId, setOrderId] = useState<string>(preselectedOrderId ?? '')
  const [userId, setUserId] = useState<string>('')
  const [bidAmount, setBidAmount] = useState<string>('')
  const [proposedPickup, setProposedPickup] = useState<string>('')
  const [proposedDelivery, setProposedDelivery] = useState<string>('')
  const [transitHours, setTransitHours] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const { data: ordersData } = useApiQuery<unknown>(['orders'], '/v2/items/orders')
  const orders = extractList<{ guid: string; order_number?: string; order_type?: string }>(ordersData)

  const { data: usersData } = useApiQuery<unknown>(['users'], '/v2/items/users')
  const users = extractList<{ guid: string; full_name?: string; company_name?: string }>(usersData)

  const createBid = useCreateBid()

  function reset() {
    setOrderId(preselectedOrderId ?? '')
    setUserId('')
    setBidAmount('')
    setProposedPickup('')
    setProposedDelivery('')
    setTransitHours('')
    setNotes('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    const payload: Partial<Bid> = {
      bid_amount: bidAmount !== '' ? parseFloat(bidAmount) : undefined,
      status: 'pending',
      ...(proposedPickup ? { proposed_pickup_date: proposedPickup } : {}),
      ...(proposedDelivery ? { proposed_delivery_date: proposedDelivery } : {}),
      ...(transitHours !== '' ? { estimated_transit_hours: parseFloat(transitHours) } : {}),
      ...(notes ? { notes } : {}),
      ...(orderId ? { orders_id: orderId } : {}),
      ...(userId ? { users_id: userId } : {}),
    }
    createBid.mutate(payload, {
      onSuccess: () => {
        handleClose()
      },
    })
  }

  return (
    <FormModal
      open={open}
      title="Submit New Bid"
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={createBid.isPending}
      submitLabel="Submit Bid"
    >
      <div className="space-y-4">
        {/* Order */}
        <div className="space-y-1.5">
          <Label>Order <span className="text-destructive">*</span></Label>
          <Select
            value={orderId}
            onValueChange={setOrderId}
            disabled={!!preselectedOrderId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select order..." />
            </SelectTrigger>
            <SelectContent>
              {orders
                .filter((o) => o.order_type === 'tender' || !o.order_type)
                .map((o) => (
                  <SelectItem key={o.guid} value={o.guid || 'unknown'}>
                    {o.order_number ?? o.guid}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Carrier/User */}
        <div className="space-y-1.5">
          <Label>Carrier</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select carrier..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.guid} value={u.guid || 'unknown'}>
                  {u.full_name ?? u.company_name ?? u.guid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bid Amount */}
        <div className="space-y-1.5">
          <Label>Bid Amount (USD) <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2500"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Proposed Pickup Date */}
          <div className="space-y-1.5">
            <Label>Proposed Pickup Date</Label>
            <Input
              type="date"
              value={proposedPickup}
              onChange={(e) => setProposedPickup(e.target.value)}
            />
          </div>

          {/* Proposed Delivery Date */}
          <div className="space-y-1.5">
            <Label>Proposed Delivery Date</Label>
            <Input
              type="date"
              value={proposedDelivery}
              onChange={(e) => setProposedDelivery(e.target.value)}
            />
          </div>
        </div>

        {/* Transit Hours */}
        <div className="space-y-1.5">
          <Label>Estimated Transit Hours</Label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 48"
            value={transitHours}
            onChange={(e) => setTransitHours(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            placeholder="Additional notes or terms..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </FormModal>
  )
}
