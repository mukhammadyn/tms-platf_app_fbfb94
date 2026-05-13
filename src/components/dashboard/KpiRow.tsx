import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface KpiItem {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
}

interface KpiRowProps {
  items: KpiItem[]
  isLoading?: boolean
}

export function KpiRow({ items, isLoading = false }: KpiRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', items.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : items.length === 5 ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4')}>
      {items.map((item, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1 truncate">{item.value}</p>
                {item.trendValue && (
                  <div className={cn(
                    'flex items-center gap-1 mt-1.5 text-xs font-medium',
                    item.trend === 'up' ? 'text-emerald-600' : item.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {item.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    <span>{item.trendValue}</span>
                  </div>
                )}
              </div>
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                item.color ?? 'bg-primary/10 text-primary'
              )}>
                {item.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
