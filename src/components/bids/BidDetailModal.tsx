import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, DollarSign, Calendar, Clock, FileText, User, Star } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'
import type { Bid } from '@/types'

interface CarrierInfo {
  guid: string
  full_name?: string
  company_name?: string
  avatar?: string
  rating?: number
}

interface OrderInfo {
  guid: string
  order_number?: string
  order_type?: string
}

interface BidDetailModalProps {
  open: boolean
  bid: Bid | null
  order?: OrderInfo | null
  carrier?: CarrierInfo | null
  onClose: () => void
  onAccept?: (bid: Bid) => void
  onReject?: (bid: Bid) => void
  isAccepting?: boolean
  isRejecting?: boolean
}

function BidStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary'; label: string }> = {
    pending:  { variant: 'warning',     label: 'Pending' },
    accepted: { variant: 'success',     label: 'Accepted' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    withdrawn:{ variant: 'secondary',   label: 'Withdrawn' },
  }
  const s = status ?? 'pending'
  const cfg = map[s] ?? { variant: 'secondary', label: s }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function BidDetailModal({
  open,
  bid,
  order,
  carrier,
  onClose,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: BidDetailModalProps) {
  if (!bid) return null

  const carrierName = carrier?.full_name ?? carrier?.company_name ?? 'Unknown Carrier'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Bid Details
            <BidStatusBadge status={bid.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Carrier info */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/40 border border-border">
            <Avatar className="h-12 w-12">
              <AvatarImage src={carrier?.avatar ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(carrierName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{carrierName}</p>
              {carrier?.company_name && carrier?.full_name && (
                <p className="text-sm text-muted-foreground">{carrier.company_name}</p>
              )}
              {carrier?.rating != null && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium">{carrier.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {order && (
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="text-sm font-medium">{order.order_number ?? '—'}</p>
                {order.order_type && (
                  <Badge variant="info" className="mt-1 capitalize">{order.order_type}</Badge>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Bid amount */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bid Amount</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(bid.bid_amount ?? 0)}</p>
            </div>
          </div>

          <Separator />

          {/* Dates & transit */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Proposed Pickup</span>
              </div>
              <p className="text-sm font-medium">{formatDate(bid.proposed_pickup_date ?? '')}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Proposed Delivery</span>
              </div>
              <p className="text-sm font-medium">{formatDate(bid.proposed_delivery_date ?? '')}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">Transit (hrs)</span>
              </div>
              <p className="text-sm font-medium">{bid.estimated_transit_hours ?? '—'}</p>
            </div>
          </div>

          {/* Notes */}
          {bid.notes && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">Notes</span>
                </div>
                <p className="text-sm">{bid.notes}</p>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            Submitted: {formatDate(bid.created_at ?? '')}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isAccepting || isRejecting}>
            Close
          </Button>
          {onReject && bid.status === 'pending' && (
            <Button
              variant="destructive"
              onClick={() => onReject(bid)}
              disabled={isRejecting || isAccepting}
            >
              {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Bid
            </Button>
          )}
          {onAccept && bid.status === 'pending' && (
            <Button
              variant="success"
              onClick={() => onAccept(bid)}
              disabled={isAccepting || isRejecting}
            >
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Bid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
