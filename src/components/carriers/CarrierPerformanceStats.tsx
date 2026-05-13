import React from 'react'
import { TrendingUp, Star, CheckCircle2, Package, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useApiQuery } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import { formatCurrency } from '@/lib/utils'
import type { Order, Bid, Review } from '@/types'

interface CarrierPerformanceStatsProps {
  carrierId: string
  userId?: string
}

export function CarrierPerformanceStats({ carrierId, userId }: CarrierPerformanceStatsProps) {
  const { data: ordersData, isLoading: ordersLoading } = useApiQuery<unknown>(
    ['orders'],
    '/v2/items/orders'
  )
  const { data: reviewsData, isLoading: reviewsLoading } = useApiQuery<unknown>(
    ['reviews'],
    '/v2/items/reviews'
  )

  const allOrders = extractList<Order>(ordersData)
  const allReviews = extractList<Review>(reviewsData)

  // Filter by userId if available
  const carrierOrders = userId
    ? allOrders.filter((o) => o.users_id === userId)
    : allOrders

  const carrierReviews = userId
    ? allReviews.filter((r) => r.users_id === userId)
    : allReviews

  const totalOrders = carrierOrders.length
  const completedOrders = carrierOrders.filter((o) => o.status === 'completed').length
  const completionRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  const avgRating =
    carrierReviews.length > 0
      ? carrierReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / carrierReviews.length
      : 0

  const totalRevenue = carrierOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.price ?? 0), 0)

  const inTransit = carrierOrders.filter((o) => o.status === 'in_transit').length

  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Avg Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Revenue (Completed)',
      value: formatCurrency(totalRevenue, 'USD'),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Active Loads',
      value: inTransit,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const isLoading = ordersLoading || reviewsLoading

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Performance Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border p-3 flex flex-col gap-2"
                >
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Rating breakdown */}
        {carrierReviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">Rating Breakdown</p>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = carrierReviews.filter((r) => Math.round(r.rating ?? 0) === star).length
                const pct = carrierReviews.length > 0 ? (count / carrierReviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-right text-muted-foreground">{star}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
