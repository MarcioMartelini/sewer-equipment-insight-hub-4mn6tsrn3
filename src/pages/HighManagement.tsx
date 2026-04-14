import { useState, useMemo, useRef } from 'react'
import { format, subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts'
import {
  FileText,
  CheckCircle2,
  Target,
  DollarSign,
  TrendingUp,
  Star,
  Loader2,
  LucideIcon,
} from 'lucide-react'
import { useHighManagement, getQuoteData } from '@/hooks/use-high-management'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      </CardContent>
    </Card>
  )
}

export default function HighManagement() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(
    dashboardRef,
    'High Management Dashboard',
  )

  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const startDate = date.from || subDays(new Date(), 30)
  const endDate = date.to || new Date()

  const { kpis, deptProgress, trendData, top10, loading } = useHighManagement(startDate, endDate)

  const resetFilters = () => {
    setDate({ from: subDays(new Date(), 30), to: new Date() })
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader
        title="High Management"
        description="Executive Overview and Strategic KPIs"
        dateRange={date}
        setDateRange={setDate}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div className="col-span-full text-sm text-slate-500 dark:text-slate-400">
          More filters coming soon...
        </div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KpiCard title="Total WOs" value={kpis.totalWOs} icon={FileText} />
              <KpiCard title="Completed WOs" value={kpis.completedWOs} icon={CheckCircle2} />
              <KpiCard title="Completion Rate" value={`${kpis.completionRate}%`} icon={Target} />
              <KpiCard
                title="Total Revenue"
                value={formatCurrency(kpis.totalRevenue)}
                icon={DollarSign}
              />
              <KpiCard
                title="Avg Margin"
                value={`${kpis.avgMargin.toFixed(1)}%`}
                icon={TrendingUp}
              />
              <KpiCard title="CSAT" value={`${kpis.csat.toFixed(1)}%`} icon={Star} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Department Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ progress: { label: 'Progress', color: 'hsl(var(--primary))' } }}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={deptProgress}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        className="dark:stroke-slate-800"
                      />
                      <XAxis
                        dataKey="department"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                        tick={{ fill: '#64748b' }}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' } }}
                    className="h-[300px] w-full"
                  >
                    <LineChart data={trendData}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        className="dark:stroke-slate-800"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={30}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={60}
                        tick={{ fill: '#64748b' }}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Top 10 Work Orders (Value)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        WO Number
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Customer
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Department
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top10.map((wo) => (
                      <TableRow
                        key={wo.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {wo.wo_number}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {wo.customer_name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {wo.department || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {wo.status}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(getQuoteData(wo.quotes).value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {top10.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-slate-500 dark:text-slate-400"
                        >
                          No data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
