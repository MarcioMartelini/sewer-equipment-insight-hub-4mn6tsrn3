import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { addDays, isBefore, startOfDay, parseISO } from 'date-fns'

export type Notification = {
  id: string
  user_id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

export type TaskAlert = {
  id: string
  task_name: string
  wo_id: string
  wo_number: string
  finish_date: string
  status: string
  is_overdue: boolean
  is_due_soon: boolean
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [taskAlerts, setTaskAlerts] = useState<TaskAlert[]>([])
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
      }
    }

    const fetchTaskAlerts = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('department, role')
        .eq('id', user.id)
        .single()

      let query = supabase
        .from('wo_tasks')
        .select(`
          id,
          task_name,
          finish_date,
          status,
          wo_id,
          work_orders (
            wo_number
          )
        `)
        .in('status', ['Pending', 'In Progress'])
        .not('finish_date', 'is', null)

      if (userData?.role !== 'admin' && userData?.department) {
        query = query.eq('department', userData.department)
      }

      const { data } = await query

      if (data) {
        const today = startOfDay(new Date())

        const alerts = data
          .map((task: any) => {
            const finishDate = startOfDay(parseISO(task.finish_date))
            const isOverdue = isBefore(finishDate, today)
            const isDueSoon = !isOverdue && isBefore(finishDate, addDays(today, 2))

            return {
              id: task.id,
              task_name: task.task_name,
              wo_id: task.wo_id,
              wo_number: task.work_orders?.wo_number || '',
              finish_date: task.finish_date,
              status: task.status,
              is_overdue: isOverdue,
              is_due_soon: isDueSoon,
            }
          })
          .filter((t: TaskAlert) => t.is_overdue || t.is_due_soon)

        setTaskAlerts(alerts)
      }
    }

    fetchNotifications()
    fetchTaskAlerts()

    const channelName = `public:notifications:${Math.random().toString(36).substring(2)}`
    const subscription = supabase
      .channel(channelName)
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wo_tasks',
        },
        () => {
          fetchTaskAlerts()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  useEffect(() => {
    const unreadDb = notifications.filter((n) => !n.is_read).length
    setUnreadCount(unreadDb + taskAlerts.length)
  }, [notifications, taskAlerts])

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('id', id)
  }

  const markAllAsRead = async () => {
    if (!user) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  return { notifications, taskAlerts, unreadCount, markAsRead, markAllAsRead }
}
