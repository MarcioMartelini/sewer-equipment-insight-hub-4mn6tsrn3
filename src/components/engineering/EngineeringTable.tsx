import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useEngineeringTasks } from '@/hooks/use-engineering-tasks'
import { EngineeringType, EngineeringTask } from '@/services/engineering'
import { EditStatusModal } from './EditStatusModal'
import {
  Edit2,
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  LayoutGrid,
  Calendar as CalendarIcon,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface EngineeringTableProps {
  type: EngineeringType
  woFilter: string
  onClearFilters?: () => void
}

const statusConfig: Record<string, { label: string; className: string; columnClass: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-100 text-slate-800',
    columnClass: 'bg-slate-50 border-slate-200',
  },
  parked: {
    label: 'Parked',
    className: 'bg-blue-100 text-blue-800',
    columnClass: 'bg-blue-50/50 border-blue-100',
  },
  on_track: {
    label: 'On Track',
    className: 'bg-emerald-100 text-emerald-800',
    columnClass: 'bg-emerald-50/50 border-emerald-100',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-amber-100 text-amber-800',
    columnClass: 'bg-amber-50/50 border-amber-100',
  },
  delayed: {
    label: 'Delayed',
    className: 'bg-red-100 text-red-800',
    columnClass: 'bg-red-50/50 border-red-100',
  },
  complete: {
    label: 'Complete',
    className: 'bg-indigo-100 text-indigo-800',
    columnClass: 'bg-indigo-50/50 border-indigo-100',
  },
}

const COLUMNS = ['not_started', 'parked', 'on_track', 'at_risk', 'delayed', 'complete']

export function EngineeringTable({ type, woFilter, onClearFilters }: EngineeringTableProps) {
  const { tasks, users, loading, handleUpdateStatus, handleAssignTask, refetch } =
    useEngineeringTasks(type)

  const [selectedTask, setSelectedTask] = useState<EngineeringTask | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [localSearch, setLocalSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [pendingMove, setPendingMove] = useState<{ taskId: string; newStatus: string } | null>(null)
  const [moveComment, setMoveComment] = useState('')

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesParent = task.wo_number.toLowerCase().includes(woFilter.toLowerCase())
      const matchesSearch =
        task.wo_number.toLowerCase().includes(localSearch.toLowerCase()) ||
        task.task_name.toLowerCase().includes(localSearch.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesAssignee =
        assigneeFilter === 'all' ||
        task.assigned_to === assigneeFilter ||
        (assigneeFilter === 'unassigned' && !task.assigned_to)
      return matchesParent && matchesSearch && matchesStatus && matchesAssignee
    })
  }, [tasks, woFilter, localSearch, statusFilter, assigneeFilter])

  const kpis = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.status === 'complete').length
    const delayed = filteredTasks.filter((t) => t.status === 'delayed').length
    const atRisk = filteredTasks.filter((t) => t.status === 'at_risk').length
    const onTimePerc = total === 0 ? 100 : ((total - delayed - atRisk) / total) * 100
    return { total, completed, delayed, atRisk, onTimePerc }
  }, [filteredTasks])

  const clearFilters = () => {
    setLocalSearch('')
    setStatusFilter('all')
    setAssigneeFilter('all')
    if (onClearFilters) onClearFilters()
  }

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      if (newStatus === 'parked' || newStatus === 'at_risk' || newStatus === 'delayed') {
        setPendingMove({ taskId, newStatus })
        setMoveComment('')
      } else {
        handleUpdateStatus(taskId, newStatus)
      }
    }
  }

  const confirmMove = async () => {
    if (!pendingMove) return
    await handleUpdateStatus(pendingMove.taskId, pendingMove.newStatus)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await supabase.from('wo_task_comments_history').insert({
      task_id: pendingMove.taskId,
      comment: moveComment,
      status: pendingMove.newStatus as any,
      author_id: user?.id,
    })
    await supabase.from('wo_tasks').update({ comments: moveComment }).eq('id', pendingMove.taskId)
    setPendingMove(null)
    refetch()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <h3 className="text-2xl font-bold text-slate-800">{kpis.total}</h3>
            </div>
            <ListTodo className="h-8 w-8 text-slate-300" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <h3 className="text-2xl font-bold text-emerald-600">{kpis.completed}</h3>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-200" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">On Time %</p>
              <h3 className="text-2xl font-bold text-blue-600">{kpis.onTimePerc.toFixed(1)}%</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <h3 className="text-2xl font-bold text-red-600">{kpis.delayed}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">At Risk</p>
              <h3 className="text-2xl font-bold text-amber-600">{kpis.atRisk}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-200" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Task or WO Number..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-slate-50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-slate-50">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {COLUMNS.map((c) => (
                <SelectItem key={c} value={c}>
                  {statusConfig[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-slate-50">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
            <X className="w-4 h-4 mr-2" /> Clear
          </Button>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as any)}
          className="bg-slate-100 p-1 rounded-md"
        >
          <ToggleGroupItem
            value="list"
            aria-label="List View"
            className="px-4 py-1.5 h-auto text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            <ListTodo className="h-4 w-4 mr-2" /> Task Lists
          </ToggleGroupItem>
          <ToggleGroupItem
            value="kanban"
            aria-label="Kanban View"
            className="px-4 py-1.5 h-auto text-sm data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            <LayoutGrid className="h-4 w-4 mr-2" /> Kanban Board
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>WO Number</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Finish Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const config = statusConfig[task.status] || statusConfig['not_started']
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-semibold text-slate-700">
                        {task.wo_number}
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{task.task_name}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {task.start_date ? format(new Date(task.start_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {task.finish_date
                          ? format(new Date(task.finish_date), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('capitalize font-normal', config.className)}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-slate-400 text-xs">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          {task.comments ? '1' : '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.assigned_to || 'unassigned'}
                          onValueChange={(val) =>
                            handleAssignTask(task.id, val === 'unassigned' ? null : val)
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned" className="text-slate-500 italic">
                              Unassigned
                            </SelectItem>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {COLUMNS.map((colId) => {
            const colTasks = filteredTasks.filter((t) => t.status === colId)
            const config = statusConfig[colId]
            return (
              <div
                key={colId}
                className={cn(
                  'flex-shrink-0 w-80 rounded-xl border p-3 flex flex-col min-h-[500px] max-h-[700px] snap-center',
                  config.columnClass,
                )}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, colId)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-slate-700">{config.label}</h3>
                  <Badge variant="secondary" className="bg-white/60 text-slate-500">
                    {colTasks.length}
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                  {colTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200/60 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                      Drop tasks here
                    </div>
                  )}
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      className="bg-white p-3.5 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {task.wo_number}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mr-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-4">{task.task_name}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded">
                        <div>
                          <div className="uppercase text-[9px] font-bold text-slate-400 mb-0.5">
                            Start
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />{' '}
                            {task.start_date ? format(new Date(task.start_date), 'MMM dd') : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="uppercase text-[9px] font-bold text-slate-400 mb-0.5">
                            Finish
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />{' '}
                            {task.finish_date ? format(new Date(task.finish_date), 'MMM dd') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <Select
                          value={task.assigned_to || 'unassigned'}
                          onValueChange={(val) =>
                            handleAssignTask(task.id, val === 'unassigned' ? null : val)
                          }
                        >
                          <SelectTrigger className="h-6 w-auto min-w-[100px] text-xs border-none shadow-none focus:ring-0 p-0 hover:bg-slate-50">
                            <div className="flex items-center text-slate-600">
                              <UserIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              <span className="truncate max-w-[100px]">
                                {task.assignee_name || (
                                  <span className="italic text-slate-400">Unassigned</span>
                                )}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned" className="text-slate-500 italic">
                              Unassigned
                            </SelectItem>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {task.comments && (
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                            <MessageSquare className="w-3 h-3" /> 1
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <EditStatusModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={async (id, status, comment) => {
          await handleUpdateStatus(id, status)
          if (comment) {
            const {
              data: { user },
            } = await supabase.auth.getUser()
            await supabase.from('wo_task_comments_history').insert({
              task_id: id,
              comment: comment,
              status: status as any,
              author_id: user?.id,
            })
            await supabase.from('wo_tasks').update({ comments: comment }).eq('id', id)
          }
          refetch()
        }}
      />

      <Dialog open={!!pendingMove} onOpenChange={(open) => !open && setPendingMove(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Justification Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Changing the status to{' '}
              <strong className="capitalize">
                {pendingMove?.newStatus.replace('_', ' ')}
              </strong>{' '}
              requires a mandatory technical comment.
            </p>
            <Textarea
              value={moveComment}
              onChange={(e) => setMoveComment(e.target.value)}
              placeholder="Describe the reason for this change..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button disabled={!moveComment.trim()} onClick={confirmMove}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
