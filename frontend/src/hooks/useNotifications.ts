import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Notification {
  id: number
  type: 'challenge' | 'like' | 'group_invite'
  title: string
  body: string | null
  payload: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications')
  return data
}

async function markAllRead(): Promise<{ marked: number }> {
  const { data } = await api.post<{ marked: number }>('/notifications/read-all')
  return data
}

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 20_000,
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const { mutate: markAllReadMutate } = useMutation({
    mutationFn: markAllRead,
    onMutate: () => {
      // Optimistic update: clear badge immediately before server responds
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        (prev ?? []).map((n) => ({ ...n, is_read: true }))
      )
    },
  })

  return {
    notifications,
    unreadCount,
    markAllRead: markAllReadMutate,
  }
}
