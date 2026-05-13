import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle, extractCount } from '@/lib/apiUtils'
import type { Order } from '@/types'

export function useOrders(params?: { status?: string; order_type?: string }) {
  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.set('status', params.status)
  if (params?.order_type) queryParams.set('order_type', params.order_type)
  const qs = queryParams.toString()
  return useApiQuery<unknown>(['orders', params], `/v2/items/orders${qs ? '?' + qs : ''}`)
}

export function useOrder(id: string) {
  return useApiQuery<unknown>(['orders', id], `/v2/items/orders/${id}`, undefined, {
    enabled: !!id,
  })
}

export function useCreateOrder() {
  return useApiMutation<Order, Partial<Order>>({
    url: '/v2/items/orders',
    method: 'POST',
    successMessage: 'Order created successfully',
    invalidateKeys: [['orders']],
  })
}

export function useUpdateOrder() {
  return useApiMutation<Order, Partial<Order>>({
    url: '/v2/items/orders',
    method: 'PUT',
    successMessage: 'Order updated successfully',
    invalidateKeys: [['orders']],
  })
}

export function useCancelOrder() {
  return useApiMutation<Order, Partial<Order>>({
    url: '/v2/items/orders',
    method: 'PUT',
    successMessage: 'Order cancelled',
    invalidateKeys: [['orders']],
  })
}
