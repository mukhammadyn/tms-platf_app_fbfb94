import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, Zap, DollarSign, Clock, Calendar, Star } from 'lucide-react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Bid } from '@/types'

interface BidComparisonViewProps {
  bids: Bid[]
  users: { guid: string; full_name?: string; company_name?: string; avatar?: string; rating?: number }[]
  onAccept?: (bid: Bid) => void
  onReject?: (bid: Bid) => void
  isAccepting?: boolean
  isRejecting?: boolean
  acceptingId?: string
  rejectingId?: string
}

export function BidComparisonView({
  bids,
  users,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
  acceptingId,
  rejectingId,
}: BidComparisonViewProps) {
  const pendingBids = bids.filter((b) => b.status === 'pending')

  if (pendingBids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <DollarSign className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No pending bids to compare.</p>
      </div>
    )
  }

  // Find best price & fastest delivery
  const minAmount = Math.min(...pendingBids.map((b) => b.bid_amount ?? Infinity))
  const minTransit = Math.min(...pendingBids.map((b) => b.estimated_transit_hours ?? Infinity))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Comparing <strong className="text-foreground">{pendingBids.length}</strong> pending bid{pendingBids.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-amber-500" /> Best Price</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-blue-500" /> Fastest</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingBids.map((bid) => {
          const user = users.find((u) => u.guid === bid.users_id)
          const carrierName = user?.full_name ?? user?.company_name ?? 'Unknown Carrier'
          const isBestPrice = (bid.bid_amount ?? Infinity) === minAmount
          const isFastest = (bid.estimated_transit_hours ?? Infinity) === minTransit && minTransit !== Infinity

          return (
            <Card
              key={bid.guid}
              className={`relative overflow-hidden transition-all ${
                isBestPrice ? 'border-amber-400 shadow-md' : ''
              }`}
            >
              {/* Highlight badges */}
              {(isBestPrice || isFastest) && (
                <div className="absolute top-2 right-2 flex gap-1">
                  {isBestPrice && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                      <Trophy className="h-3 w-3" /> Best Price
                    </span>
                  )}
                  {isFastest && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      <Zap className="h-3 w-3" /> Fastest
                    </span>
                  )}
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.avatar ?? undefined}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(carrierName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate text-sm">{carrierName}</p>
                    {user?.rating != null && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-muted-foreground">{user.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Bid amount */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" /> Amount
                  </span>
                  <span className={`font-bold text-lg ${ isBestPrice ? 'text-amber-600' : 'text-foreground' }`}>
                    {formatCurrency(bid.bid_amount ?? 0)}
                  </span>
                </div>

                {/* Transit */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Transit
                  </span>
                  <span className={`text-sm font-medium ${ isFastest ? 'text-blue-600' : 'text-foreground' }`}>
                    {bid.estimated_transit_hours != null ? `${bid.estimated_transit_hours} hrs` : '—'}
                  </span>
                </div>

                {/* Pickup */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Pickup
                  </span>
                  <span className="text-xs">{formatDate(bid.proposed_pickup_date ?? '')}</span>
                </div>

                {/* Delivery */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Delivery
                  </span>
                  <span className="text-xs">{formatDate(bid.proposed_delivery_date ?? '')}</span>
                </div>

                {bid.notes && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-2">
                    {bid.notes.length > 80 ? bid.notes.slice(0, 77) + '...' : bid.notes}
                  </p>
                )}

                {/* Actions */}
                {(onAccept || onReject) && (
                  <div className="flex gap-2 pt-2">
                    {onReject && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onReject(bid)}
                        disabled={isRejecting && rejectingId === bid.guid || isAccepting}
                      >
                        {isRejecting && rejectingId === bid.guid ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : 'Reject'}
                      </Button>
                    )}
                    {onAccept && (
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-1"
                        onClick={() => onAccept(bid)}
                        disabled={isAccepting && acceptingId === bid.guid || isRejecting}
                      >
                        {isAccepting && acceptingId === bid.guid ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : 'Accept'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
