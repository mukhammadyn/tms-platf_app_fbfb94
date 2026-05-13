import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { TransactionTypeBadge } from './TransactionTypeBadge'
import { extractSingle } from '@/lib/apiUtils'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useTransaction } from '@/hooks/useFinance'
import { Download, ExternalLink } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionDetailModalProps {
  transactionId: string | null
  onClose: () => void
}

function StatusBadge({ status }: { status: string | undefined | null }) {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Completed</Badge>
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>
    default:
      return <Badge variant="secondary">{status ?? '—'}</Badge>
  }
}

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm text-muted-foreground w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground flex-1">{value}</span>
    </div>
  )
}

export function TransactionDetailModal({ transactionId, onClose }: TransactionDetailModalProps) {
  const { data, isLoading } = useTransaction(transactionId ?? '')
  const transaction = extractSingle<Transaction>(data)

  return (
    <Dialog open={!!transactionId} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction Detail</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : !transaction ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Transaction not found.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">
                {transaction.transaction_number ?? '—'}
              </span>
              <TransactionTypeBadge type={transaction.type} />
              <StatusBadge status={transaction.status} />
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label="Amount"
                value={
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(transaction.amount ?? 0, 'USD')}
                  </span>
                }
              />
              <DetailRow
                label="Payment Method"
                value={transaction.payment_method?.replace('_', ' ') ?? '—'}
              />
              <DetailRow
                label="Due Date"
                value={formatDate(transaction.due_date)}
              />
              <DetailRow
                label="Paid Date"
                value={formatDate(transaction.paid_date)}
              />
              <DetailRow
                label="Created"
                value={formatDate(transaction.created_at)}
              />
              {transaction.orders_id && (
                <DetailRow
                  label="Linked Order"
                  value={
                    <span className="inline-flex items-center gap-1 text-primary">
                      {transaction.orders_id}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  }
                />
              )}
              {transaction.users_id && (
                <DetailRow
                  label="User"
                  value={transaction.users_id}
                />
              )}
              {transaction.notes && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-muted rounded-md p-3">{transaction.notes}</p>
                </div>
              )}
            </div>

            {transaction.invoice_file && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invoice File</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(transaction.invoice_file ?? '', '_blank')}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download Invoice
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
