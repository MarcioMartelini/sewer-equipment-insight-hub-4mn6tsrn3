import { useState, useEffect, useRef } from 'react'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart,
} from 'recharts'
import { supabase } from '@/lib/supabase/client'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { Bookmark, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export default function ExecutiveOverviewDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'Executive Overview')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      let woQuery = supabase.from('work_orders').select('created_at, price, status')
      if (dateRange.from) woQuery = woQuery.gte('created_at', dateRange.from.toISOString())
      if (dateRange.to) {
        const nextDay = new Date(dateRange.to)
        nextDay.setDate(nextDay.getDate() + 1)
        woQuery = woQuery.lt('created_at', nextDay.toISOString())
      }

      let engQuery = supabase.from('engineering_tasks').select('created_at, status')
      if (dateRange.from) engQuery = engQuery.gte('created_at', dateRange.from.toISOString())
      if (dateRange.to) {
        const nextDay = new Date(dateRange.to)
        nextDay.setDate(nextDay.getDate() + 1)
        engQuery = engQuery.lt('created_at', nextDay.toISOString())
      }

      let prodQuery = supabase.from('production_tasks').select('created_at, status')
      if (dateRange.from) prodQuery = prodQuery.gte('created_at', dateRange.from.toISOString())
      if (dateRange.to) {
        const nextDay = new Date(dateRange.to)
        nextDay.setDate(nextDay.getDate() + 1)
        prodQuery = prodQuery.lt('created_at', nextDay.toISOString())
      }

      let purchQuery = supabase.from('purchasing_tasks').select('created_at, status')
      if (dateRange.from) purchQuery = purchQuery.gte('created_at', dateRange.from.toISOString())
      if (dateRange.to) {
        const nextDay = new Date(dateRange.to)
        nextDay.setDate(nextDay.getDate() + 1)
        purchQuery = purchQuery.lt('created_at', nextDay.toISOString())
      }

      const [woRes, engRes, prodRes, purchRes] = await Promise.all([
        woQuery,
        engQuery,
        prodQuery,
        purchQuery,
      ])

      const groupedByDate: Record<string, any> = {}

      const processEntries = (entries: any[], key: string) => {
        entries?.forEach((e) => {
          if (!e.created_at) return
          const date = format(parseISO(e.created_at), 'MM/dd')
          if (!groupedByDate[date])
            groupedByDate[date] = { date, salesVolume: 0, engTasks: 0, prodTasks: 0, purchTasks: 0 }
          groupedByDate[date][key] += 1
        })
      }

      woRes.data?.forEach((e) => {
        if (!e.created_at) return
        const date = format(parseISO(e.created_at), 'MM/dd')
        if (!groupedByDate[date])
          groupedByDate[date] = { date, salesVolume: 0, engTasks: 0, prodTasks: 0, purchTasks: 0 }
        groupedByDate[date].salesVolume += Number(e.price || 0)
      })

      processEntries(engRes.data || [], 'engTasks')
      processEntries(prodRes.data || [], 'prodTasks')
      processEntries(purchRes.data || [], 'purchTasks')

      const chartData = Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date))

      setData({
        totalWos: woRes.data?.length || 0,
        totalSales: woRes.data?.reduce((sum, wo) => sum + Number(wo.price || 0), 0) || 0,
        totalEngTasks: engRes.data?.length || 0,
        totalProdTasks: prodRes.data?.length || 0,
        totalPurchTasks: purchRes.data?.length || 0,
        chartData,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dateRange])

  const [presets, setPresets] = useState<{ name: string; from: string; to: string }[]>([])
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('executive_dashboard_presets')
    if (saved) {
      try {
        setPresets(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved presets:', e)
      }
    }
  }, [])

  const savePreset = () => {
    if (!presetName || !dateRange.from || !dateRange.to) return
    const newPreset = {
      name: presetName,
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem('executive_dashboard_presets', JSON.stringify(updated))
    setPresetName('')
  }

  const applyPreset = (p: { from: string; to: string }) => {
    setDateRange({ from: new Date(p.from), to: new Date(p.to) })
  }

  const applyQuickFilter = (type: string) => {
    const now = new Date()
    switch (type) {
      case 'this_week':
        setDateRange({ from: startOfWeek(now), to: endOfWeek(now) })
        break
      case 'this_month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) })
        break
      case 'last_30_days':
        setDateRange({ from: subDays(now, 30), to: now })
        break
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader
        title="Executive Overview"
        description="Cross-department performance and correlations"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      >
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-dashed font-medium text-slate-700 bg-white"
              >
                <Bookmark className="w-4 h-4 mr-2 text-indigo-500" />
                Filter Presets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Filters
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => applyQuickFilter('this_week')}
                className="cursor-pointer rounded-md"
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => applyQuickFilter('this_month')}
                className="cursor-pointer rounded-md"
              >
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => applyQuickFilter('last_30_days')}
                className="cursor-pointer rounded-md"
              >
                Last 30 Days
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saved Presets
              </DropdownMenuLabel>
              {presets.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-slate-500 italic">
                  No presets saved yet
                </div>
              )}
              {presets.map((p, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => applyPreset(p)}
                  className="cursor-pointer rounded-md"
                >
                  {p.name}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="my-2" />

              <div className="flex gap-2 items-center px-2 py-1">
                <Input
                  placeholder="Name this preset..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="h-8 text-xs focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
                <Button
                  size="sm"
                  className="h-8 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                  onClick={savePreset}
                  disabled={!presetName || !dateRange.from}
                >
                  Save
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DashboardHeader>

      <div ref={dashboardRef} className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-600">
                    Total Sales Volume
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-slate-900">
                    $
                    {data?.totalSales.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-sm font-medium text-indigo-600 mt-1">
                    {data?.totalWos} Work Orders
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-600">
                    Engineering Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-slate-900">{data?.totalEngTasks}</div>
                  <p className="text-sm font-medium text-emerald-600 mt-1">Created in period</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-600">
                    Production Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-slate-900">{data?.totalProdTasks}</div>
                  <p className="text-sm font-medium text-amber-600 mt-1">Created in period</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold text-slate-600">
                    Purchasing Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold text-slate-900">{data?.totalPurchTasks}</div>
                  <p className="text-sm font-medium text-rose-600 mt-1">Created in period</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-lg text-slate-800">
                    Sales Volume vs Engineering Demand
                  </CardTitle>
                  <CardDescription>
                    Correlation between revenue ($) and volume of engineering tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[340px]">
                  {data?.chartData?.length > 0 ? (
                    <ChartContainer
                      config={{
                        salesVolume: { label: 'Sales ($)', color: '#10b981' },
                        engTasks: { label: 'Eng Tasks', color: '#6366f1' },
                      }}
                      className="h-full w-full"
                    >
                      <ComposedChart
                        data={data.chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#10b981"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#6366f1"
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="salesVolume"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="engTasks"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
                      No data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-lg text-slate-800">
                    Production vs Purchasing Demand
                  </CardTitle>
                  <CardDescription>Comparison of tasks created over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[340px]">
                  {data?.chartData?.length > 0 ? (
                    <ChartContainer
                      config={{
                        prodTasks: { label: 'Prod Tasks', color: '#f59e0b' },
                        purchTasks: { label: 'Purch Tasks', color: '#f43f5e' },
                      }}
                      className="h-full w-full"
                    >
                      <LineChart
                        data={data.chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="prodTasks"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="purchTasks"
                          stroke="#f43f5e"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
                      No data available for this period
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
