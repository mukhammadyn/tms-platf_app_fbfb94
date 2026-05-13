import React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { TransactionTypeBadge } from './TransactionTypeBadge'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import { Eye } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onViewDetail: (id: string) => void
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

const COLUMNS = [
  'Transaction #',
  'Type',
  'Amount',
  'Status',
  'Payment Method',
  'Due Date',
  'Paid Date',
  'Notes',
  'Actions',
]

export function TransactionsTable({ transactions, isLoading, onViewDetail }: TransactionsTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {COLUMNS.map((col) => (
                  <TableCell key={`skeleton-${rowIdx}-${col}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow
                key={tx.guid}
                className="cursor-pointer"
                onClick={() => onViewDetail(tx.guid)}
              >
                <TableCell className="font-mono text-xs">
                  {tx.transaction_number ?? '—'}
                </TableCell>
                <TableCell>
                  <TransactionTypeBadge type={tx.type} />
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(tx.amount ?? 0, 'USD')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>
                <TableCell className="capitalize">
                  {(tx.payment_method ?? '—').replace('_', ' ')}
                </TableCell>
                <TableCell>{formatDate(tx.due_date)}</TableCell>
                <TableCell>{formatDate(tx.paid_date)}</TableCell>
                <TableCell className="max-w-[160px]">
                  <span className="text-muted-foreground text-xs">
                    {truncate(tx.notes, 50)}
                  </span>
                </TableCell>
                <TableCell
                  onClick={(e) => { e.stopPropagation(); onViewDetail(tx.guid) }}
                >
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
