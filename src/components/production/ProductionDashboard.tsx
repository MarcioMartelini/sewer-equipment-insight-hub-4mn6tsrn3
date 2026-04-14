import { useState, useEffect, useRef } from 'react'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { ProductionFiltersPanel } from './ProductionFiltersPanel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { format, subDays, parseISO } from 'date-fns'
import { Loader2, Settings, Hammer, Zap, AlertTriangle } from 'lucide-react'

export function ProductionDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'Production Dashboard')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [filters, setFilters] = useState<any>({
    salesperson: 'all',
    division: 'all',
    region: 'all',
    customer: 'all',
    machineFamily: 'all',
    machineModel: 'all',
    quoteNumber: '',
    woNumber: '',
    metric: 'all',
  })

  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      salesperson: 'all',
      division: 'all',
      region: 'all',
      customer: 'all',
      machineFamily: 'all',
      machineModel: 'all',
      quoteNumber: '',
      woNumber: '',
      metric: 'all',
    })
  }

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('production_tasks')
        .select(
          'id, status, created_at, task_name, department, work_orders!inner(wo_number, customer_name, machine_model)',
        )

      if (dateRange.from) query = query.gte('created_at', dateRange.from.toISOString())
      if (dateRange.to) {
        const nextDay = new Date(dateRange.to)
        nextDay.setDate(nextDay.getDate() + 1)
        query = query.lt('created_at', nextDay.toISOString())
      }

      if (filters.woNumber) query = query.ilike('work_orders.wo_number', `%${filters.woNumber}%`)
      if (filters.customer && filters.customer !== 'all')
        query = query.ilike('work_orders.customer_name', `%${filters.customer}%`)
      if (filters.machineModel && filters.machineModel !== 'all')
        query = query.ilike('work_orders.machine_model', `%${filters.machineModel}%`)

      const { data: tasks, error } = await query
      if (error) throw error

      const statusCounts = {
        not_started: 0,
        parked: 0,
        on_track: 0,
        at_risk: 0,
        delayed: 0,
        complete: 0,
      }

      const trendsMap: Record<string, number> = {}

      tasks?.forEach((task) => {
        if (task.status && statusCounts[task.status as keyof typeof statusCounts] !== undefined) {
          statusCounts[task.status as keyof typeof statusCounts]++
        }

        if (task.created_at) {
          const date = format(parseISO(task.created_at), 'MM/dd')
          trendsMap[date] = (trendsMap[date] || 0) + 1
        }
      })

      const statusData = [
        { name: 'Complete', value: statusCounts.complete, color: '#10b981' },
        { name: 'On Track', value: statusCounts.on_track, color: '#3b82f6' },
        { name: 'At Risk', value: statusCounts.at_risk, color: '#f59e0b' },
        { name: 'Delayed', value: statusCounts.delayed, color: '#ef4444' },
        { name: 'Parked', value: statusCounts.parked, color: '#64748b' },
        { name: 'Not Started', value: statusCounts.not_started, color: '#cbd5e1' },
      ].filter((s) => s.value > 0)

      const trendData = Object.entries(trendsMap)
        .map(([date, count]) => ({ date, tasks: count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setData({
        totalTasks: tasks?.length || 0,
        completedTasks: statusCounts.complete,
        delayedTasks: statusCounts.delayed,
        parkedTasks: statusCounts.parked,
        statusData,
        trendData,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dateRange, filters])

  return (
    <div className="flex flex-col gap-6 pb-8 animate-fade-in">
      <DashboardHeader
        title="Production Overview"
        description="Production tasks performance, distribution and execution trends"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <ProductionFiltersPanel
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <div ref={dashboardRef} className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow dark:bg-slate-950">
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Total Tasks
                  </CardTitle>
                  <Settings className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {data?.totalTasks}
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Created in period
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow dark:bg-slate-950">
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Completed Tasks
                  </CardTitle>
                  <Zap className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {data?.completedTasks}
                  </div>
                  <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                    Successfully finished
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow dark:bg-slate-950">
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Delayed Tasks
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                    {data?.delayedTasks}
                  </div>
                  <p className="text-sm font-medium text-rose-600/70 dark:text-rose-400/70 mt-1">
                    Behind schedule
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow dark:bg-slate-950">
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Parked Tasks
                  </CardTitle>
                  <Hammer className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {data?.parkedTasks}
                  </div>
                  <p className="text-sm font-medium text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Currently on hold
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Task Status Distribution
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Current status breakdown of production tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[340px] flex items-center justify-center">
                  {data?.statusData?.length > 0 ? (
                    <ChartContainer
                      config={{
                        tasks: { label: 'Tasks', color: '#3b82f6' },
                      }}
                      className="h-full w-full"
                    >
                      <PieChart>
                        <Pie
                          data={data.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {data.statusData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-sm text-slate-400 dark:text-slate-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-950">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Task Creation Trend
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Volume of new production tasks created over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[340px]">
                  {data?.trendData?.length > 0 ? (
                    <ChartContainer
                      config={{
                        tasks: { label: 'Tasks', color: '#8b5cf6' },
                      }}
                      className="h-full w-full"
                    >
                      <LineChart
                        data={data.trendData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                          className="dark:stroke-slate-800"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="tasks"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
