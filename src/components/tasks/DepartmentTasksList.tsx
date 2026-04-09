import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/StatusBadge'
import { TaskCard, TaskWithWO } from './TaskCard'
import {
  Loader2,
  Search,
  CalendarIcon,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from 'lucide-react'
import { format, isBefore, startOfDay, parseISO } from 'date-fns'

export function DepartmentTasksList({ department }: { department: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [taskFilter, setTaskFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wo_tasks')
      .select(`
        *,
        work_orders(wo_number, customer_name, product_type, machine_model),
        comments:wo_task_comments_history(id)
      `)
      .eq('department', department)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else if (data) {
      const normalizedData = data.map((t: any) => ({
        ...t,
        work_orders: Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders,
        comments_count: t.comments?.length || 0,
      }))
      setTasks(normalizedData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [department])

  const uniqueTaskNames = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.task_name))).sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const searchLower = search.toLowerCase()
      const matchSearch =
        t.task_name.toLowerCase().includes(searchLower) ||
        t.work_orders?.wo_number?.toLowerCase().includes(searchLower)
      if (!matchSearch) return false

      if (statusFilter !== 'all' && t.status !== statusFilter) return false

      if (taskFilter !== 'all' && t.task_name !== taskFilter) return false

      if (dateFrom && t.finish_date && t.finish_date < dateFrom) return false
      if (dateTo && t.finish_date && t.finish_date > dateTo) return false

      return true
    })
  }, [tasks, search, statusFilter, taskFilter, dateFrom, dateTo])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.is_completed || t.status === 'complete').length

    let onTimeCount = 0
    let overdueCount = 0

    const statusCounts = {
      not_started: 0,
      parked: 0,
      on_track: 0,
      at_risk: 0,
      delayed: 0,
      complete: 0,
    }

    const today = startOfDay(new Date())

    filteredTasks.forEach((t) => {
      if (t.status && t.status in statusCounts) {
        statusCounts[t.status as keyof typeof statusCounts]++
      }

      if (t.is_completed || t.status === 'complete') {
        if (t.completion_date && t.finish_date) {
          const compDate = startOfDay(parseISO(t.completion_date))
          const finDate = startOfDay(parseISO(t.finish_date))
          if (compDate <= finDate) onTimeCount++
          else overdueCount++
        } else {
          onTimeCount++
        }
      } else {
        if (t.finish_date) {
          const finDate = startOfDay(parseISO(t.finish_date))
          if (isBefore(finDate, today)) overdueCount++
        }
      }
    })

    const onTimePercent = total > 0 ? Math.round((onTimeCount / total) * 100) : 0

    return { total, completed, onTimePercent, overdueCount, statusCounts }
  }, [filteredTasks])

  const openTask = (task: any) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-medium text-slate-700">
              {stats.statusCounts.not_started} Not Started
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-medium text-blue-700">{stats.statusCounts.parked} Parked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-emerald-700">
              {stats.statusCounts.on_track} On Track
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-medium text-amber-700">{stats.statusCounts.at_risk} At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="font-medium text-red-700">{stats.statusCounts.delayed} Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-medium text-emerald-800">
              {stats.statusCounts.complete} Complete
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Task or WO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={taskFilter} onValueChange={setTaskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Task Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {uniqueTaskNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="parked">Parked</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <span className="text-xs text-muted-foreground">Finish Date From</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full md:w-[140px]"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <span className="text-xs text-muted-foreground">To</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full md:w-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WO Number</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Finish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead className="text-right">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openTask(task)}
                >
                  <TableCell className="font-medium">
                    {task.work_orders?.wo_number || '-'}
                  </TableCell>
                  <TableCell>{task.task_name}</TableCell>
                  <TableCell>
                    {task.start_date ? format(parseISO(task.start_date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {task.finish_date ? format(parseISO(task.finish_date), 'dd/MM/yyyy') : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    {task.completion_date
                      ? format(parseISO(task.completion_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      {task.comments_count}
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-0 border-l">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <div className="p-6 pt-4">
            {selectedTask && <TaskCard task={selectedTask as TaskWithWO} onUpdate={fetchTasks} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
