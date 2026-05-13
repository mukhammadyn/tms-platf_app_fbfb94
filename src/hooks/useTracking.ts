import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList } from '@/lib/apiUtils'
import type { TrackingUpdate, Vehicle } from '@/types'

export function useTracking(orderId?: string) {
  return useApiQuery<unknown>(
    ['tracking', orderId ?? 'all'],
    orderId ? `/v2/items/tracking?orders_id=${orderId}` : '/v2/items/tracking'
  )
}

export function useTrackingUpdates(orderId?: string) {
  return useApiQuery<unknown>(
    ['tracking-updates', orderId ?? 'all'],
    orderId ? `/v2/items/tracking?orders_id=${orderId}` : '/v2/items/tracking'
  )
}

export function useAddTrackingUpdate() {
  return useApiMutation<TrackingUpdate, Partial<TrackingUpdate>>({
    url: '/v2/items/tracking',
    method: 'POST',
    successMessage: 'Tracking update added successfully',
    invalidateKeys: [['tracking'], ['tracking-updates']],
  })
}

export function useLiveVehicles() {
  return useApiQuery<unknown>(
    ['live-vehicles'],
    '/v2/items/vehicles',
    undefined,
    { refetchInterval: 30000 }
  )
}
