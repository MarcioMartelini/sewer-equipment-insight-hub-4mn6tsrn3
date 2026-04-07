import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Calendar as CalendarIcon, User, Percent, LayoutGrid, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductionKanbanKPIs } from './production-kanban-kpis'
import { ProductionKanbanCalendar } from './production-kanban-calendar'

export function ProductionKanban() {
  const { session } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<string>('kanban')
  const [filters, setFilters] = useState({
    department: 'all',
    subDepartment: 'all',
    woNumber: '',
    salesperson: '',
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('wo_tasks')
      .select(`
        *,
        work_orders (
          wo_number,
          quotes ( salesperson )
        ),
        users!wo_tasks_assigned_to_fkey ( full_name )
      `)
      .in('status', ['Pending', 'In Progress', 'Completed'])

    if (error) {
      console.error(error)
      toast.error('Failed to fetch tasks')
      return
    }

    const formatted = (data || []).map((t) => {
      const woData = Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders
      const quotesData = Array.isArray(woData?.quotes) ? woData?.quotes[0] : woData?.quotes
      const usersData = Array.isArray(t.users) ? t.users[0] : t.users

      return {
        id: t.id,
        task_name: t.task_name,
        department: t.department,
        sub_department: t.sub_department,
        start_date: t.start_date,
        finish_date: t.finish_date,
        status: t.status,
        progress: t.progress || 0,
        wo_number: woData?.wo_number || 'N/A',
        salesperson: quotesData?.salesperson || 'N/A',
        assigned_to_name: usersData?.full_name || null,
      }
    })

    setTasks(formatted)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    const oldStatus = task.status

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    const { error } = await supabase.from('wo_tasks').update({ status: newStatus }).eq('id', taskId)

    if (error) {
      toast.error('Failed to update task status')
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t)))
      return
    }

    // Insert history
    await supabase.from('wo_task_history').insert({
      task_id: taskId,
      user_id: session?.user?.id,
      action: 'Status Changed',
      old_value: oldStatus,
      new_value: newStatus,
    })

    toast.success(`Task moved to ${newStatus}`)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const filteredTasks = tasks.filter((t) => {
    if (filters.department !== 'all' && t.department !== filters.department) return false
    if (filters.subDepartment !== 'all' && t.sub_department !== filters.subDepartment) return false
    if (filters.woNumber && !t.wo_number.toLowerCase().includes(filters.woNumber.toLowerCase()))
      return false
    if (
      filters.salesperson &&
      !t.salesperson.toLowerCase().includes(filters.salesperson.toLowerCase())
    )
      return false
    return true
  })

  const columns = [
    { id: 'Pending', title: 'Pending', color: 'bg-slate-50', borderColor: 'border-slate-200' },
    {
      id: 'In Progress',
      title: 'In Progress',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'Completed',
      title: 'Completed',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ]

  const departments = Array.from(new Set(tasks.map((t) => t.department)))
    .filter(Boolean)
    .sort()
  const subDepartments = Array.from(new Set(tasks.map((t) => t.sub_department)))
    .filter(Boolean)
    .sort()

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      <ProductionKanbanKPIs tasks={filteredTasks} />

      <div className="flex flex-col xl:flex-row flex-wrap gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm justify-between items-start xl:items-center">
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <Select
            value={filters.department}
            onValueChange={(v) => setFilters((f) => ({ ...f, department: v }))}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.subDepartment}
            onValueChange={(v) => setFilters((f) => ({ ...f, subDepartment: v }))}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sub-Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Departments</SelectItem>
              {subDepartments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by WO Number..."
            className="w-full sm:w-[180px]"
            value={filters.woNumber}
            onChange={(e) => setFilters((f) => ({ ...f, woNumber: e.target.value }))}
          />

          <Input
            placeholder="Filter by Salesperson..."
            className="w-full sm:w-[180px]"
            value={filters.salesperson}
            onChange={(e) => setFilters((f) => ({ ...f, salesperson: e.target.value }))}
          />
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full xl:w-auto">
          <TabsList className="w-full xl:w-auto grid grid-cols-2">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px] h-[calc(100vh-420px)] custom-scrollbar">
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn(
                'flex flex-col w-[350px] shrink-0 rounded-xl border',
                col.color,
                col.borderColor,
              )}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              <div className="p-4 border-b border-inherit bg-white/50 backdrop-blur-sm rounded-t-xl font-semibold flex justify-between items-center text-slate-800">
                {col.title}
                <Badge variant="outline" className="bg-white/80">
                  {filteredTasks.filter((t) => t.status === col.id).length}
                </Badge>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-3 min-h-[100px]">
                  {filteredTasks
                    .filter((t) => t.status === col.id)
                    .map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:-translate-y-0.5 border-slate-200"
                      >
                        <CardContent className="p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-sm leading-tight text-slate-900">
                              {task.task_name}
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {task.wo_number}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-500 font-medium">
                            {task.department}{' '}
                            {task.sub_department && (
                              <span className="opacity-60">› {task.sub_department}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 gap-x-1 mt-2 text-xs text-slate-600 bg-slate-50/50 p-2 rounded-md">
                            <div className="flex items-center gap-1.5" title="Start Date">
                              <CalendarIcon className="w-3.5 h-3.5 opacity-70" />
                              <span className="truncate">{task.start_date || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Finish Date">
                              <CalendarIcon className="w-3.5 h-3.5 opacity-70" />
                              <span className="truncate">{task.finish_date || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Assigned To">
                              <User className="w-3.5 h-3.5 opacity-70" />
                              <span className="truncate">
                                {task.assigned_to_name || 'Unassigned'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Progress">
                              <Percent className="w-3.5 h-3.5 opacity-70" />
                              <span>{task.progress}%</span>
                            </div>
                          </div>
                          <div className="text-[10px] mt-1 text-slate-400 font-medium flex justify-between">
                            <span>Rep: {task.salesperson}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {filteredTasks.filter((t) => t.status === col.id).length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-300/50 rounded-lg text-slate-400 text-xs font-medium">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[600px] h-[calc(100vh-420px)] w-full">
          <ProductionKanbanCalendar tasks={filteredTasks} />
        </div>
      )}
    </div>
  )
}
