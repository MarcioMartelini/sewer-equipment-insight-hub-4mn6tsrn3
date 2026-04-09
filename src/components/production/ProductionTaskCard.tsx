import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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

  const { user } = useAuth()
  const { toast } = useToast()

  const isDelayed =
    !!task.finish_date &&
    differenceInDays(startOfDay(new Date()), startOfDay(new Date(task.finish_date))) > 0 &&
    !task.is_completed

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('production_task_comments_history')
      .select('*, author:users(full_name)')
      .eq('task_id', task.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCommentsList(data)
    }
  }, [task.id])

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
        task_id: task.id,
        comment: newComment.trim(),
        author_id: user?.id,
      })
      if (error) throw error

      toast({ title: 'Comentário adicionado com sucesso' })
      setNewComment('')
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao adicionar comentário', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('production_task_comments_history')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Comentário deletado' })
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao deletar comentário', variant: 'destructive' })
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
      toast({ title: 'Comentário atualizado' })
      setEditingCommentId(null)
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao atualizar comentário', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const currentStatusValue = (() => {
    if (!task.status) return 'not_started'
    const s = task.status.toLowerCase()
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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatusValue) return

    setIsSaving(true)
    const isCompleted = newStatus === 'complete'
    const completionDate = isCompleted ? new Date().toISOString() : null

    try {
      const { error } = await supabase
        .from('production_tasks')
        .update({
          status: newStatus as any,
          is_completed: isCompleted,
          completion_date: completionDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)

      if (error) throw error

      const oldStatusFormatted = formatStatus(currentStatusValue)
      const newStatusFormatted = formatStatus(newStatus)

      await supabase.from('production_task_comments_history').insert({
        task_id: task.id,
        comment: `Status changed from ${oldStatusFormatted} to ${newStatusFormatted}`,
        author_id: user?.id,
        status: newStatus as any,
        created_at: new Date().toISOString(),
      })

      toast({ title: `Status atualizado para ${newStatusFormatted}` })
      if (onUpdate) onUpdate()
      loadComments()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      className={cn(
        'flex flex-col shrink-0 h-fit min-h-min',
        task.is_completed && 'opacity-80 bg-muted/30',
      )}
    >
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {task.task_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {task.department} {task.sub_department ? `> ${task.sub_department}` : ''}
              </div>
              {task.assigned_to_name && (
                <div className="flex items-center gap-1.5 text-xs mt-0.5">
                  Responsável: <span className="font-medium">{task.assigned_to_name}</span>
                </div>
              )}
            </div>
          </div>
          {task.is_completed && (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
              Concluída
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 1. WO Information */}
        <div className="space-y-1.5 p-3 bg-muted/50 rounded-md text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">WO Number:</span>
            <span className="font-semibold">{task.wo_number || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Customer:</span>
            <span className="font-medium text-right line-clamp-1" title={task.customer_name}>
              {task.customer_name || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Family / Model:</span>
            <span className="font-medium text-right">
              {task.product_type || '-'} / {task.machine_model || '-'}
            </span>
          </div>
        </div>

        {/* 3. Scheduled Dates */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Cronograma
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start Date</span>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {task.start_date ? format(new Date(task.start_date), 'dd/MM/yyyy') : '-'}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Finish Date</span>
              <div
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-md border w-fit',
                  getDateColor(task.finish_date),
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {task.finish_date ? format(new Date(task.finish_date), 'dd/MM/yyyy') : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Comments Field */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Comentários
          </Label>
          <div className="space-y-2">
            <Textarea
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
              disabled={isSaving || !!task.is_completed}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddComment}
                disabled={isSaving || !newComment.trim() || !!task.is_completed}
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
                            {comment.author?.full_name || 'Sistema'} -{' '}
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
                              (Editado)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {user?.id === comment.author_id &&
                        !task.is_completed &&
                        editingCommentId !== comment.id &&
                        comment.comment !== 'Task marked as completed' &&
                        !comment.comment.startsWith('Status changed from') && (
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id)
                              setEditContent(comment.comment)
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Editar comentário"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      {isAdmin &&
                        !task.is_completed &&
                        comment.comment !== 'Task marked as completed' &&
                        !comment.comment.startsWith('Status changed from') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Excluir comentário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
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
        {task.is_completed && task.completion_date && (
          <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in slide-in-from-left-2 mt-1">
            <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
            Completed on {format(new Date(task.completion_date), 'dd/MM/yyyy HH:mm')}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
