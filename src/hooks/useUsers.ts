import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle } from '@/lib/apiUtils'
import type { User } from '@/types'

export function useUsers() {
  return useApiQuery<unknown>(['users'], '/v2/items/users')
}

export function useUser(id: string) {
  return useApiQuery<unknown>(['users', id], '/v2/items/users/' + id, undefined, {
    enabled: !!id,
  })
}

export function useCreateUser() {
  return useApiMutation<User, Partial<User> & { login: string; password: string; email: string; role_id: string; client_type_id: string }>({
    url: '/v2/items/users',
    method: 'POST',
    successMessage: 'User created successfully',
    invalidateKeys: [['users']],
  })
}

export function useUpdateUser() {
  return useApiMutation<User, Partial<User> & { guid: string }>({
    url: '/v2/items/users',
    method: 'PUT',
    successMessage: 'User updated successfully',
    invalidateKeys: [['users']],
  })
}

export function useToggleUserStatus() {
  return useApiMutation<User, { guid: string; status: string }>({
    url: '/v2/items/users',
    method: 'PUT',
    successMessage: 'User status updated',
    invalidateKeys: [['users']],
  })
}
