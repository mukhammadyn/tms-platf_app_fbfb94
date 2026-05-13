import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import type { Bid } from '@/types'

export function useBids() {
  return useApiQuery<unknown>(['bids'], '/v2/items/bids')
}

export function useBid(id: string) {
  return useApiQuery<unknown>(['bids', id], '/v2/items/bids/' + id, undefined, {
    enabled: !!id,
  })
}

export function useCreateBid() {
  return useApiMutation<Bid, Partial<Bid>>({
    url: '/v2/items/bids',
    method: 'POST',
    successMessage: 'Bid submitted successfully',
    invalidateKeys: [['bids']],
  })
}

export function useAcceptBid() {
  return useApiMutation<Bid, { guid: string; status: string }>({
    url: '/v2/items/bids',
    method: 'PUT',
    successMessage: 'Bid accepted',
    invalidateKeys: [['bids'], ['orders']],
  })
}

export function useRejectBid() {
  return useApiMutation<Bid, { guid: string; status: string }>({
    url: '/v2/items/bids',
    method: 'PUT',
    successMessage: 'Bid rejected',
    invalidateKeys: [['bids']],
  })
}
