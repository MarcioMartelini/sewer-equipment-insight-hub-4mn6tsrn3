import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { format, parseISO } from 'date-fns'

export default function PurchasingPerformanceCharts({
  tasks,
  loading,
}: {
  tasks: any[]
  loading: boolean
}) {
  const lineData = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (!t.created_at) return
      const date = t.created_at.split('T')[0]
      counts[date] = (counts[date] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date: format(parseISO(date), 'MMM dd'), count }))
      .slice(-30)
  }, [tasks])

  const barData = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (!t.supplier) return
      counts[t.supplier] = (counts[t.supplier] || 0) + 1
    })
    return Object.entries(counts)
      .map(([supplier, count]) => ({ supplier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [tasks])

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      const status = t.status || 'not_started'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const areaData = useMemo(() => {
    const stats: Record<string, { total: number; onTime: number }> = {}
    tasks
      .filter((t) => t.status === 'complete' && t.completion_date)
      .forEach((t) => {
        const date = t.completion_date!.split('T')[0]
        if (!stats[date]) stats[date] = { total: 0, onTime: 0 }
        stats[date].total += 1
        if (t.finish_date && new Date(t.completion_date!) <= new Date(t.finish_date)) {
          stats[date].onTime += 1
        }
      })
    return Object.entries(stats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stat]) => ({
        date: format(parseISO(date), 'MMM dd'),
        percentage: Math.round((stat.onTime / stat.total) * 100),
      }))
      .slice(-30)
  }, [tasks])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444']

  if (loading) return <div className="h-64 flex items-center justify-center">Loading charts...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tasks Created Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{ count: { label: 'Tasks', color: 'hsl(var(--primary))' } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks by Supplier (Top 5)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{ count: { label: 'Tasks', color: 'hsl(var(--primary))' } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="supplier" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>On Time % Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer
            config={{ percentage: { label: 'On Time %', color: 'hsl(var(--primary))' } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="var(--color-percentage)"
                  fill="var(--color-percentage)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
