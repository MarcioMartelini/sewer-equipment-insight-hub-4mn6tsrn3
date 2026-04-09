import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import {
  Loader2,
  MessageSquare,
  Clock,
  Calendar as CalendarIcon,
  User,
  Save,
  CheckCircle2,
} from 'lucide-react'
import {
  ProductionTask,
  getProductionTaskComments,
  addProductionTaskComment,
  updateProductionStatus,
} from '@/services/production'
import { cn } from '@/lib/utils'

const ST_CFG: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-800' },
  parked: { label: 'Parked', className: 'bg-slate-200 text-slate-800' },
  on_track: { label: 'On Track', className: 'bg-blue-100 text-blue-800' },
  at_risk: { label: 'At Risk', className: 'bg-yellow-100 text-yellow-800' },
  delayed: { label: 'Delayed', className: 'bg-red-100 text-red-800' },
  complete: { label: 'Complete', className: 'bg-emerald-100 text-emerald-800' },
}

interface Props {
  task: ProductionTask | null
  isOpen: boolean
  onClose: () => void
  onTaskUpdated: () => void
}

export function TaskCardModal({ task, isOpen, onClose, onTaskUpdated }: Props) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (task && isOpen) {
      setStatus(task.status || 'not_started')
      fetchComments(task.id)
    }
  }, [task, isOpen])

  const fetchComments = async (id: string) => {
    setLoading(true)
    setComments(await getProductionTaskComments(id))
    setLoading(false)
  }

  const handleSave = async (isCommentOnly = false) => {
    if (!task) return
    setSaving(true)
    if (isCommentOnly && newComment.trim()) {
      await addProductionTaskComment(task.id, newComment.trim(), status)
    } else {
      await updateProductionStatus('all', task.id, status, newComment)
    }
    setNewComment('')
    await fetchComments(task.id)
    onTaskUpdated()
    setSaving(false)
  }

  if (!task) return null
  const isCompleted = status === 'complete' || task.is_completed

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{task.task_name}</span>
            <Badge variant="outline" className={cn('ml-2 font-normal', ST_CFG[status]?.className)}>
              {ST_CFG[status]?.label || status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {task.department} {task.sub_department ? `> ${task.sub_department}` : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
              <div>
                <p className="text-xs text-slate-500 font-medium tracking-wider mb-1">WO NUMBER</p>
                <p className="font-semibold text-slate-900">{task.wo_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium tracking-wider mb-1">CUSTOMER</p>
                <p className="font-medium text-slate-700">{task.customer_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium tracking-wider mb-1">FAMILY</p>
                <p className="font-medium text-slate-700">{task.product_type || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium tracking-wider mb-1">MODEL</p>
                <p className="font-medium text-slate-700">{task.machine_model || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border p-3 rounded-lg flex flex-col items-center bg-white">
                <CalendarIcon className="h-5 w-5 mb-1 text-slate-400" />
                <p className="text-xs text-slate-500 mb-1">Start Date</p>
                <p className="text-sm font-medium">
                  {task.start_date ? format(new Date(task.start_date), 'MMM dd, yyyy') : '-'}
                </p>
              </div>
              <div className="border p-3 rounded-lg flex flex-col items-center bg-white">
                <Clock className="h-5 w-5 mb-1 text-slate-400" />
                <p className="text-xs text-slate-500 mb-1">Finish Date</p>
                <p
                  className={cn(
                    'text-sm',
                    !task.finish_date || isCompleted
                      ? 'text-slate-700'
                      : new Date(task.finish_date) < new Date()
                        ? 'text-red-600 font-bold'
                        : 'text-green-600 font-semibold',
                  )}
                >
                  {task.finish_date ? format(new Date(task.finish_date), 'MMM dd, yyyy') : '-'}
                </p>
              </div>
              <div className="border p-3 rounded-lg flex flex-col items-center bg-white">
                <User className="h-5 w-5 mb-1 text-slate-400" />
                <p className="text-xs text-slate-500 mb-1">Assigned</p>
                <p className="text-sm font-medium">{task.assigned_to_name || 'Unassigned'}</p>
              </div>
            </div>

            {(task.is_completed || isCompleted) && task.completion_date && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center justify-center font-medium">
                <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" /> Completed on{' '}
                {format(new Date(task.completion_date), 'MMM dd, yyyy HH:mm')}
              </div>
            )}

            <div className="bg-white border rounded-lg p-4 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Update Status</label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    disabled={saving || task.is_completed}
                  >
                    <SelectTrigger className={cn('font-medium', ST_CFG[status]?.className)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ST_CFG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleSave()}
                  disabled={saving || status === task.status || task.is_completed}
                  className="w-[120px]"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium text-slate-700">Add Comment</label>
                <Textarea
                  placeholder={
                    task.is_completed
                      ? 'Task is completed. Comments are read-only.'
                      : 'Type your comment or status update reason...'
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={saving || task.is_completed}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => handleSave(true)}
                    disabled={saving || !newComment.trim() || task.is_completed}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Post Comment
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold flex items-center text-slate-900">
                <MessageSquare className="h-4 w-4 mr-2 text-slate-500" /> History & Comments
              </h4>
              {loading ? (
                <Loader2 className="animate-spin mx-auto text-slate-400 my-4" />
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center p-4 bg-slate-50 border border-dashed rounded-lg">
                  No comments or history yet.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 rounded-lg p-3 border text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-900">{c.author_name}</span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(c.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{c.comment}</p>
                    {c.status && (
                      <Badge
                        variant="outline"
                        className={cn('mt-2 text-xs font-normal', ST_CFG[c.status]?.className)}
                      >
                        Status: {ST_CFG[c.status]?.label}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
