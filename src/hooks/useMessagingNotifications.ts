import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { extractList, extractSingle, extractCount } from '@/lib/apiUtils'
import type { Message, Notification } from '@/types'

export function useMessages() {
  return useApiQuery<unknown>(['messages'], '/v2/items/messages')
}

export function useMessage(id: string) {
  return useApiQuery<unknown>(
    ['messages', id],
    '/v2/items/messages/' + id,
    undefined,
    { enabled: !!id }
  )
}

export function useSendMessage() {
  return useApiMutation<Message, Partial<Message>>({
    url: '/v2/items/messages',
    method: 'POST',
    successMessage: 'Message sent successfully',
    invalidateKeys: [['messages']],
  })
}

export function useMarkMessageRead() {
  return useApiMutation<Message, { guid: string; is_read: boolean }>({
    url: '/v2/items/messages',
    method: 'PUT',
    successMessage: 'Message marked as read',
    invalidateKeys: [['messages']],
  })
}

export function useNotifications() {
  return useApiQuery<unknown>(['notifications'], '/v2/items/notifications')
}

export function useMarkAllNotificationsRead() {
  return useApiMutation<void, void>({
    url: '/v2/items/notifications',
    method: 'PUT',
    successMessage: 'All notifications marked as read',
    invalidateKeys: [['notifications']],
  })
}

export function useUnreadCount() {
  const messagesQuery = useApiQuery<unknown>(['messages'], '/v2/items/messages')
  const notificationsQuery = useApiQuery<unknown>(['notifications'], '/v2/items/notifications')

  const messages = extractList<Message>(messagesQuery.data)
  const notifications = extractList<Notification>(notificationsQuery.data)

  const unreadMessages = messages.filter((m) => !m.is_read).length
  const unreadNotifications = notifications.filter((n) => !n.is_read).length

  return {
    unreadMessages,
    unreadNotifications,
    total: unreadMessages + unreadNotifications,
    isLoading: messagesQuery.isLoading || notificationsQuery.isLoading,
  }
}
