import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TaskCard, TaskWithWO } from './TaskCard'
import { Loader2, ClipboardList, LayoutGrid, KanbanSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DepartmentTasks({
  department,
  subDepartment,
}: {
  department: string
  subDepartment?: string
}) {
  const [tasks, setTasks] = useState<TaskWithWO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [taskFilter, setTaskFilter] = useState('all')
  const [viewMode, setViewMode] = useState('kanban')

  const fetchTasks = async () => {
    setLoading(true)
    let query = supabase
      .from('wo_tasks')
      .select('*, work_orders(wo_number, customer_name, product_type, machine_model)')
      .eq('department', department)

    if (subDepartment) {
      query = query.eq('sub_department', subDepartment)
    }

    const { data, error } = await query
      .order('is_completed', { ascending: true })
      .order('finish_date', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      const normalizedData = (data || []).map((t: any) => ({
        ...t,
        work_orders: Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders,
      }))
      setTasks(normalizedData as TaskWithWO[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [department, subDepartment])

  const uniqueTaskNames = Array.from(new Set(tasks.map((t) => t.task_name))).sort()

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_name.toLowerCase().includes(search.toLowerCase()) ||
      task.work_orders?.wo_number?.toLowerCase().includes(search.toLowerCase()) ||
      task.work_orders?.customer_name?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter !== 'all' && task.status !== statusFilter) return false

    if (taskFilter !== 'all' && task.task_name !== taskFilter) return false

    return true
  })

  const columns = [
    {
      id: 'not_started',
      title: 'Not Started',
      color: 'bg-slate-50',
      borderColor: 'border-slate-200',
    },
    { id: 'parked', title: 'Parked', color: 'bg-blue-50', borderColor: 'border-blue-200' },
    {
      id: 'on_track',
      title: 'On Track',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    { id: 'at_risk', title: 'At Risk', color: 'bg-amber-50', borderColor: 'border-amber-200' },
    { id: 'delayed', title: 'Delayed', color: 'bg-red-50', borderColor: 'border-red-200' },
    {
      id: 'complete',
      title: 'Complete',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ]

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.status === newStatus) return

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)))

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('wo_tasks')
      .update({ status: newStatus as any })
      .eq('id', taskId)

    if (!error && user) {
      await supabase.from('wo_task_comments_history').insert({
        task_id: taskId,
        author_id: user.id,
        comment: `Status changed from ${task.status || 'not_started'} to ${newStatus}`,
        status: newStatus as any,
      })
    }

    if (error) {
      fetchTasks()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div className="space-y-4 animate-in fade-in-50">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <Input
            placeholder="Buscar por WO, Cliente ou Tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[350px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <Select value={taskFilter} onValueChange={setTaskFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por tarefa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Tarefas</SelectItem>
              {uniqueTaskNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="parked">Parked</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <KanbanSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-16 bg-muted/10 rounded-lg border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col justify-center items-center p-16 bg-muted/10 rounded-lg border border-dashed text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Tente ajustar os filtros para encontrar o que procura.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px] h-[calc(100vh-280px)] custom-scrollbar items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className={cn(
                  'flex flex-col w-[350px] shrink-0 rounded-xl border max-h-full',
                  col.color,
                  col.borderColor,
                )}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
              >
                <div className="p-4 border-b border-inherit bg-white/50 backdrop-blur-sm rounded-t-xl font-semibold flex justify-between items-center text-slate-800 sticky top-0 z-10">
                  {col.title}
                  <Badge variant="outline" className="bg-white/80">
                    {colTasks.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1 p-3">
                  <div className="flex flex-col gap-3 min-h-[100px]">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('taskId', task.id)
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        className="cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform"
                      >
                        <TaskCard task={task} onUpdate={fetchTasks} />
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300/50 rounded-lg text-slate-400 text-xs font-medium">
                        Arraste tarefas para cá
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
