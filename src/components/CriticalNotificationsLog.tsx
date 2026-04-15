import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type NotificationLog = {
  id: string
  created_at: string
  message: string
  is_read: boolean
  user: {
    full_name: string
    department: string
  }
}

export function CriticalNotificationsLog() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()

    const channelName = `public:notifications_log:${Math.random().toString(36).substring(2)}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `message=ilike.%Critically delayed%`,
        },
        () => {
          fetchLogs()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          created_at,
          message,
          is_read,
          user:user_id (
            full_name,
            department
          )
        `)
        .ilike('message', '%Critically delayed%')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedLogs = (data as any[]).map((item) => ({
        id: item.id,
        created_at: item.created_at,
        message: item.message,
        is_read: item.is_read,
        user: {
          full_name: item.user?.full_name || 'Unknown',
          department: item.user?.department || 'Unknown',
        },
      }))

      setLogs(formattedLogs)
    } catch (err) {
      console.error('Error fetching critical notification logs:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border-red-200 dark:border-red-900/50 shadow-sm animate-fade-in-up">
      <CardHeader className="pb-3 bg-red-50/50 dark:bg-red-950/10 rounded-t-xl border-b border-red-100 dark:border-red-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
            <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-400">
              Critical Delay Alerts Log
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-white dark:bg-slate-900 text-red-600 border-red-200 shadow-sm"
          >
            {logs.length} Recent Alerts
          </Badge>
        </div>
        <CardDescription className="text-red-800/70 dark:text-red-300/70">
          Record of automated alerts sent for tasks delayed by more than 5 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-6 text-center text-slate-500 text-sm animate-pulse">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center justify-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
              <p className="text-sm">No critical delay notifications sent recently.</p>
            </div>
          ) : (
            <div className="divide-y divide-red-100/50 dark:divide-red-900/30">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors flex items-start space-x-4"
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full ${log.is_read ? 'bg-slate-300 dark:bg-slate-700' : 'bg-red-500'} mt-1.5`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-sm ${log.is_read ? 'text-slate-600 dark:text-slate-400' : 'font-medium text-slate-900 dark:text-slate-100'} line-clamp-2`}
                    >
                      {log.message}
                    </p>
                    <div className="flex items-center text-xs text-slate-500 space-x-3">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        To: {log.user.full_name}
                      </span>
                      {log.user.department && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{log.user.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
