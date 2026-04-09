import { WorkOrder, Department } from '@/types/work-order'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertTriangle, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkOrderKanbanProps {
  data: WorkOrder[]
}

const DEPARTMENTS: Department[] = [
  'Sales',
  'Engineering',
  'Purchasing',
  'Production',
  'Quality',
  'Delivery',
  'Warranty',
]

export function WorkOrderKanban({ data }: WorkOrderKanbanProps) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year}`
  }

  const getBorderColor = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('not started') || s === 'pending') return 'border-l-gray-300'
    if (s.includes('parked')) return 'border-l-amber-400'
    if (s.includes('on track') || s === 'in process' || s === 'in progress')
      return 'border-l-blue-400'
    if (s.includes('at risk')) return 'border-l-orange-400'
    if (s.includes('delayed')) return 'border-l-red-500'
    if (s.includes('complete')) return 'border-l-emerald-400'
    return 'border-l-slate-200'
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
        <p className="text-slate-500">No Work Orders found for the selected filters.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] animate-fade-in items-start custom-scrollbar">
      {DEPARTMENTS.map((dept) => {
        const columnData = data.filter((wo) => wo.department === dept)

        return (
          <div
            key={dept}
            className="flex flex-col w-[300px] shrink-0 bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden max-h-full"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-100 sticky top-0 z-10">
              <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
                {dept}
              </h3>
              <span className="bg-white text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                {columnData.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar flex-1">
              {columnData.map((wo, i) => (
                <div
                  key={wo.id}
                  className={cn(
                    'bg-white rounded-lg p-4 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-elevation hover:-translate-y-1 hover:border-indigo-200 cursor-pointer border-l-4 group shrink-0',
                    getBorderColor(wo.status),
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                      {wo.id}
                    </span>
                    {(wo.status?.toLowerCase() === 'delayed' ||
                      wo.status?.toLowerCase() === 'at risk') && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'p-1 rounded-full',
                              wo.status?.toLowerCase() === 'delayed'
                                ? 'bg-red-50 text-red-500 animate-pulse'
                                : 'bg-orange-50 text-orange-500',
                            )}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className={
                            wo.status?.toLowerCase() === 'delayed' ? 'bg-red-600' : 'bg-orange-600'
                          }
                        >
                          <p>
                            {wo.status?.toLowerCase() === 'delayed'
                              ? `Delayed by ${wo.daysOverdue || 0} days`
                              : 'Pay attention to deadline'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <p className="font-semibold text-slate-700 text-sm mb-1 leading-tight">
                    {wo.customer}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 truncate" title={wo.productType}>
                    {wo.productType}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge
                        status={wo.status}
                        className="text-[10px] px-1.5 py-0 border-0"
                      />
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <CalendarDays className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formatDate(wo.dueDate)}
                      </div>
                    </div>
                    <Progress
                      value={wo.progress}
                      className="h-1.5 w-full bg-slate-100"
                      indicatorClassName={cn(
                        'bg-indigo-500 transition-all duration-500',
                        wo.progress === 100 && 'bg-emerald-500',
                        wo.status?.toLowerCase() === 'delayed' && 'bg-red-500',
                      )}
                    />
                  </div>
                </div>
              ))}
              {columnData.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                  <span className="text-xs text-slate-400 font-medium">No items</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
