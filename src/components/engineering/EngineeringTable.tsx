import { useState } from 'react'
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
import { useEngineeringTasks } from '@/hooks/use-engineering-tasks'
import { EngineeringType, EngineeringTask } from '@/services/engineering'
import { EditStatusModal } from './EditStatusModal'
import { Edit2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface EngineeringTableProps {
  type: EngineeringType
  woFilter: string
  onClearFilters?: () => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  'not started': { label: 'Not Started', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  parked: { label: 'Parked', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
  'on track': { label: 'On Track', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  'at risk': { label: 'At Risk', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  delayed: { label: 'Delayed', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  complete: { label: 'Complete', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
}

export function EngineeringTable({ type, woFilter }: EngineeringTableProps) {
  const { tasks, loading, handleUpdateStatus } = useEngineeringTasks(type)
  const [selectedTask, setSelectedTask] = useState<EngineeringTask | null>(null)

  const filteredTasks = tasks.filter((task) =>
    task.wo_number.toLowerCase().includes(woFilter.toLowerCase()),
  )

  const isFiltered = woFilter !== '' || filteredTasks.length < tasks.length

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-700">{filteredTasks.length}</span> of{' '}
          <span className="font-bold text-slate-700">{tasks.length}</span> tasks
        </p>
        {isFiltered && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="text-slate-600">
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WO Number</TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const config = statusConfig[task.status] || statusConfig['not started']
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.wo_number}</TableCell>
                    <TableCell>{task.task_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('capitalize font-normal', config.className)}
                      >
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.created_at ? format(new Date(task.created_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.updated_at ? format(new Date(task.updated_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Status
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

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
          }}
        />
      </div>
    </div>
  )
}
