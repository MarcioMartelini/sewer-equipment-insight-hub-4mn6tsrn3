import { useState, useEffect, useMemo, useRef } from 'react'
import {
  getMetricsDefinitions,
  getMetricsTracking,
  MetricDefinition,
  MetricTracking,
} from '@/services/metrics'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
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
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutDashboard,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DateRange } from 'react-day-picker'
import { format, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { MultiSelect } from '@/components/MultiSelect'

export default function GeneralMetricsDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(
    dashboardRef,
    'General Metrics Dashboard',
  )

  const [department, setDepartment] = useState<string>('All')
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])

  const [definitions, setDefinitions] = useState<MetricDefinition[]>([])
  const [tracking, setTracking] = useState<MetricTracking[]>([])
  const [salesData, setSalesData] = useState<{ quotes: any[]; workOrders: any[] }>({
    quotes: [],
    workOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [defs, tracks] = await Promise.all([
          getMetricsDefinitions(department),
          getMetricsTracking(department, date?.from, date?.to),
        ])

        const filteredDefs = defs.filter(
          (d) => d.department !== 'Sales' && d.department !== 'Vendas',
        )
        const filteredTracks = tracks.filter(
          (t) => t.department !== 'Sales' && t.department !== 'Vendas',
        )

        setDefinitions(filteredDefs)
        setTracking(filteredTracks)

        if (department === 'Sales' || department === 'All') {
          let qQuery = supabase
            .from('quotes')
            .select(
              'id, quote_value, profit_margin_percentage, status, created_at, approval_date, customer_name',
            )
            .is('deleted_at', null)
          let wQuery = supabase
            .from('work_orders')
            .select('id, price, profit_margin, created_at, customer_name')
            .is('deleted_at', null)

          if (date?.from) {
            qQuery = qQuery.gte('created_at', date.from.toISOString())
            wQuery = wQuery.gte('created_at', date.from.toISOString())
          }
          if (date?.to) {
            const nextDay = new Date(date.to)
            nextDay.setDate(nextDay.getDate() + 1)
            qQuery = qQuery.lt('created_at', nextDay.toISOString())
            wQuery = wQuery.lt('created_at', nextDay.toISOString())
          }

          const [qRes, wRes] = await Promise.all([qQuery, wQuery])
          setSalesData({ quotes: qRes.data || [], workOrders: wRes.data || [] })
        } else {
          setSalesData({ quotes: [], workOrders: [] })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [department, date])

  const departments = useMemo(() => {
    const deps = ['All', 'Sales', 'Production', 'Quality', 'HR', 'Engineering', 'Purchasing']
    return Array.from(new Set(deps))
  }, [])

  const metricsData = useMemo(() => {
    const grouped: Record<
      string,
      {
        definition: any
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
        if (previousValue && previousValue !== 0) {
          change = ((latestValue - previousValue) / previousValue) * 100
        }
        if (!isFinite(change) || isNaN(change)) change = 0

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

    if (department === 'Sales' || department === 'All') {
      const { quotes, workOrders } = salesData

      const revenueByDay: Record<string, number> = {}
      const wosByDay: Record<string, number> = {}
      let totalRevenue = 0
      let totalMargin = 0
      let marginCount = 0

      workOrders.forEach((wo) => {
        const val = Number(wo.price || 0)
        totalRevenue += val

        const day = format(new Date(wo.created_at), 'MM/dd')
        revenueByDay[day] = (revenueByDay[day] || 0) + val
        wosByDay[day] = (wosByDay[day] || 0) + 1

        const m = Number(wo.profit_margin || 0)
        if (m > 0) {
          totalMargin += m
          marginCount++
        }
      })

      const revChart = Object.entries(revenueByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }))

      const wosChart = Object.entries(wosByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }))

      const addSalesMetric = (
        name: string,
        val: number,
        type: string,
        unit: string,
        data: any[],
      ) => {
        let change = 0
        let trend: 'up' | 'down' | 'neutral' = 'neutral'
        if (data.length > 1) {
          const first = data[0].value
          const last = data[data.length - 1].value
          if (first && first !== 0) {
            change = ((last - first) / first) * 100
            if (!isFinite(change) || isNaN(change)) change = 0
            if (change > 0) trend = 'up'
            if (change < 0) trend = 'down'
          }
        }

        grouped[name] = {
          definition: {
            id: `sales-${name}`,
            department: 'Sales',
            metric_name: name,
            metric_type: type,
            unit,
          },
          data,
          latestValue: val,
          previousValue: 0,
          change,
          trend,
        }
      }

      addSalesMetric('Gross Revenue', totalRevenue, 'financial', '$', revChart)
      addSalesMetric(
        'Average Profit Margin',
        marginCount > 0 ? totalMargin / marginCount : 0,
        'percentage',
        '%',
        [],
      )

      const approvedQuotes = quotes.filter(
        (q) => q.status === 'approved' || q.status === 'converted',
      ).length
      const conversionRate = quotes.length > 0 ? (approvedQuotes / quotes.length) * 100 : 0
      addSalesMetric('Sales Conversion Rate', conversionRate, 'percentage', '%', [])

      let totalDays = 0
      let cycleCount = 0
      quotes
        .filter((q) => q.status === 'approved' || q.status === 'converted')
        .forEach((q) => {
          if (q.created_at && q.approval_date) {
            const diff = differenceInDays(new Date(q.approval_date), new Date(q.created_at))
            if (diff >= 0) {
              totalDays += diff
              cycleCount++
            }
          }
        })
      addSalesMetric(
        'Average Sales Cycle',
        cycleCount > 0 ? totalDays / cycleCount : 0,
        'number',
        'days',
        [],
      )

      const uniqueCustomers = new Set(workOrders.map((wo) => wo.customer_name).filter(Boolean)).size
      addSalesMetric(
        'Customer Lifetime Value',
        uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0,
        'financial',
        '$',
        [],
      )
      addSalesMetric(
        'Average Purchase Value',
        workOrders.length > 0 ? totalRevenue / workOrders.length : 0,
        'financial',
        '$',
        [],
      )
      addSalesMetric('Number of Purchases', workOrders.length, 'number', '', wosChart)
    }

    return grouped
  }, [definitions, tracking, salesData, department])

  const availableMetrics = useMemo(
    () => Object.values(metricsData).map((m) => m.definition.metric_name),
    [metricsData],
  )

  useEffect(() => {
    setSelectedMetrics(availableMetrics)
  }, [department, availableMetrics.length])

  const formatValue = (value: number, type: string | null, unit: string | null) => {
    let formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    if (type === 'financial' || unit === '$') return `$${formatted}`
    if (type === 'percentage' || unit === '%') return `${formatted}%`
    if (unit && unit !== '$' && unit !== '%') return `${formatted} ${unit}`
    return formatted
  }

  const resetFilters = () => {
    setDepartment('All')
    setDate({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    })
    setSelectedMetrics(availableMetrics)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader
        title="Generic Metrics"
        description="Other cross-department tracking"
        dateRange={date}
        setDateRange={setDate}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="bg-white">
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
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Metrics</Label>
          <MultiSelect
            options={availableMetrics}
            selected={selectedMetrics}
            onChange={setSelectedMetrics}
            placeholder="Select metrics..."
          />
        </div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(metricsData)
              .filter((metric) => selectedMetrics.includes(metric.definition.metric_name))
              .map((metric) => (
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
                      {metric.data.length > 0 ? (
                        <ChartContainer
                          config={{
                            value: { label: metric.definition.metric_name, color: '#4f46e5' },
                          }}
                          className="h-full w-full"
                        >
                          <LineChart data={metric.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
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
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
                          No trend data
                        </div>
                      )}
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
    </div>
  )
}
