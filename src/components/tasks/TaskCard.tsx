import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { format, differenceInDays, startOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, CalendarIcon, CheckCircle2, MessageSquare, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TaskWithWO {
  id: string
  wo_id: string
  task_name: string
  department: string
  sub_department: string | null
  start_date: string | null
  finish_date: string | null
  is_completed: boolean | null
  completion_date: string | null
  comments: string | null
  work_orders: {
    wo_number: string
    customer_name: string
    product_type: string | null
    machine_model: string | null
  }
}

export function TaskCard({ task, onUpdate }: { task: TaskWithWO; onUpdate?: () => void }) {
  const [comment, setComment] = useState(task.comments || '')
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const getDateColor = (finishDateStr: string | null) => {
    if (!finishDateStr) return 'bg-muted text-muted-foreground'
    const finishDate = startOfDay(new Date(finishDateStr))
    const today = startOfDay(new Date())
    const diff = differenceInDays(finishDate, today)

    if (diff < 0) return 'bg-destructive/10 text-destructive border-destructive/20' // delayed
    if (diff <= 2)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' // soon
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' // on time
  }

  const handleSaveComment = async () => {
    setIsSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('wo_tasks')
        .update({ comments: comment })
        .eq('id', task.id)

      if (updateError) throw updateError

      if (comment.trim() && comment !== task.comments) {
        const { error: historyError } = await supabase.from('wo_task_comments_history').insert({
          task_id: task.id,
          comment: comment,
          author_id: user?.id,
        })
        if (historyError) throw historyError
      }

      toast({ title: 'Comentário salvo com sucesso' })
      if (onUpdate) onUpdate()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao salvar comentário', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleComplete = async (checked: boolean) => {
    setIsSaving(true)
    const completionDate = checked ? new Date().toISOString() : null
    try {
      const { error } = await supabase
        .from('wo_tasks')
        .update({
          is_completed: checked,
          completion_date: completionDate,
        })
        .eq('id', task.id)

      if (error) throw error

      toast({ title: checked ? 'Tarefa marcada como concluída' : 'Tarefa reaberta' })
      if (onUpdate) onUpdate()
    } catch (e: any) {
      console.error(e)
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const wo = task.work_orders || ({} as any)

  return (
    <Card className={cn('flex flex-col h-full', task.is_completed && 'opacity-80 bg-muted/30')}>
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {task.task_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              {task.department} {task.sub_department ? `> ${task.sub_department}` : ''}
            </div>
          </div>
          {task.is_completed && (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shrink-0">
              Concluída
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 space-y-4">
        {/* 1. WO Information */}
        <div className="space-y-1.5 p-3 bg-muted/50 rounded-md text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">WO Number:</span>
            <span className="font-semibold">{wo.wo_number || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Customer:</span>
            <span className="font-medium text-right line-clamp-1" title={wo.customer_name}>
              {wo.customer_name || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Family / Model:</span>
            <span className="font-medium text-right">
              {wo.product_type || '-'} / {wo.machine_model || '-'}
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
                  'flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-md border',
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
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Comentários
          </Label>
          <Textarea
            placeholder="Descreva atrasos ou problemas..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
          {comment !== (task.comments || '') && (
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleSaveComment} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                )}
                Salvar Comentário
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/10 flex-col items-start gap-3">
        {/* 5. Checkbox Mark as Complete */}
        <div className="flex items-center space-x-2 w-full">
          <Checkbox
            id={`complete-${task.id}`}
            checked={!!task.is_completed}
            onCheckedChange={(checked) => handleToggleComplete(checked as boolean)}
            disabled={isSaving}
            className="h-5 w-5"
          />
          <Label
            htmlFor={`complete-${task.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
          >
            Task Completed
          </Label>
        </div>

        {/* 6. Completion Date */}
        {task.is_completed && task.completion_date && (
          <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium pl-7 animate-in fade-in slide-in-from-left-2">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Concluído em: {format(new Date(task.completion_date), "dd/MM/yyyy 'às' HH:mm")}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
