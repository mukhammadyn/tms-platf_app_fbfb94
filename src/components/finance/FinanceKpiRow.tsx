import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Clock, CheckCircle2, Coins } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { extractList } from '@/lib/apiUtils'
import type { Transaction } from '@/types'

interface FinanceKpiRowProps {
  data: unknown
  isLoading: boolean
}

interface KpiCardItem {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  sub: string
}

export function FinanceKpiRow({ data, isLoading }: FinanceKpiRowProps) {
  const transactions = extractList<Transaction>(data)

  const totalRevenue = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const pendingPayments = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const completedThisMonth = transactions
    .filter((t) => {
      if (t.status !== 'completed' || !t.paid_date) return false
      const d = new Date(t.paid_date)
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const platformCommission = transactions
    .filter((t) => t.type === 'commission')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const kpis: KpiCardItem[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue, 'USD'),
      icon: <DollarSign className="h-5 w-5" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      sub: `${transactions.filter((t) => t.status === 'completed').length} completed transactions`,
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(pendingPayments, 'USD'),
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      sub: `${transactions.filter((t) => t.status === 'pending').length} awaiting payment`,
    },
    {
      label: 'Completed This Month',
      value: formatCurrency(completedThisMonth, 'USD'),
      icon: <CheckCircle2 className="h-5 w-5" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      sub: 'Current month earnings',
    },
    {
      label: 'Platform Commission',
      value: formatCurrency(platformCommission, 'USD'),
      icon: <Coins className="h-5 w-5" />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      sub: `${transactions.filter((t) => t.type === 'commission').length} commission entries`,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground truncate">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.sub}</p>
              </div>
              <div className={`flex-shrink-0 ml-3 p-2.5 rounded-lg ${kpi.iconBg} ${kpi.iconColor}`}>
                {kpi.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
