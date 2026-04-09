import { WorkOrder } from '@/types/work-order'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkOrderTableProps {
  data: WorkOrder[]
  totalCount?: number
  onClearFilters?: () => void
}

export function WorkOrderTable({ data, totalCount, onClearFilters }: WorkOrderTableProps) {
  const isFiltered = totalCount !== undefined && data.length < totalCount

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
        <p className="text-slate-500">No Work Orders found for the selected filters.</p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year}`
  }

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-700">{data.length}</span>{' '}
          {totalCount !== undefined ? `of ` : ''}
          {totalCount !== undefined && (
            <span className="font-bold text-slate-700">{totalCount}</span>
          )}{' '}
          tasks
        </p>
        {isFiltered && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="text-slate-600">
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px] font-semibold text-slate-700">WO ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Customer</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-slate-700">
                Product Type
              </TableHead>
              <TableHead className="font-semibold text-slate-700">Overall Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
              <TableHead className="hidden sm:table-cell w-[200px] font-semibold text-slate-700">
                Progress %
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((wo) => (
              <TableRow key={wo.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-900">
                  {wo.woNumber || wo.id}
                </TableCell>
                <TableCell className="font-medium text-slate-700">{wo.customer}</TableCell>
                <TableCell className="hidden md:table-cell text-slate-500">
                  {wo.productType}
                </TableCell>
                <TableCell>
                  <StatusBadge status={wo.status} />
                </TableCell>
                <TableCell className="text-slate-600 font-medium">
                  {formatDate(wo.dueDate)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-3">
                    <Progress
                      value={wo.progress}
                      className="h-2 flex-1 bg-slate-100"
                      indicatorClassName={cn(
                        'bg-indigo-500',
                        wo.progress === 100 && 'bg-emerald-500',
                        wo.status === 'Delayed' && 'bg-red-500',
                      )}
                    />
                    <span className="text-xs font-medium text-slate-500 w-8">{wo.progress}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
