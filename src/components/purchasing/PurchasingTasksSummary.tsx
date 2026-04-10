import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, Clock, ListTodo, TrendingUp } from 'lucide-react'

export function PurchasingTasksSummary({ tasks }: { tasks: any[] }) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'complete').length
  const overdue = tasks.filter((t) => t.status === 'delayed').length
  const atRisk = tasks.filter((t) => t.status === 'at_risk').length

  const onTimeTasks = tasks.filter(
    (t) =>
      t.status === 'complete' &&
      t.completion_date &&
      t.finish_date &&
      new Date(t.completion_date) <= new Date(t.finish_date),
  ).length
  const onTimePercent = completed > 0 ? Math.round((onTimeTasks / completed) * 100) : 100

  const metrics = [
    { title: 'Total Tasks', value: total, icon: ListTodo, color: 'text-blue-500' },
    { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-500' },
    { title: 'On Time %', value: `${onTimePercent}%`, icon: TrendingUp, color: 'text-indigo-500' },
    { title: 'Overdue Tasks', value: overdue, icon: Clock, color: 'text-rose-500' },
    { title: 'At Risk Tasks', value: atRisk, icon: AlertTriangle, color: 'text-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon
        return (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <Icon className={`h-4 w-4 ${m.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
