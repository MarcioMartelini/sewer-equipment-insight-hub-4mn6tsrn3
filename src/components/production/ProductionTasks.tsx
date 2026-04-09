import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useProductionTasks } from '@/hooks/use-production-tasks'
import { ProductionType } from '@/services/production'
import { LayoutGrid, List, Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-100 text-slate-700' },
  { value: 'on_track', label: 'On Track', color: 'bg-blue-100 text-blue-700' },
  { value: 'at_risk', label: 'At Risk', color: 'bg-amber-100 text-amber-700' },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-700' },
  { value: 'parked', label: 'Parked', color: 'bg-purple-100 text-purple-700' },
  { value: 'complete', label: 'Complete', color: 'bg-green-100 text-green-700' },
]

export function ProductionTasks({ type }: { type: ProductionType }) {
  const { tasks, loading, handleUpdateStatus } = useProductionTasks(type)
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    taskId: string
    newStatus: string
  } | null>(null)
  const [statusComment, setStatusComment] = useState('')

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.wo_number.toLowerCase().includes(search.toLowerCase()) ||
      t.task_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const onStatusChange = (taskId: string, newStatus: string) => {
    if (newStatus === 'parked' || newStatus === 'at_risk') {
      setConfirmModal({ isOpen: true, taskId, newStatus })
      setStatusComment('')
    } else {
      handleUpdateStatus(taskId, newStatus)
    }
  }

  const confirmStatusChange = () => {
    if (confirmModal) {
      handleUpdateStatus(confirmModal.taskId, confirmModal.newStatus, statusComment)
      setConfirmModal(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status)
    return opt ? (
      <Badge className={`${opt.color} hover:${opt.color} border-none`}>{opt.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-slate-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO Number</TableHead>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.wo_number}</TableCell>
                      <TableCell>{task.task_name}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(v) => onStatusChange(task.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
          {STATUS_OPTIONS.map((statusCol) => {
            const colTasks = filteredTasks.filter((t) => t.status === statusCol.value)
            return (
              <div
                key={statusCol.value}
                className="min-w-[300px] w-[300px] flex-shrink-0 snap-start"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">{statusCol.label}</h3>
                  <Badge variant="secondary" className="bg-white">
                    {colTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-500">
                            {task.wo_number}
                          </span>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="font-medium text-sm text-slate-900">{task.task_name}</p>
                        <Select
                          value={task.status}
                          onValueChange={(v) => onStatusChange(task.id, v)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-sm text-slate-500">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={confirmModal?.isOpen || false}
        onOpenChange={(open) => !open && setConfirmModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justification Required</DialogTitle>
            <DialogDescription>
              Please provide a reason for changing the status to{' '}
              <strong>
                {STATUS_OPTIONS.find((o) => o.value === confirmModal?.newStatus)?.label}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter your justification here..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(null)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={!statusComment.trim()}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
