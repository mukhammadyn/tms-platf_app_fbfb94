import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle, extractCount } from '@/lib/apiUtils'
import type { Transaction } from '@/types'

export function useTransactions(params?: Record<string, string>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  return useApiQuery<unknown>(['transactions', params ?? {}], '/v2/items/transactions' + queryString)
}

export function useTransaction(id: string) {
  return useApiQuery<unknown>(
    ['transactions', id],
    '/v2/items/transactions/' + id,
    undefined,
    { enabled: !!id }
  )
}

export function useFinanceKpi() {
  return useApiQuery<unknown>(['transactions-kpi'], '/v2/items/transactions')
}

export function useExportTransactions() {
  return useApiMutation<{ url: string }, Record<string, string>>({
    url: '/v2/items/transactions/export',
    method: 'POST',
    successMessage: 'Export initiated',
  })
}
