import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  RotateCcw,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Edit2,
  CircleDashed,
  PlayCircle,
  PauseCircle,
  Download,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { EditStatusModal } from './EditStatusModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { useRef } from 'react'

type Task = {
  id: string
  task_name: string
  start_date: string | null
  finish_date: string | null
  status: string
  completion_date: string | null
  comments: string | null
  assigned_to: string | null
  assignee_name?: string
  wo_number: string
  comments_count: number
  department?: string | null
  sub_department?: string | null
  customer_name?: string | null
  machine_model?: string | null
  product_type?: string | null
}

export function EngineeringTaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [tasksRes, usersRes] = await Promise.all([
        supabase
          .from('wo_tasks')
          .select(`
            id,
            task_name,
            start_date,
            finish_date,
            status,
            completion_date,
            comments,
            assigned_to,
            department,
            sub_department,
            work_orders ( wo_number, customer_name, machine_model, product_type ),
            wo_task_comments_history ( id )
          `)
          .eq('department', 'Engineering')
          .order('created_at', { ascending: false }),
        supabase.from('users').select('id, full_name'),
      ])

      if (usersRes.data) {
        setUsers(usersRes.data)
      }

      if (tasksRes.data) {
        const formattedTasks = tasksRes.data.map((t: any) => ({
          ...t,
          wo_number: t.work_orders?.wo_number || '-',
          customer_name: t.work_orders?.customer_name,
          machine_model: t.work_orders?.machine_model,
          product_type: t.work_orders?.product_type,
          assignee_name:
            usersRes.data?.find((u) => u.id === t.assigned_to)?.full_name || 'Unassigned',
          comments_count: t.wo_task_comments_history?.length || (t.comments ? 1 : 0),
        }))
        setTasks(formattedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = useMemo(() => {
    const total = tasks.length
    const notStarted = tasks.filter((t) => !t.status || t.status === 'not_started').length
    const onTrack = tasks.filter((t) => t.status === 'on_track').length
    const parked = tasks.filter((t) => t.status === 'parked').length
    const atRisk = tasks.filter((t) => t.status === 'at_risk').length
    const delayed = tasks.filter((t) => t.status === 'delayed').length
    const completed = tasks.filter((t) => t.status === 'complete').length

    const complRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      notStarted,
      onTrack,
      parked,
      atRisk,
      delayed,
      completed,
      complRate: complRate.toFixed(1),
    }
  }, [tasks])

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.wo_number && t.wo_number.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesAssignee =
      assigneeFilter === 'all'
        ? true
        : assigneeFilter === 'unassigned'
          ? !t.assigned_to
          : t.assigned_to === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  const handleSave = async (id: string, newStatus: string, comment?: string) => {
    try {
      const updates: any = { status: newStatus }

      if (newStatus === 'complete') {
        updates.completion_date = new Date().toISOString()
        updates.is_completed = true
      } else {
        updates.completion_date = null
        updates.is_completed = false
      }

      await supabase.from('wo_tasks').update(updates).eq('id', id)

      if (comment) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        await supabase.from('wo_task_comments_history').insert({
          task_id: id,
          comment: comment,
          status: newStatus as any,
          author_id: user?.id,
        })
        await supabase.from('wo_tasks').update({ comments: comment }).eq('id', id)
      }

      fetchData()
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>
      case 'at_risk':
        return <Badge className="bg-amber-500 hover:bg-amber-600">At Risk</Badge>
      case 'on_track':
        return <Badge className="bg-blue-500 hover:bg-blue-600">On Track</Badge>
      case 'parked':
        return <Badge variant="secondary">Parked</Badge>
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-0"
          >
            Not Started
          </Badge>
        )
    }
  }

  const uniqueAssignees = Array.from(new Set(tasks.map((t) => t.assigned_to).filter(Boolean)))

  const containerRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(
    containerRef,
    'Engineering Tasks Report',
  )

  const exportToCSV = () => {
    const headers = ['WO Number', 'Task Name', 'Start Date', 'Finish Date', 'Status', 'Assigned To']
    const rows = filteredTasks.map((t) => [
      t.wo_number,
      `"${t.task_name.replace(/"/g, '""')}"`,
      t.start_date ? format(new Date(t.start_date), 'yyyy-MM-dd') : '',
      t.finish_date ? format(new Date(t.finish_date), 'yyyy-MM-dd') : '',
      t.status,
      `"${t.assignee_name || 'Unassigned'}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `tasks_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      ref={containerRef}
      className="space-y-6 animate-in fade-in duration-300 bg-white sm:bg-transparent pb-4"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Total Tasks</p>
              <ListTodo className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Not Started</p>
              <CircleDashed className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-slate-600">{kpis.notStarted}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">On Track</p>
              <PlayCircle className="h-4 w-4 text-blue-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{kpis.onTrack}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Parked</p>
              <PauseCircle className="h-4 w-4 text-slate-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-slate-600">{kpis.parked}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">At Risk</p>
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{kpis.atRisk}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Delayed</p>
              <Clock className="h-4 w-4 text-red-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-red-600">{kpis.delayed}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Completed</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{kpis.completed}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-slate-700 leading-tight w-16">Compl. Rate</p>
              <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpis.complRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Task or WO Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="parked">Parked</SelectItem>
              <SelectItem value="complete">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {uniqueAssignees.map((id) => (
                <SelectItem key={id as string} value={id as string}>
                  {users.find((u) => u.id === id)?.full_name || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setAssigneeFilter('all')
            }}
            className="w-full md:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto gap-2" disabled={isExporting}>
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WO Number</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Finish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setSelectedTask(task)}
                >
                  <TableCell className="font-medium">{task.wo_number}</TableCell>
                  <TableCell>{task.task_name}</TableCell>
                  <TableCell>
                    {task.start_date ? format(new Date(task.start_date), 'MM/dd/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {task.finish_date ? format(new Date(task.finish_date), 'MM/dd/yyyy') : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.completion_date
                      ? format(new Date(task.completion_date), 'MM/dd/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 border rounded-md px-2 py-1 w-fit bg-slate-50">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.comments_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className={task.assigned_to ? '' : 'text-muted-foreground italic'}>
                    {task.assignee_name}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditStatusModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSave}
      />
    </div>
  )
}
