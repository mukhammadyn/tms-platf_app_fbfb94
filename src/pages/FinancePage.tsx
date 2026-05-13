import React, { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FinanceKpiRow } from '@/components/finance/FinanceKpiRow'
import { TransactionsTable } from '@/components/finance/TransactionsTable'
import { TransactionDetailModal } from '@/components/finance/TransactionDetailModal'
import { RevenueChart } from '@/components/finance/RevenueChart'
import { PaymentMethodChart } from '@/components/finance/PaymentMethodChart'
import { useTransactions } from '@/hooks/useFinance'
import { extractList } from '@/lib/apiUtils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Filter, Search, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import type { Transaction } from '@/types'

export function FinancePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useTransactions()
  const allTransactions = extractList<Transaction>(data)

  const filtered = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchType = typeFilter === 'all' || tx.type === typeFilter
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        (tx.transaction_number ?? '').toLowerCase().includes(q) ||
        (tx.notes ?? '').toLowerCase().includes(q) ||
        (tx.payment_method ?? '').toLowerCase().includes(q)
      return matchType && matchStatus && matchSearch
    })
  }, [allTransactions, typeFilter, statusFilter, search])

  function handleExport() {
    toast.info('Preparing export... this may take a moment.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        subtitle="Track revenue, payments, and transaction history"
        action="Export CSV"
        onAction={handleExport}
        actionIcon={<Download className="h-4 w-4" />}
      />

      {/* KPI Row */}
      <FinanceKpiRow data={data} isLoading={isLoading} />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RevenueChart data={data} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-1">
          <PaymentMethodChart data={data} isLoading={isLoading} />
        </div>
      </div>

      {/* Outstanding vs Paid Summary */}
      <OutstandingVsPaidCard data={data} isLoading={isLoading} />

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <TransactionsTable
            transactions={filtered}
            isLoading={isLoading}
            onViewDetail={(id) => setSelectedId(id)}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <TransactionDetailModal
        transactionId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

// ─── Outstanding vs Paid card ────────────────────────────────────────────────
import { useMemo as useMemo2 } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency as fmtCur } from '@/lib/utils'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function OutstandingVsPaidCard({ data, isLoading }: { data: unknown; isLoading: boolean }) {
  const transactions = extractList<Transaction>(data)

  const chartData = useMemo2(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const months: Record<number, { Paid: number; Outstanding: number }> = {}
    for (let m = 0; m < 12; m++) {
      months[m] = { Paid: 0, Outstanding: 0 }
    }
    transactions.forEach((t) => {
      const dateStr = t.due_date ?? t.created_at
      if (!dateStr) return
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      if (d.getFullYear() !== currentYear) return
      const m = d.getMonth()
      if (t.status === 'completed') {
        months[m].Paid += t.amount ?? 0
      } else if (t.status === 'pending' || t.status === 'overdue') {
        months[m].Outstanding += t.amount ?? 0
      }
    })
    return Object.entries(months).map(([mi, vals]) => ({
      month: MONTH_NAMES[Number(mi)],
      ...vals,
    }))
  }, [transactions])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Outstanding vs Paid (Monthly)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <BarChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
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
                formatter={(value, name) => [fmtCur(Number(value), 'USD'), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Paid" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Outstanding" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
