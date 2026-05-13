import React from 'react'
import { Star, TrendingUp, Award, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Review } from '@/types'
import { getInitials } from '@/lib/utils'

interface ReviewStatsPanelProps {
  reviews: Review[]
}

function StarBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs text-muted-foreground text-right">{star}</span>
      <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
    </div>
  )
}

export function ReviewStatsPanel({ reviews }: ReviewStatsPanelProps) {
  const total = reviews.length
  const avgRating =
    total > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / total
      : 0

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    const v = Math.round(r.rating ?? 0)
    if (v >= 1 && v <= 5) distribution[v]++
  })

  // Group by users_id to build leaderboard
  const userRatings: Record<string, { count: number; sum: number }> = {}
  reviews.forEach((r) => {
    const uid = r.users_id ?? 'unknown'
    if (!userRatings[uid]) userRatings[uid] = { count: 0, sum: 0 }
    userRatings[uid].count++
    userRatings[uid].sum += r.rating ?? 0
  })

  const leaderboard = Object.entries(userRatings)
    .map(([uid, v]) => ({ uid, avg: v.count > 0 ? v.sum / v.count : 0, count: v.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  const flagged = leaderboard.filter((l) => l.avg < 3).slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Average Rating Gauge */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Platform Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-4xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= Math.round(avgRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{total} total reviews</span>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Histogram */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 py-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <StarBar
                key={star}
                star={star}
                count={distribution[star]}
                total={total}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Rated */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Top Rated
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {leaderboard.map((l, i) => (
                <li key={l.uid} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(l.uid.slice(0, 6))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground flex-1 truncate font-mono">
                    {l.uid.slice(0, 8)}…
                  </span>
                  <Badge variant="success" className="text-xs">
                    {l.avg.toFixed(1)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Flagged */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Flagged (avg &lt; 3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">None flagged</p>
          ) : (
            <ul className="space-y-2">
              {flagged.map((l) => (
                <li key={l.uid} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(l.uid.slice(0, 6))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground flex-1 truncate font-mono">
                    {l.uid.slice(0, 8)}…
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {l.avg.toFixed(1)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
