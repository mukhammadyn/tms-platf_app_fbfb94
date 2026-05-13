import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { extractList } from '@/lib/apiUtils'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

interface RevenueChartProps {
  data: unknown
  isLoading: boolean
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const transactions = extractList<Transaction>(data)

  const chartData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const months: Record<number, { revenue: number; payments: number }> = {}

    for (let m = 0; m < 12; m++) {
      months[m] = { revenue: 0, payments: 0 }
    }

    transactions.forEach((t) => {
      const dateStr = t.paid_date ?? t.created_at
      if (!dateStr) return
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      if (d.getFullYear() !== currentYear) return
      const m = d.getMonth()
      if (t.status === 'completed') {
        months[m].revenue += t.amount ?? 0
      }
      if (t.type === 'payment') {
        months[m].payments += t.amount ?? 0
      }
    })

    return Object.entries(months).map(([monthIdx, vals]) => ({
      month: MONTH_NAMES[Number(monthIdx)],
      Revenue: vals.revenue,
      Payments: vals.payments,
    }))
  }, [transactions])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue Over Time (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: 12,
              }}
              formatter={(value, name) => [formatCurrency(Number(value), 'USD'), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Payments"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
