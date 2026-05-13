import React from 'react'
import { Star, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Review } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReviewDetailModalProps {
  review: Review | null
  open: boolean
  onClose: () => void
  onToggleVisibility: (review: Review) => void
  isToggling: boolean
}

function StarRating({ rating }: { rating: number | null | undefined }) {
  const val = rating ?? 0
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-5 w-5 ${
            s <= val ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
          }`}
        />
      ))}
      <span className="ml-2 text-lg font-semibold text-foreground">{val}/5</span>
    </div>
  )
}

function categoryLabel(cat: string | null | undefined): string {
  switch (cat) {
    case 'overall': return 'Overall'
    case 'timeliness': return 'Timeliness'
    case 'communication': return 'Communication'
    case 'cargo_handling': return 'Cargo Handling'
    case 'professionalism': return 'Professionalism'
    default: return cat ?? 'General'
  }
}

export function ReviewDetailModal({
  review,
  open,
  onClose,
  onToggleVisibility,
  isToggling,
}: ReviewDetailModalProps) {
  if (!review) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Detail
            <Badge variant={review.is_public ? 'success' : 'secondary'}>
              {review.is_public ? 'Public' : 'Private'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Rating */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Rating</p>
            <StarRating rating={review.rating} />
          </div>

          <Separator />

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
              <Badge variant="outline">{categoryLabel(review.category)}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
              <p className="text-sm text-foreground">{formatDate(review.created_at)}</p>
            </div>
          </div>

          {/* Linked entities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Order ID</p>
              <p className="text-sm font-mono text-foreground">
                {review.orders_id ? review.orders_id.slice(0, 8) + '…' : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">User ID</p>
              <p className="text-sm font-mono text-foreground">
                {review.users_id ? review.users_id.slice(0, 8) + '…' : '—'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Comment */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Comment</p>
            <p className="text-sm text-foreground bg-muted/50 rounded-md p-3 min-h-[60px]">
              {review.comment ?? '—'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={review.is_public ? 'secondary' : 'default'}
            onClick={() => onToggleVisibility(review)}
            disabled={isToggling}
          >
            {isToggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {review.is_public ? (
              <><EyeOff className="mr-2 h-4 w-4" />Make Private</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" />Make Public</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
