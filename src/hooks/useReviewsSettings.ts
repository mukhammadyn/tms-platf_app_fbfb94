import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import type { Review, User } from '@/types'

export function useReviews() {
  return useApiQuery<unknown>(['reviews'], '/v2/items/reviews')
}

export function useReview(id: string) {
  return useApiQuery<unknown>(
    ['reviews', id],
    '/v2/items/reviews/' + id,
    undefined,
    { enabled: !!id }
  )
}

export function useToggleReviewVisibility() {
  return useApiMutation<Review, { guid: string; is_public: boolean }>({
    url: '/v2/items/reviews',
    method: 'PUT',
    successMessage: 'Review visibility updated',
    invalidateKeys: [['reviews']],
  })
}

export function useUpdateProfile() {
  return useApiMutation<User, Partial<User>>({
    url: '/v2/items/users',
    method: 'PUT',
    successMessage: 'Profile updated successfully',
    invalidateKeys: [['users']],
  })
}

export function useChangePassword() {
  return useApiMutation<User, { guid: string; password: string }>({
    url: '/v2/items/users',
    method: 'PUT',
    successMessage: 'Password changed successfully',
    invalidateKeys: [['users']],
  })
}

export function useSystemSettings() {
  return useApiQuery<unknown>(['system-settings'], '/v2/items/users', {
    params: { limit: 1 },
  })
}

export function useIntegrationSettings() {
  return useApiQuery<unknown>(['integration-settings'], '/v2/items/users', {
    params: { limit: 1 },
  })
}
