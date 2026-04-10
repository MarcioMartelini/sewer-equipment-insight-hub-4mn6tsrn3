import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Database } from '@/lib/supabase/types'

type PurchasingTask = Database['public']['Tables']['purchasing_tasks']['Row']

type TaskWithRelations = PurchasingTask & {
  work_orders: { wo_number: string } | null
  users: { full_name: string; avatar_url: string | null } | null
}

const COLUMNS = [
  { id: 'not_started', label: 'Not Started', dot: 'bg-slate-400' },
  { id: 'parked', label: 'Parked', dot: 'bg-purple-500' },
  { id: 'on_track', label: 'On Track', dot: 'bg-blue-500' },
  { id: 'at_risk', label: 'At Risk', dot: 'bg-amber-500' },
  { id: 'delayed', label: 'Delayed', dot: 'bg-red-500' },
  { id: 'complete', label: 'Complete', dot: 'bg-emerald-500' },
]

export default function PurchasingKanbanTab({ woFilter }: { woFilter: string }) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')

  const [suppliers, setSuppliers] = useState<string[]>([])
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    loadData()
  }, [woFilter, supplierFilter, assigneeFilter])

  const fetchFilters = async () => {
    const { data } = await supabase
      .from('purchasing_tasks')
      .select('supplier, users!purchasing_tasks_assigned_to_fkey(id, full_name)')

    if (data) {
      const uniqueSuppliers = Array.from(
        new Set(data.map((d) => d.supplier).filter(Boolean)),
      ) as string[]

      const uniqueAssigneesMap = new Map()
      data.forEach((d: any) => {
        if (d.users) {
          const user = Array.isArray(d.users) ? d.users[0] : d.users
          if (user) {
            uniqueAssigneesMap.set(user.id, user.full_name)
          }
        }
      })

      setSuppliers(uniqueSuppliers)
      setAssignees(Array.from(uniqueAssigneesMap.entries()).map(([id, name]) => ({ id, name })))
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('purchasing_tasks')
        .select(`
          *,
          work_orders!inner ( wo_number ),
          users!purchasing_tasks_assigned_to_fkey ( id, full_name, avatar_url )
        `)
        .order('created_at', { ascending: false })

      if (woFilter) {
        query = query.ilike('work_orders.wo_number', `%${woFilter}%`)
      }
      if (supplierFilter !== 'all') {
        query = query.eq('supplier', supplierFilter)
      }
      if (assigneeFilter !== 'all') {
        query = query.eq('assigned_to', assigneeFilter)
      }

      const { data, error } = await query
      if (error) throw error

      const formattedTasks = (data as any[]).map((task) => ({
        ...task,
        users: Array.isArray(task.users) ? task.users[0] : task.users,
        work_orders: Array.isArray(task.work_orders) ? task.work_orders[0] : task.work_orders,
      }))

      setTasks(formattedTasks)
    } catch (error: any) {
      toast({ title: 'Error loading tasks', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const taskToUpdate = tasks.find((t) => t.id === taskId)
    if (!taskToUpdate || taskToUpdate.status === newStatus) return

    // Optimistic UI Update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)))

    try {
      const isComplete = newStatus === 'complete'
      const { error } = await supabase
        .from('purchasing_tasks')
        .update({
          status: newStatus as any,
          is_completed: isComplete,
          completion_date: isComplete ? new Date().toISOString() : null,
        })
        .eq('id', taskId)

      if (error) throw error
      toast({ title: 'Task status updated' })
    } catch (error: any) {
      toast({ title: 'Error updating task', description: error.message, variant: 'destructive' })
      loadData() // Revert
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-md border bg-muted/20 p-4">
        <div className="flex h-full min-w-max gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="flex h-full w-80 flex-col rounded-xl bg-muted/50 p-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', col.dot)} />
                  <h3 className="font-semibold text-sm text-foreground/80">{col.label}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full bg-background shadow-sm">
                  {tasks.filter((t) => t.status === col.id).length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 scrollbar-thin">
                {loading && tasks.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground mt-4">Loading...</div>
                ) : (
                  tasks
                    .filter((t) => t.status === col.id)
                    .map((task) => (
                      <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} />
                    ))
                )}
                {!loading && tasks.filter((t) => t.status === col.id).length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
                    <span className="text-xs text-muted-foreground">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KanbanCard({
  task,
  onDragStart,
}: {
  task: TaskWithRelations
  onDragStart: (e: React.DragEvent, id: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group relative cursor-grab active:cursor-grabbing rounded-lg border bg-card p-3.5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-snug line-clamp-2">{task.component_name}</h4>
        <Badge variant="outline" className="shrink-0 text-[10px] font-medium bg-muted/50">
          {task.work_orders?.wo_number}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        {task.supplier && (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{task.supplier}</span>
          </div>
        )}
        {(task.start_date || task.finish_date) && (
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {task.start_date ? format(new Date(task.start_date), 'MMM d') : '--'} -{' '}
              {task.finish_date ? format(new Date(task.finish_date), 'MMM d') : '--'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="text-[10px] font-medium text-muted-foreground">
          {task.status === 'complete' ? '100% Progress' : '0% Progress'}
        </div>
        <Avatar className="h-6 w-6 border bg-muted">
          <AvatarImage src={task.users?.avatar_url || ''} />
          <AvatarFallback className="text-[9px] font-medium">
            {task.users?.full_name?.substring(0, 2).toUpperCase() || 'UN'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
