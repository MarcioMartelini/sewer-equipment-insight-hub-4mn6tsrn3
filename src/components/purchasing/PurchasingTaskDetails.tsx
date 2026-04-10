import { useState, useEffect, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, isPast, isToday } from 'date-fns'
import { Calendar, Package, Building2, Wrench, Send, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const STATUSES = ['not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete']
const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-200 text-slate-800',
  parked: 'bg-slate-500 text-white',
  on_track: 'bg-blue-500 text-white',
  at_risk: 'bg-amber-500 text-white',
  delayed: 'bg-rose-500 text-white',
  complete: 'bg-emerald-500 text-white',
}
const formatStatus = (s: string) =>
  s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function PurchasingTaskDetails({ task, onClose, onUpdate }: any) {
  const { user } = useAuth()
  const [details, setDetails] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!task?.id) return
    const [taskRes, commentsRes] = await Promise.all([
      supabase
        .from('purchasing_tasks')
        .select(`
        *,
        work_orders(wo_number, customer_name, product_type, machine_model),
        users!purchasing_tasks_assigned_to_fkey(full_name, avatar_url)
      `)
        .eq('id', task.id)
        .single(),
      supabase
        .from('purchasing_task_comments_history')
        .select(`
        id, comment, created_at,
        users!purchasing_task_comments_history_author_fkey(full_name, avatar_url)
      `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false }),
    ])
    if (taskRes.data) setDetails(taskRes.data)
    if (commentsRes.data) setComments(commentsRes.data)
  }, [task?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (val: string) => {
    const isComplete = val === 'complete'
    const updates = {
      status: val,
      is_completed: isComplete,
      completion_date: isComplete ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('purchasing_tasks').update(updates).eq('id', task.id)
    fetchData()
    onUpdate?.()
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    await supabase.from('purchasing_task_comments_history').insert({
      task_id: task.id,
      comment: newComment.trim(),
      author: user?.id,
    })
    setNewComment('')
    fetchData()
    onUpdate?.()
    setLoading(false)
  }

  if (!task || !details) return null

  const d = details
  const wo = d.work_orders || {}
  const u = d.users || {}
  const isLate =
    d.finish_date &&
    isPast(new Date(d.finish_date)) &&
    !isToday(new Date(d.finish_date)) &&
    d.status !== 'complete'

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl leading-tight">{d.component_name}</SheetTitle>
              <SheetDescription className="text-base mt-1">
                Work Order: {wo.wo_number || '-'}
              </SheetDescription>
            </div>
            <Select value={d.status} onValueChange={handleStatusChange}>
              <SelectTrigger
                className={cn(
                  'w-[140px] h-8 text-xs font-semibold border-0',
                  STATUS_COLORS[d.status],
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs font-medium">
                    {formatStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> WO Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">Customer</div>
                  <div className="font-medium text-sm">{wo.customer_name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Product Family</div>
                  <div className="font-medium text-sm">{wo.product_type || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Machine Model</div>
                  <div className="font-medium text-sm">{wo.machine_model || '-'}</div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4" /> Task Details
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">Supplier</div>
                  <div className="font-medium text-sm">{d.supplier || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Assigned To</div>
                  <div className="font-medium text-sm">{u.full_name || 'Unassigned'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Quantity</div>
                  <div className="font-medium text-sm">{d.quantity || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Unit Price</div>
                  <div className="font-medium text-sm">
                    {d.unit_price ? formatMoney(d.unit_price) : '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Total Price</div>
                  <div className="font-medium text-sm">
                    {d.total_price ? formatMoney(d.total_price) : '-'}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Scheduled Dates
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground">Start Date</div>
                  <div className="font-medium text-sm">
                    {d.start_date ? format(new Date(d.start_date), 'MMM dd, yyyy') : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Finish Date</div>
                  <div
                    className={cn(
                      'font-medium text-sm flex items-center gap-1',
                      isLate && 'text-rose-600',
                    )}
                  >
                    {d.finish_date ? format(new Date(d.finish_date), 'MMM dd, yyyy') : '-'}
                    {isLate && <AlertCircle className="w-3 h-3" />}
                  </div>
                </div>
                {d.completion_date && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Completion Date</div>
                    <div className="font-medium text-sm text-emerald-600">
                      {format(new Date(d.completion_date), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Comments & History
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none min-h-[80px]"
                  />
                  <Button
                    size="icon"
                    className="shrink-0"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-muted/30 p-3 rounded-md text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {c.users?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(c.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap">{c.comment}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No comments yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
