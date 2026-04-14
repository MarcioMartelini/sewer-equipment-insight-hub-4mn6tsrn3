import { differenceInDays, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react'

interface ProductionKanbanKPIsProps {
  tasks: any[]
}

export function ProductionKanbanKPIs({ tasks }: ProductionKanbanKPIsProps) {
  // Calculate Average Cycle Time (for completed tasks with start and finish dates)
  const completedTasks = tasks.filter(
    (t) => t.status === 'Completed' && t.start_date && t.finish_date,
  )
  let totalDays = 0
  completedTasks.forEach((t) => {
    const start = parseISO(t.start_date)
    const finish = parseISO(t.finish_date)
    totalDays += Math.max(1, differenceInDays(finish, start))
  })
  const avgCycleTime = completedTasks.length ? Math.round(totalDays / completedTasks.length) : 0

  // Identify Bottlenecks (departments with most non-completed tasks)
  const activeTasks = tasks.filter((t) => t.status !== 'Completed')
  const deptCounts = activeTasks.reduce(
    (acc, t) => {
      if (t.department) {
        acc[t.department] = (acc[t.department] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])
  const bottleneckDept = sortedDepts.length > 0 ? sortedDepts[0][0] : 'N/A'
  const bottleneckCount = sortedDepts.length > 0 ? sortedDepts[0][1] : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Avg Cycle Time
            </p>
            <p className="text-2xl font-bold text-slate-800 truncate">{avgCycleTime} days</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Current Bottleneck
            </p>
            <div className="flex items-baseline gap-2 truncate">
              <p className="text-lg font-bold text-slate-800 truncate" title={bottleneckDept}>
                {bottleneckDept}
              </p>
            </div>
            {bottleneckCount > 0 && (
              <p className="text-xs font-semibold text-orange-600 truncate mt-0.5">
                {bottleneckCount} pending tasks
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Active Tasks
            </p>
            <p className="text-2xl font-bold text-slate-800 truncate">{activeTasks.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Completed
            </p>
            <p className="text-2xl font-bold text-slate-800 truncate">{completedTasks.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
