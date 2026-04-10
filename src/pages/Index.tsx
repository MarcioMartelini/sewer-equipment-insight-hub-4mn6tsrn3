import { useState, useEffect, useMemo } from 'react'
import {
  getMetricsDefinitions,
  getMetricsTracking,
  MetricDefinition,
  MetricTracking,
} from '@/services/metrics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Loader2, TrendingUp, TrendingDown, Minus, LayoutDashboard } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Index() {
  const [department, setDepartment] = useState<string>('All')
  const [period, setPeriod] = useState<string>('30d')

  const [definitions, setDefinitions] = useState<MetricDefinition[]>([])
  const [tracking, setTracking] = useState<MetricTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [defs, tracks] = await Promise.all([
          getMetricsDefinitions(department),
          getMetricsTracking(department, period),
        ])
        setDefinitions(defs)
        setTracking(tracks)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [department, period])

  const departments = useMemo(() => {
    const deps = ['All', 'Sales', 'Production', 'Quality', 'HR', 'Engineering', 'Purchasing']
    return Array.from(new Set(deps))
  }, [])

  const metricsData = useMemo(() => {
    const grouped: Record<
      string,
      {
        definition: MetricDefinition
        data: any[]
        latestValue: number
        previousValue: number
        change: number
        trend: 'up' | 'down' | 'neutral'
      }
    > = {}

    definitions.forEach((def) => {
      const metricTracks = tracking.filter((t) => t.metric_name === def.metric_name)

      if (metricTracks.length > 0) {
        metricTracks.sort(
          (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime(),
        )

        const chartData = metricTracks.map((t) => ({
          date: format(new Date(t.recorded_date), 'MM/dd'),
          value: t.metric_value,
        }))

        const latestValue = metricTracks[metricTracks.length - 1].metric_value
        const previousValue = metricTracks.length > 1 ? metricTracks[0].metric_value : latestValue

        let change = 0
        if (previousValue !== 0) {
          change = ((latestValue - previousValue) / previousValue) * 100
        }

        let trend: 'up' | 'down' | 'neutral' = 'neutral'
        if (change > 0) trend = 'up'
        if (change < 0) trend = 'down'

        grouped[def.metric_name] = {
          definition: def,
          data: chartData,
          latestValue,
          previousValue,
          change,
          trend,
        }
      }
    })
    return grouped
  }, [definitions, tracking])

  const formatValue = (value: number, type: string | null, unit: string | null) => {
    let formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    if (type === 'financial' || unit === '$') return `$${formatted}`
    if (type === 'percentage' || unit === '%') return `${formatted}%`
    if (unit && unit !== '$' && unit !== '%') return `${formatted} ${unit}`
    return formatted
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Metrics Dashboard</h2>
            <p className="text-sm text-slate-500">Cross-department performance overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dep) => (
                <SelectItem key={dep} value={dep}>
                  {dep === 'All' ? 'All Departments' : dep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.values(metricsData).map((metric) => (
            <Card
              key={metric.definition.id}
              className="bg-white shadow-sm border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="font-semibold text-indigo-600 mb-1 uppercase tracking-wider text-xs">
                      {metric.definition.department}
                    </CardDescription>
                    <CardTitle className="text-lg text-slate-800 font-bold">
                      {metric.definition.metric_name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-end justify-between mb-6">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatValue(
                      metric.latestValue,
                      metric.definition.metric_type,
                      metric.definition.unit,
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex items-center text-sm font-bold px-2 py-1 rounded-full',
                      metric.trend === 'up'
                        ? 'bg-emerald-100 text-emerald-700'
                        : metric.trend === 'down'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {metric.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                    {metric.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                    {metric.trend === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
                    {Math.abs(metric.change).toFixed(1)}%
                  </div>
                </div>

                <div className="h-[100px] w-full mt-4 -ml-2">
                  <ChartContainer
                    config={{ value: { label: metric.definition.metric_name, color: '#4f46e5' } }}
                    className="h-full w-full"
                  >
                    <LineChart data={metric.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis
                        hide
                        domain={[
                          'dataMin - (dataMax - dataMin) * 0.1',
                          'dataMax + (dataMax - dataMin) * 0.1',
                        ]}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.keys(metricsData).length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-16 bg-slate-50/80 rounded-xl border border-slate-200 border-dashed">
              <LayoutDashboard className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-semibold text-lg">No metrics available</p>
              <p className="text-slate-500 text-sm mt-1">
                Try changing the department or period filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
