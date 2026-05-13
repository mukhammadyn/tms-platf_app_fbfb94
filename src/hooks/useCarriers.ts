import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import type { CarrierProfile } from '@/types'

export function useCarriers() {
  return useApiQuery<unknown>(['carrier_profiles'], '/v2/items/carrier_profiles')
}

export function useCarrier(id: string) {
  return useApiQuery<unknown>(
    ['carrier_profiles', id],
    `/v2/items/carrier_profiles/${id}`,
    undefined,
    { enabled: !!id }
  )
}

export function useVerifyCarrier() {
  return useApiMutation<CarrierProfile, Partial<CarrierProfile>>({
    url: '/v2/items/carrier_profiles',
    method: 'PUT',
    successMessage: 'Carrier verified successfully',
    invalidateKeys: [['carrier_profiles']],
  })
}

export function useSuspendCarrier() {
  return useApiMutation<CarrierProfile, Partial<CarrierProfile>>({
    url: '/v2/items/carrier_profiles',
    method: 'PUT',
    successMessage: 'Carrier suspended',
    invalidateKeys: [['carrier_profiles']],
  })
}

export function useUpdateCarrierProfile() {
  return useApiMutation<CarrierProfile, Partial<CarrierProfile>>({
    url: '/v2/items/carrier_profiles',
    method: 'PUT',
    successMessage: 'Carrier profile updated',
    invalidateKeys: [['carrier_profiles']],
  })
}
