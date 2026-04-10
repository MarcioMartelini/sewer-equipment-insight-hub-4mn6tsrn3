import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, AlertTriangle, XCircle, ListTodo, Timer } from 'lucide-react'

interface PurchasingPerformanceKPIsProps {
  tasks: any[]
  loading: boolean
}

export default function PurchasingPerformanceKPIs({
  tasks,
  loading,
}: PurchasingPerformanceKPIsProps) {
  const totalTasks = tasks.length

  const completedTasks = tasks.filter((t) => t.status === 'complete').length

  const onTimeTasks = tasks.filter((t) => {
    if (t.status !== 'complete' || !t.completion_date || !t.finish_date) return false
    return new Date(t.completion_date) <= new Date(t.finish_date)
  }).length

  const onTimePercentage = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'complete') return false
    if (!t.finish_date) return false
    return new Date(t.finish_date) < new Date()
  }).length

  const atRiskTasks = tasks.filter((t) => t.status === 'at_risk').length

  const completedWithDates = tasks.filter(
    (t) => t.status === 'complete' && t.start_date && t.completion_date,
  )
  const avgDays =
    completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((acc, t) => {
            const start = new Date(t.start_date)
            const end = new Date(t.completion_date)
            return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / completedWithDates.length,
        )
      : 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{completedTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On Time %</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{onTimePercentage}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At Risk Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{atRiskTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgDays} <span className="text-sm font-normal text-muted-foreground">days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
