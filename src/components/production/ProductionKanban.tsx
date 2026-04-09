import { useState } from 'react'
import { useProductionTasks } from '@/hooks/use-production-tasks'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { CalendarIcon, UserIcon, Loader2, FilterX, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProductionTaskCard } from '@/components/production/ProductionTaskCard'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const STATUSES = [
  {
    id: 'not_started',
    label: 'Not Started',
    color: 'bg-slate-100',
    borderColor: 'border-slate-200',
  },
  { id: 'parked', label: 'Parked', color: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'on_track', label: 'On Track', color: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'at_risk', label: 'At Risk', color: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'delayed', label: 'Delayed', color: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'complete', label: 'Complete', color: 'bg-green-100', borderColor: 'border-green-300' },
]

export function ProductionKanban() {
  const { tasks, loading, handleUpdateStatus, refetch } = useProductionTasks('all')
  const [filterSubDept, setFilterSubDept] = useState('all')
  const [filterWo, setFilterWo] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')

  const [selectedTask, setSelectedTask] = useState<any>(null)

  const filteredTasks = tasks.filter((t) => {
    if (filterSubDept !== 'all') {
      const subDept = t.sub_department?.toLowerCase() || ''
      if (!subDept.includes(filterSubDept.toLowerCase())) return false
    }
    if (filterWo && !t.wo_number?.toLowerCase().includes(filterWo.toLowerCase())) return false
    if (filterAssignee && !t.assigned_to_name?.toLowerCase().includes(filterAssignee.toLowerCase()))
      return false
    return true
  })

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status.id] = filteredTasks.filter((t) => {
        const s = t.status || 'not_started'
        return (
          s === status.id || (status.id === 'not_started' && !STATUSES.find((st) => st.id === s))
        )
      })
      return acc
    },
    {} as Record<string, any[]>,
  )

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.status !== newStatus) {
        await handleUpdateStatus(taskId, newStatus)
      }
    }
  }

  const getProgress = (status: string) => {
    if (status === 'complete') return 100
    if (status === 'on_track' || status === 'at_risk') return 50
    if (status === 'delayed') return 75
    return 0
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm shrink-0">
        <div className="w-full sm:w-48">
          <Select value={filterSubDept} onValueChange={setFilterSubDept}>
            <SelectTrigger>
              <SelectValue placeholder="Sub-Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-Departments</SelectItem>
              <SelectItem value="weld">Weld Shop</SelectItem>
              <SelectItem value="paint">Paint</SelectItem>
              <SelectItem value="sub assembly">Sub Assembly</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="final assembly">Final Assembly</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Input
            placeholder="WO Number"
            value={filterWo}
            onChange={(e) => setFilterWo(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Input
            placeholder="Assigned To"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          />
        </div>
        {(filterSubDept !== 'all' || filterWo || filterAssignee) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterSubDept('all')
              setFilterWo('')
              setFilterAssignee('')
            }}
          >
            <FilterX className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start custom-scrollbar">
          {STATUSES.map((status) => (
            <div
              key={status.id}
              className={cn(
                'flex flex-col w-[320px] shrink-0 rounded-xl border max-h-full',
                status.color,
                status.borderColor,
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, status.id)}
            >
              <div className="p-3 border-b border-black/5 flex items-center justify-between font-semibold text-slate-700 bg-black/5 rounded-t-xl">
                <span>{status.label}</span>
                <Badge variant="secondary" className="bg-white/50">
                  {tasksByStatus[status.id]?.length || 0}
                </Badge>
              </div>
              <div className="p-2 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-[150px]">
                {tasksByStatus[status.id]?.map((task, i) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow group flex flex-col gap-2 relative animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex justify-between items-start pr-6">
                      <span className="font-bold text-sm text-slate-900">
                        {task.wo_number || '-'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                        {task.sub_department || task.department}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-700 line-clamp-2">
                      {task.task_name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Start</span>
                        <div className="flex items-center text-xs font-medium text-slate-700">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {task.start_date ? format(new Date(task.start_date), 'MM/dd/yy') : '-'}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">Finish</span>
                        <div className="flex items-center text-xs font-medium text-slate-700">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {task.finish_date ? format(new Date(task.finish_date), 'MM/dd/yy') : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                      <div
                        className="flex items-center text-xs text-slate-600 truncate max-w-[150px]"
                        title={task.assigned_to_name || 'Unassigned'}
                      >
                        <UserIcon className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{task.assigned_to_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500">
                          {getProgress(task.status)}%
                        </span>
                        <Progress
                          value={getProgress(task.status)}
                          className="w-12 h-1.5"
                          indicatorClassName={cn(task.status === 'complete' && 'bg-emerald-500')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <Dialog
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTask(null)
              refetch()
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-slate-50 p-6 border-none shadow-xl">
            <DialogTitle className="sr-only">Task Details</DialogTitle>
            <DialogDescription className="sr-only">
              Details of the production task
            </DialogDescription>
            <ProductionTaskCard
              task={selectedTask}
              onUpdate={() => {
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
