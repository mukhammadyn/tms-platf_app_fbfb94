import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReviewsTable } from '@/components/reviews/ReviewsTable'
import { ReviewStatsPanel } from '@/components/reviews/ReviewStatsPanel'
import { ReviewDetailModal } from '@/components/reviews/ReviewDetailModal'
import { useReviews, useToggleReviewVisibility } from '@/hooks/useReviewsSettings'
import { extractList } from '@/lib/apiUtils'
import type { Review } from '@/types'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Search } from 'lucide-react'

export function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')

  const { data, isLoading } = useReviews()
  const reviews = extractList<Review>(data)

  const toggleMutation = useToggleReviewVisibility()

  function handleToggleVisibility(review: Review) {
    toggleMutation.mutate({ guid: review.guid, is_public: !review.is_public })
  }

  const filtered = reviews.filter((r) => {
    const commentMatch = (r.comment ?? '').toLowerCase().includes(search.toLowerCase())
    const catMatch = categoryFilter === 'all' || r.category === categoryFilter
    const visMatch =
      visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'public'
        ? r.is_public === true
        : r.is_public !== true
    return commentMatch && catMatch && visMatch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Ratings"
        subtitle="Monitor platform reviews, moderate content, and track rating trends"
      />

      {/* Stats */}
      <ReviewStatsPanel reviews={reviews} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search comments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="overall">Overall</SelectItem>
            <SelectItem value="timeliness">Timeliness</SelectItem>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="cargo_handling">Cargo Handling</SelectItem>
            <SelectItem value="professionalism">Professionalism</SelectItem>
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ReviewsTable
        reviews={filtered}
        isLoading={isLoading}
        onRowClick={(r) => setSelectedReview(r)}
        onToggleVisibility={handleToggleVisibility}
        isToggling={toggleMutation.isPending}
      />

      {/* Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        onToggleVisibility={handleToggleVisibility}
        isToggling={toggleMutation.isPending}
      />
    </div>
  )
}
