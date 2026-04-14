import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { format, differenceInDays, startOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  Loader2,
  CalendarIcon,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductionTask } from '@/services/production'

export function ProductionTaskCard({
  task,
  onUpdate,
}: {
  task: ProductionTask
  onUpdate?: () => void
}) {
  const [newComment, setNewComment] = useState('')
  const [commentsList, setCommentsList] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    newStatus: string
  } | null>(null)
  const [statusComment, setStatusComment] = useState('')

  const [localTask, setLocalTask] = useState<ProductionTask>(task)

  useEffect(() => {
    setLocalTask(task)
  }, [task])

  const { user } = useAuth()
  const { toast } = useToast()

  const isDelayed =
    !!localTask.finish_date &&
    differenceInDays(startOfDay(new Date()), startOfDay(new Date(localTask.finish_date))) > 0 &&
    !localTask.is_completed

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('production_task_comments_history')
      .select('*, author:users(full_name)')
      .eq('task_id', localTask.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCommentsList(data)
    }
  }, [localTask.id])

  useEffect(() => {
    loadComments()

    const checkAdmin = async () => {
      const { data } = await supabase.rpc('get_user_role')
      setIsAdmin(data === 'admin')
    }
    checkAdmin()
  }, [loadComments])

  const getDateColor = (finishDateStr: string | null) => {
    if (!finishDateStr) return 'bg-muted text-muted-foreground'
    const finishDate = startOfDay(new Date(finishDateStr))
    const today = startOfDay(new Date())
    const diff = differenceInDays(finishDate, today)

    if (diff < 0) return 'bg-destructive/10 text-destructive border-destructive/20'
    if (diff <= 2)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('production_task_comments_history').insert({
        task_id: localTask.id,
        comment: newComment.trim(),
        author_id: user?.id,
      })
      if (error) throw error

      toast({ title: 'Comment added successfully' })
      setNewComment('')
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Error adding comment', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('production_task_comments_history')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Comment deleted' })
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Error deleting comment', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditComment = async (id: string) => {
    if (!editContent.trim()) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('production_task_comments_history')
        .update({
          comment: editContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Comment updated' })
      setEditingCommentId(null)
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Error updating comment', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const currentStatusValue = (() => {
    if (!localTask.status) return 'not_started'
    const s = localTask.status.toLowerCase()
    if (s === 'pending' || s === 'not started' || s === 'not_started') return 'not_started'
    if (s === 'in process' || s === 'in progress' || s === 'on track' || s === 'on_track')
      return 'on_track'
    if (s === 'completed' || s === 'complete') return 'complete'
    if (s === 'at risk' || s === 'at_risk') return 'at_risk'
    if (['parked', 'delayed'].includes(s)) return s
    return 'not_started'
  })()

  const formatStatus = (s: string) => {
    if (s === 'not_started') return 'Not Started'
    if (s === 'on_track') return 'On Track'
    if (s === 'at_risk') return 'At Risk'
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
      case 'parked':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300'
      case 'on_track':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300'
      case 'at_risk':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300'
      case 'complete':
        return 'bg-green-200 text-green-900 border-green-300 dark:bg-green-900/70 dark:text-green-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatusValue) return

    if (newStatus === 'parked' || newStatus === 'at_risk') {
      setConfirmModal({ isOpen: true, newStatus })
      setStatusComment('')
    } else {
      executeStatusChange(newStatus)
    }
  }

  const executeStatusChange = async (newStatus: string, statusReason?: string) => {
    setIsSaving(true)
    const isCompleted = newStatus === 'complete'
    const completionDate = isCompleted ? new Date().toISOString() : null

    const oldStatusFormatted = formatStatus(currentStatusValue)
    const newStatusFormatted = formatStatus(newStatus)

    // Optimistic Update
    setLocalTask((prev) => ({
      ...prev,
      status: newStatus,
      is_completed: isCompleted,
      completion_date: completionDate,
    }))

    try {
      const { error } = await supabase
        .from('production_tasks')
        .update({
          status: newStatus as any,
          is_completed: isCompleted,
          completion_date: completionDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', localTask.id)

      if (error) throw error

      let finalComment = `Status changed from ${oldStatusFormatted} to ${newStatusFormatted}`
      if (statusReason) {
        finalComment += `. Reason: ${statusReason}`
      }

      await supabase.from('production_task_comments_history').insert({
        task_id: localTask.id,
        comment: finalComment,
        author_id: user?.id,
        status: newStatus as any,
        created_at: new Date().toISOString(),
      })

      if (isCompleted) {
        await supabase.from('production_task_comments_history').insert({
          task_id: localTask.id,
          comment: 'Task marked as completed',
          author_id: user?.id,
          status: newStatus as any,
          created_at: new Date().toISOString(),
        })
      }

      toast({ title: `Status updated to ${newStatusFormatted}` })
      if (onUpdate) onUpdate()
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Error updating status', variant: 'destructive' })
      // Revert optimistic update
      setLocalTask(task)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'flex flex-col shrink-0 h-fit min-h-min transition-all duration-300',
          localTask.is_completed && 'opacity-80 bg-muted/30 border-emerald-500/20',
        )}
      >
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {localTask.task_name}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-2 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {localTask.department}{' '}
                  {localTask.sub_department ? `> ${localTask.sub_department}` : ''}
                </div>
                {localTask.assigned_to_name && (
                  <div className="flex items-center gap-1.5 text-xs mt-0.5">
                    Assigned to: <span className="font-medium">{localTask.assigned_to_name}</span>
                  </div>
                )}
              </div>
            </div>
            {localTask.is_completed && (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* 1. WO Information */}
          <div className="space-y-1.5 p-3 bg-muted/50 rounded-md text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">WO Number:</span>
              <span className="font-semibold">{localTask.wo_number || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Customer:</span>
              <span className="font-medium text-right line-clamp-1" title={localTask.customer_name}>
                {localTask.customer_name || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Family / Model:</span>
              <span className="font-medium text-right">
                {localTask.product_type || '-'} / {localTask.machine_model || '-'}
              </span>
            </div>
          </div>

          {/* 3. Scheduled Dates */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Schedule
            </Label>{' '}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Start Date</span>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {localTask.start_date
                    ? format(new Date(localTask.start_date), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Finish Date</span>
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-md border w-fit',
                    getDateColor(localTask.finish_date),
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {localTask.finish_date
                    ? format(new Date(localTask.finish_date), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Comments Field */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Comments
            </Label>
            <div className="space-y-2">
              <Textarea
                placeholder="Type your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={cn(
                  'min-h-[80px] resize-none text-sm transition-colors',
                  localTask.is_completed && 'bg-muted/50 cursor-not-allowed',
                )}
                disabled={isSaving}
                readOnly={!!localTask.is_completed}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddComment}
                  disabled={isSaving || !newComment.trim() || !!localTask.is_completed}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Add Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {commentsList.length > 0 && (
              <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2">
                {commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2 bg-muted/50 rounded-md text-sm border space-y-1"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 mt-1">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] text-sm"
                              disabled={isSaving}
                            />
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setEditingCommentId(null)}
                                disabled={isSaving}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="default"
                                className="h-6 w-6"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={isSaving || !editContent.trim()}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium text-xs text-muted-foreground mr-1">
                              {comment.author?.full_name || 'System'} -{' '}
                              {comment.created_at
                                ? format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')
                                : ''}
                              :
                            </span>
                            <span
                              className={cn(
                                'text-foreground whitespace-pre-wrap',
                                comment.comment === 'Task marked as completed' &&
                                  'text-emerald-600 font-medium italic',
                                comment.comment.startsWith('Status changed from') &&
                                  'text-muted-foreground font-medium italic',
                              )}
                            >
                              {comment.comment}
                            </span>
                            {comment.updated_at && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                (Edited)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {user?.id === comment.author_id &&
                          !localTask.is_completed &&
                          editingCommentId !== comment.id &&
                          comment.comment !== 'Task marked as completed' &&
                          !comment.comment.startsWith('Status changed from') && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditContent(comment.comment)
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit comment"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        {isAdmin &&
                          !localTask.is_completed &&
                          comment.comment !== 'Task marked as completed' &&
                          !comment.comment.startsWith('Status changed from') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>{' '}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t bg-muted/10 flex-col items-start gap-3">
          {/* 5. Status Selection */}
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Status:</Label>
              <Select
                value={currentStatusValue}
                onValueChange={handleStatusChange}
                disabled={isSaving}
              >
                <SelectTrigger
                  className={cn(
                    'w-[150px] h-8 text-sm font-medium transition-colors',
                    getStatusColor(currentStatusValue),
                  )}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      Not Started
                    </div>
                  </SelectItem>
                  <SelectItem value="parked">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Parked
                    </div>
                  </SelectItem>
                  <SelectItem value="on_track">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      On Track
                    </div>
                  </SelectItem>
                  <SelectItem value="at_risk">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      At Risk
                    </div>
                  </SelectItem>
                  <SelectItem value="delayed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Delayed
                    </div>
                  </SelectItem>
                  <SelectItem value="complete">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      Complete
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isDelayed && (
              <Badge
                variant="destructive"
                className="shrink-0 bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0 h-5"
              >
                Task Delayed
              </Badge>
            )}
          </div>

          {/* 6. Completion Date */}
          {localTask.is_completed && localTask.completion_date && (
            <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in slide-in-from-left-2 mt-1 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md border border-emerald-100 dark:border-emerald-900/50 w-full justify-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
              Completed on {format(new Date(localTask.completion_date), 'dd/MM/yyyy HH:mm')}
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog
        open={confirmModal?.isOpen || false}
        onOpenChange={(open) => !open && !isSaving && setConfirmModal(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Justification Required</DialogTitle>
            <DialogDescription>
              Please provide a reason for changing the status to{' '}
              <strong className="text-slate-900 font-bold">
                {confirmModal?.newStatus ? formatStatus(confirmModal.newStatus) : ''}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter your justification here..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="min-h-[120px] resize-none focus-visible:ring-indigo-500"
              disabled={isSaving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (confirmModal && statusComment.trim()) {
                  await executeStatusChange(confirmModal.newStatus, statusComment)
                  setConfirmModal(null)
                  setStatusComment('')
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={!statusComment.trim() || isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
