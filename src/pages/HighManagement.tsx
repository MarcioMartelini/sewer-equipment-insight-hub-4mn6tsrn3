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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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
        <div className="col-span-full text-sm text-slate-500">More filters coming soon...</div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Department Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ progress: { label: 'Progress', color: 'hsl(var(--primary))' } }}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={deptProgress}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="department"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' } }}
                    className="h-[300px] w-full"
                  >
                    <LineChart data={trendData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={30}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                        width={60}
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

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Work Orders (Value)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top10.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium">{wo.wo_number}</TableCell>
                        <TableCell>{wo.customer_name}</TableCell>
                        <TableCell>{wo.department || '-'}</TableCell>
                        <TableCell>{wo.status}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(getQuoteData(wo.quotes).value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {top10.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
