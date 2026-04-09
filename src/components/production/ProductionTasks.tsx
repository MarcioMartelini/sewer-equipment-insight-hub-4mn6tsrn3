import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  ListTodo,
} from 'lucide-react'
import { format } from 'date-fns'
import { useProductionTasks } from '@/hooks/use-production-tasks'
import { ProductionType, ProductionTask } from '@/services/production'
import { TaskCardModal } from './TaskCardModal'
import { cn } from '@/lib/utils'

const ST_CFG: Record<string, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-800' },
  parked: { label: 'Parked', className: 'bg-slate-200 text-slate-800' },
  on_track: { label: 'On Track', className: 'bg-blue-100 text-blue-800' },
  at_risk: { label: 'At Risk', className: 'bg-yellow-100 text-yellow-800' },
  delayed: { label: 'Delayed', className: 'bg-red-100 text-red-800' },
  complete: { label: 'Complete', className: 'bg-emerald-100 text-emerald-800' },
}

export function ProductionTasks({ type }: { type: ProductionType }) {
  const { tasks, loading, refetch } = useProductionTasks(type)
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [assigneeF, setAssigneeF] = useState('all')

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (search === '' ||
            t.task_name.toLowerCase().includes(search.toLowerCase()) ||
            t.wo_number.toLowerCase().includes(search.toLowerCase())) &&
          (statusF === 'all' || t.status === statusF) &&
          (assigneeF === 'all' || t.assigned_to === assigneeF),
      ),
    [tasks, search, statusF, assigneeF],
  )

  const kpis = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.status === 'complete').length
    const delayed = filteredTasks.filter((t) => t.status === 'delayed').length
    const atRisk = filteredTasks.filter((t) => t.status === 'at_risk').length
    const onTime = total > 0 ? ((total - delayed - atRisk) / total) * 100 : 0
    return { total, completed, delayed, atRisk, onTime: onTime.toFixed(1) }
  }, [filteredTasks])

  const assignees = useMemo(
    () =>
      Array.from(
        new Map(
          tasks.filter((t) => t.assigned_to).map((t) => [t.assigned_to, t.assigned_to_name]),
        ).entries(),
      ),
    [tasks],
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">On Time %</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.onTime}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.delayed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{kpis.atRisk}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search Task or WO Number..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(ST_CFG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeF} onValueChange={setAssigneeF}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map(([id, name]) => (
              <SelectItem key={id} value={id as string}>
                {name as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setSearch('')
            setStatusF('all')
            setAssigneeF('all')
          }}
          className="text-slate-500"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>WO Number</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Finish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedTask(t)}
                >
                  <TableCell className="font-semibold text-slate-900">{t.wo_number}</TableCell>
                  <TableCell className="font-medium text-slate-700">{t.task_name}</TableCell>
                  <TableCell className="text-slate-600">
                    {t.start_date ? format(new Date(t.start_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'font-medium',
                      t.finish_date &&
                        new Date(t.finish_date) < new Date() &&
                        t.status !== 'complete'
                        ? 'text-red-600'
                        : 'text-slate-600',
                    )}
                  >
                    {t.finish_date ? format(new Date(t.finish_date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn('border-transparent font-normal', ST_CFG[t.status]?.className)}
                    >
                      {ST_CFG[t.status]?.label || t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {t.completion_date ? format(new Date(t.completion_date), 'MMM dd, HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-slate-50">
                      <MessageSquare className="h-3 w-3 mr-1 text-slate-400" />
                      {t.comments_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {t.assigned_to_name || (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskCardModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={refetch}
      />
    </div>
  )
}
