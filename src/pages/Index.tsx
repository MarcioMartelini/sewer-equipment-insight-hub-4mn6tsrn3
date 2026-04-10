import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area } from 'recharts'
import {
  getMetricsDefinitions,
  getMetricsTracking,
  MetricDefinition,
  MetricTracking,
} from '@/services/metrics'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Activity, TrendingUp, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--primary))',
  },
}

const getStatus = (value: number, min: number | null, max: number | null) => {
  if (min === null && max === null) return 'success'

  const actualMin = min ?? 0
  const actualMax = max ?? (value > 0 ? value * 2 : 100)
  const range = actualMax - actualMin
  const tolerance = range * 0.1 // 10% tolerance

  if ((max !== null && value > max) || (min !== null && value < min)) {
    return 'destructive'
  }

  if (max !== null && value >= max - tolerance) return 'warning'
  if (min !== null && value <= min + tolerance) return 'warning'

  return 'success'
}

const statusColors: Record<string, string> = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  destructive: 'text-rose-500',
}

const getStatusColorHex = (status: string) => {
  switch (status) {
    case 'success':
      return '#10b981' // emerald-500
    case 'warning':
      return '#f59e0b' // amber-500
    case 'destructive':
      return '#f43f5e' // rose-500
    default:
      return '#64748b' // slate-500
  }
}

export default function Dashboard() {
  const [department, setDepartment] = useState<string>('All')
  const [period, setPeriod] = useState<string>('30d')
  const [metricsDef, setMetricsDef] = useState<MetricDefinition[]>([])
  const [metricsTrack, setMetricsTrack] = useState<MetricTracking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const fetchDept = department === 'All' ? 'Todos' : department
      const [defs, tracks] = await Promise.all([
        getMetricsDefinitions(fetchDept),
        getMetricsTracking(fetchDept, period),
      ])
      setMetricsDef(defs)
      setMetricsTrack(tracks)
    } catch (err: any) {
      toast({ title: 'Error loading data', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [department, period])

  const departments = ['All', 'Sales', 'Engineering', 'Purchasing', 'Production', 'Quality', 'HR']
  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
  ]

  const metricsData = useMemo(() => {
    return metricsDef.map((def) => {
      const trackings = metricsTrack
        .filter((t) => t.metric_name === def.metric_name && t.department === def.department)
        .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())

      const latest = trackings[trackings.length - 1]
      const currentValue = latest ? latest.metric_value : 0
      const status = getStatus(currentValue, def.threshold_min, def.threshold_max)

      let trend = 0
      if (trackings.length >= 2) {
        const prev = trackings[trackings.length - 2].metric_value
        if (prev > 0) {
          trend = ((currentValue - prev) / prev) * 100
        } else if (prev === 0 && currentValue > 0) {
          trend = 100
        } else if (prev === 0 && currentValue < 0) {
          trend = -100
        }
      }

      const chartData = trackings.map((t) => ({
        date: format(parseISO(t.recorded_date), 'MM/dd'),
        value: t.metric_value,
      }))

      return { def, currentValue, status, chartData, trend }
    })
  }, [metricsDef, metricsTrack])

  const metricsByDepartment = useMemo(() => {
    const grouped: Record<string, typeof metricsData> = {}
    metricsData.forEach((m) => {
      const dept = m.def.department || 'General'
      if (!grouped[dept]) grouped[dept] = []
      grouped[dept].push(m)
    })
    return grouped
  }, [metricsData])

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Metrics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor key performance indicators across departments.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground w-16 sm:w-auto">
              Period:
            </span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground w-16 sm:w-auto">Dept:</span>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(metricsByDepartment).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-dashed shadow-sm">
          <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No metrics found</h3>
          <p className="text-muted-foreground text-sm max-w-md mt-1">
            There are no metric definitions or tracking data available for the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(metricsByDepartment).map(([dept, metrics]) => (
            <div key={dept} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b text-foreground/90">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                {dept} Department
                <span className="text-xs font-normal text-muted-foreground ml-2 px-2.5 py-0.5 bg-muted rounded-full">
                  {metrics.length} metrics
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                  <Card
                    key={`${m.def.id}-${i}`}
                    className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
                  >
                    <CardHeader className="pb-2 bg-muted/20">
                      <CardTitle className="text-sm font-medium flex justify-between items-start gap-4">
                        <span className="line-clamp-2 leading-tight">{m.def.metric_name}</span>
                        <Activity
                          className={cn('h-4 w-4 shrink-0 mt-0.5', statusColors[m.status])}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-end justify-between mb-1">
                        <div
                          className={cn(
                            'text-3xl font-bold tracking-tight',
                            statusColors[m.status],
                          )}
                        >
                          {m.currentValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          <span className="text-sm font-normal text-muted-foreground ml-1.5">
                            {m.def.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 h-4">
                        <div className="flex items-center gap-1">
                          Limits: {m.def.threshold_min ?? '-'} ~ {m.def.threshold_max ?? '-'}
                        </div>
                        {m.trend !== 0 && m.chartData.length > 1 && (
                          <div
                            className={cn(
                              'flex items-center gap-0.5 font-medium px-1.5 rounded bg-background border shadow-xs',
                              m.trend > 0
                                ? 'text-emerald-500 border-emerald-500/20'
                                : 'text-rose-500 border-rose-500/20',
                            )}
                          >
                            <TrendingUp className={cn('h-3 w-3', m.trend < 0 && 'rotate-180')} />
                            {Math.abs(m.trend).toFixed(1)}%
                          </div>
                        )}
                      </div>

                      <div className="h-[60px] w-full mt-2">
                        {m.chartData.length > 0 ? (
                          <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart
                              data={m.chartData}
                              margin={{ top: 5, left: 0, right: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id={`fill-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop
                                    offset="5%"
                                    stopColor={getStatusColorHex(m.status)}
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={getStatusColorHex(m.status)}
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke={getStatusColorHex(m.status)}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#fill-${i})`}
                              />
                              <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                                cursor={{
                                  stroke: 'hsl(var(--muted-foreground))',
                                  strokeWidth: 1,
                                  strokeDasharray: '3 3',
                                }}
                              />
                            </AreaChart>
                          </ChartContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                            No recent data
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
