import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useNotifications } from '@/hooks/use-notifications'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function GlobalNotificationWatcher() {
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channelName = `public:toast_notifications:${Math.random().toString(36).substring(2)}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as any
          toast.info(newNotif.type, {
            description: newNotif.message,
            duration: 5000,
          })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  if (
    unreadCount === 0 ||
    location.pathname === '/notifications' ||
    location.pathname === '/notificacoes'
  )
    return null

  return (
    <Link
      to="/notifications"
      className="fixed bottom-6 right-6 z-50 animate-fade-in-up hover:scale-105 transition-transform"
    >
      <div className="relative bg-white dark:bg-slate-900 p-4 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
        <Bell className="w-6 h-6" />
        <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.5rem] h-6 flex items-center justify-center bg-red-500 text-white border-2 border-white dark:border-slate-900 rounded-full text-xs font-bold shadow-sm">
          {unreadCount}
        </Badge>
      </div>
    </Link>
  )
}
