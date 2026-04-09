import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CalendarIcon, User2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type Task = {
  id: string
  task_name: string
  start_date: string | null
  finish_date: string | null
  status: string
  progress: number
  sub_department: string | null
  wo_number: string
  assigned_to_name: string | null
  assigned_to_avatar: string | null
}

export function EngineeringKanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [subDeptFilter, setSubDeptFilter] = useState('all')
  const [woFilter, setWoFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)
      const { data, error } = await supabase
        .from('wo_tasks')
        .select(`
          id,
          task_name,
          start_date,
          finish_date,
          status,
          progress,
          sub_department,
          work_orders!inner(wo_number),
          users!wo_tasks_assigned_to_fkey(full_name, avatar_url)
        `)
        .eq('department', 'Engineering')

      if (!error && data) {
        const formatted = data.map((t: any) => ({
          id: t.id,
          task_name: t.task_name,
          start_date: t.start_date,
          finish_date: t.finish_date,
          status: t.status,
          progress: t.progress || 0,
          sub_department: t.sub_department,
          wo_number: t.work_orders?.wo_number || '',
          assigned_to_name: t.users?.full_name || null,
          assigned_to_avatar: t.users?.avatar_url || null,
        }))
        setTasks(formatted)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const subDepartments = useMemo(() => {
    const depts = new Set(tasks.map((t) => t.sub_department).filter(Boolean))
    return Array.from(depts).sort() as string[]
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (subDeptFilter !== 'all' && t.sub_department !== subDeptFilter) return false
      if (woFilter && !t.wo_number.toLowerCase().includes(woFilter.toLowerCase())) return false
      if (
        assigneeFilter &&
        !(t.assigned_to_name || '').toLowerCase().includes(assigneeFilter.toLowerCase())
      )
        return false
      return true
    })
  }, [tasks, subDeptFilter, woFilter, assigneeFilter])

  const COLUMNS = [
    {
      id: 'not_started',
      label: 'Not Started',
      bgHeader: 'bg-slate-100',
      border: 'border-slate-200',
      titleColor: 'text-slate-700',
    },
    {
      id: 'parked',
      label: 'Parked',
      bgHeader: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-800',
    },
    {
      id: 'on_track',
      label: 'On Track',
      bgHeader: 'bg-emerald-50',
      border: 'border-emerald-200',
      titleColor: 'text-emerald-800',
    },
    {
      id: 'at_risk',
      label: 'At Risk',
      bgHeader: 'bg-amber-50',
      border: 'border-amber-200',
      titleColor: 'text-amber-800',
    },
    {
      id: 'delayed',
      label: 'Delayed',
      bgHeader: 'bg-red-50',
      border: 'border-red-200',
      titleColor: 'text-red-800',
    },
    {
      id: 'complete',
      label: 'Complete',
      bgHeader: 'bg-gray-100',
      border: 'border-gray-200',
      titleColor: 'text-gray-800',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <Select value={subDeptFilter} onValueChange={setSubDeptFilter}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="All Sub-Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sub-Departments</SelectItem>
            {subDepartments.map((sd) => (
              <SelectItem key={sd} value={sd}>
                {sd}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="WO Number"
          value={woFilter}
          onChange={(e) => setWoFilter(e.target.value)}
          className="w-[200px]"
        />

        <Input
          placeholder="Assigned To"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="w-[200px]"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 items-start custom-scrollbar">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className={cn(
                'flex flex-col w-[320px] shrink-0 rounded-xl border overflow-hidden bg-white shadow-sm',
                col.border,
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between p-3 border-b',
                  col.bgHeader,
                  col.border,
                )}
              >
                <h3 className={cn('font-semibold text-sm', col.titleColor)}>{col.label}</h3>
                <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar bg-slate-50/30">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900 text-sm">{task.wo_number}</span>
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                        {task.sub_department || 'Engineering'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-700 text-[13px] mb-4 leading-tight">
                      {task.task_name}
                    </p>

                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                          START
                        </p>
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                          <CalendarIcon className="w-3 h-3 mr-1.5 text-slate-400" />
                          {task.start_date ? format(new Date(task.start_date), 'MM/dd/yyyy') : '-'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                          FINISH
                        </p>
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                          <CalendarIcon className="w-3 h-3 mr-1.5 text-slate-400" />
                          {task.finish_date
                            ? format(new Date(task.finish_date), 'MM/dd/yyyy')
                            : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        {task.assigned_to_avatar ? (
                          <img
                            src={task.assigned_to_avatar}
                            alt={task.assigned_to_name || ''}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <User2 className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        <span className="truncate max-w-[100px]">
                          {task.assigned_to_name || 'Unassigned'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-24 justify-end">
                        <span className="text-[10px] font-bold text-slate-700">
                          {task.progress}%
                        </span>
                        <Progress
                          value={task.progress}
                          className="h-1.5 w-12"
                          {...({
                            indicatorClassName: cn(
                              'bg-indigo-500 transition-all duration-500',
                              task.progress === 100 && 'bg-emerald-500',
                              task.status === 'delayed' && 'bg-red-500',
                            ),
                          } as any)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-lg">
                    No items
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
