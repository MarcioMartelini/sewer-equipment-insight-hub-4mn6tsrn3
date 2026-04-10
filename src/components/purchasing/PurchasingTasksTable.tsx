import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, AlertCircle } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-emerald-500 hover:bg-emerald-600'
    case 'on_track':
      return 'bg-blue-500 hover:bg-blue-600'
    case 'at_risk':
      return 'bg-amber-500 hover:bg-amber-600'
    case 'delayed':
      return 'bg-rose-500 hover:bg-rose-600'
    case 'parked':
      return 'bg-slate-500 hover:bg-slate-600'
    default:
      return 'bg-slate-200 text-slate-800 hover:bg-slate-300'
  }
}

const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

const formatMoney = (val: number) => {
  if (!val) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

export function PurchasingTasksTable({ tasks, onSelectTask, loading }: any) {
  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-md">
        Loading tasks...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-md">
        No tasks found.
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WO Number</TableHead>
            <TableHead>Component</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Finish Date</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="text-right">Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task: any) => {
            const isLate =
              task.finish_date &&
              isPast(new Date(task.finish_date)) &&
              !isToday(new Date(task.finish_date)) &&
              task.status !== 'complete'

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectTask(task)}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {task.work_orders?.wo_number || '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap">{task.component_name}</TableCell>
                <TableCell className="whitespace-nowrap">{task.supplier || '-'}</TableCell>
                <TableCell>{task.quantity || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{formatMoney(task.unit_price)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatMoney(task.total_price)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(task.start_date)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className={isLate ? 'text-rose-600 font-medium' : ''}>
                      {formatDate(task.finish_date)}
                    </span>
                    {isLate && <AlertCircle className="w-3 h-3 text-rose-600" />}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(task.completion_date)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getStatusColor(task.status)} text-white border-transparent whitespace-nowrap`}
                  >
                    {formatStatus(task.status)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{task.users?.full_name || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {task.purchasing_task_comments_history?.[0]?.count || 0}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
