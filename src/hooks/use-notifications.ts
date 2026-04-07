import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type Notification = {
  id: string
  user_id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setNotifications(data as Notification[])
        setUnreadCount(data.filter((n: any) => !n.is_read).length)
      }
    }

    fetchNotifications()

    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))

    await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('id', id)
  }

  const markAllAsRead = async () => {
    if (!user) return

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
