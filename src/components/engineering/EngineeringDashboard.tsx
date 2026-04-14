import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getEngineeringDashboardData,
  EngineeringFilters,
  DashboardData,
} from '@/services/engineering-dashboard'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { MultiSelect } from '@/components/MultiSelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { subDays } from 'date-fns'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Loader2,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  TrendingUp,
  FileDown,
} from 'lucide-react'

const ALL_METRICS = [
  'Total Tasks',
  'Completed',
  'Completion Rate',
  'Delayed Tasks',
  'At Risk Tasks',
  'Completion by Task Type',
  'Completion Trend',
  'Task Status by Category',
  'Top 10 Delayed',
]

export function EngineeringDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(ALL_METRICS)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'Engineering Dashboard')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<EngineeringFilters>({
    period: 'custom',
    engineer: '',
    designer: '',
    productDivision: '',
    customer: '',
    machineFamily: '',
    machineModel: '',
    woNumber: '',
    tasksCompleted: false,
    tasksAtRisk: false,
    tasksDelayed: false,
  })

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const result = await getEngineeringDashboardData({
          ...filters,
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to?.toISOString(),
        })
        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters, dateRange])

  const updateFilter = (key: keyof EngineeringFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setDateRange({ from: subDays(new Date(), 30), to: new Date() })
    setSelectedMetrics(ALL_METRICS)
    setFilters({
      period: 'custom',
      engineer: '',
      designer: '',
      productDivision: '',
      customer: '',
      machineFamily: '',
      machineModel: '',
      woNumber: '',
      tasksCompleted: false,
      tasksAtRisk: false,
      tasksDelayed: false,
    })
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader
        title="Engineering Dashboard"
        description="Real-time engineering performance and insights"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Engineer</Label>
          <Input
            value={filters.engineer}
            onChange={(e) => updateFilter('engineer', e.target.value)}
            placeholder="Search Engineer..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Designer</Label>
          <Input
            value={filters.designer}
            onChange={(e) => updateFilter('designer', e.target.value)}
            placeholder="Search Designer..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Product Division</Label>
          <Input
            value={filters.productDivision}
            onChange={(e) => updateFilter('productDivision', e.target.value)}
            placeholder="Search Division..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Customer</Label>
          <Input
            value={filters.customer}
            onChange={(e) => updateFilter('customer', e.target.value)}
            placeholder="Search Customer..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Machine Family</Label>
          <Input
            value={filters.machineFamily}
            onChange={(e) => updateFilter('machineFamily', e.target.value)}
            placeholder="Search Family..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Machine Model</Label>
          <Input
            value={filters.machineModel}
            onChange={(e) => updateFilter('machineModel', e.target.value)}
            placeholder="Search Model..."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">WO Number</Label>
          <Input
            value={filters.woNumber}
            onChange={(e) => updateFilter('woNumber', e.target.value)}
            placeholder="Search WO..."
          />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="t-comp"
              checked={filters.tasksCompleted}
              onCheckedChange={(v) => updateFilter('tasksCompleted', v)}
            />
            <Label htmlFor="t-comp" className="text-sm">
              Tasks Completed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="t-risk"
              checked={filters.tasksAtRisk}
              onCheckedChange={(v) => updateFilter('tasksAtRisk', v)}
            />
            <Label htmlFor="t-risk" className="text-sm">
              Tasks at Risk
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="t-del"
              checked={filters.tasksDelayed}
              onCheckedChange={(v) => updateFilter('tasksDelayed', v)}
            />
            <Label htmlFor="t-del" className="text-sm">
              Tasks Delayed
            </Label>
          </div>
        </div>
        <div className="col-span-full mt-2">
          <Label className="text-xs text-slate-500 mb-1">Metrics</Label>
          <MultiSelect
            options={ALL_METRICS}
            selected={selectedMetrics}
            onChange={setSelectedMetrics}
            placeholder="Select metrics..."
          />
        </div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6 bg-transparent">
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {selectedMetrics.includes('Total Tasks') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.kpis.totalTasks}</div>
                </CardContent>
              </Card>
            )}
            {selectedMetrics.includes('Completed') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.kpis.completedTasks}</div>
                </CardContent>
              </Card>
            )}
            {selectedMetrics.includes('Completion Rate') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.kpis.completionRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
            )}
            {selectedMetrics.includes('Delayed Tasks') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{data.kpis.delayedTasks}</div>
                </CardContent>
              </Card>
            )}
            {selectedMetrics.includes('At Risk Tasks') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">At Risk Tasks</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{data.kpis.atRiskTasks}</div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedMetrics.includes('Completion by Task Type') && (
              <Card>
                <CardHeader>
                  <CardTitle>Completion by Task Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completionRate: { label: 'Completion %', color: 'hsl(var(--primary))' },
                    }}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={data.progressByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="type" />
                      <YAxis unit="%" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="completionRate"
                        fill="var(--color-completionRate)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {selectedMetrics.includes('Completion Trend') && (
              <Card>
                <CardHeader>
                  <CardTitle>Completion Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completed: { label: 'Completed Tasks', color: 'hsl(var(--primary))' },
                    }}
                    className="h-[300px] w-full"
                  >
                    <LineChart data={data.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="var(--color-completed)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {selectedMetrics.includes('Task Status by Category') && (
            <Card>
              <CardHeader>
                <CardTitle>Task Status by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    not_started: { label: 'Not Started', color: '#94a3b8' },
                    parked: { label: 'Parked', color: '#cbd5e1' },
                    on_track: { label: 'On Track', color: '#3b82f6' },
                    at_risk: { label: 'At Risk', color: '#f59e0b' },
                    delayed: { label: 'Delayed', color: '#ef4444' },
                    complete: { label: 'Complete', color: '#22c55e' },
                  }}
                  className="h-[350px] w-full"
                >
                  <BarChart
                    data={[
                      { name: 'Layouts', ...data.layoutsStatus },
                      { name: 'BOMs', ...data.bomsStatus },
                      { name: 'Travelers', ...data.travelersStatus },
                      { name: 'Accessories', ...data.accessoriesStatus },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="not_started" stackId="a" fill="var(--color-not_started)" />
                    <Bar dataKey="parked" stackId="a" fill="var(--color-parked)" />
                    <Bar dataKey="on_track" stackId="a" fill="var(--color-on_track)" />
                    <Bar dataKey="at_risk" stackId="a" fill="var(--color-at_risk)" />
                    <Bar dataKey="delayed" stackId="a" fill="var(--color-delayed)" />
                    <Bar dataKey="complete" stackId="a" fill="var(--color-complete)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {selectedMetrics.includes('Top 10 Delayed') && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Delayed Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Delay</TableHead>
                      <TableHead className="text-right">Pending Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topDelayed.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No delayed work orders found.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.topDelayed.map((wo) => (
                      <TableRow key={wo.wo_id}>
                        <TableCell className="font-medium">{wo.wo_number}</TableCell>
                        <TableCell>{wo.customer_name}</TableCell>
                        <TableCell>{format(new Date(wo.due_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{wo.delayDays} days</Badge>
                        </TableCell>
                        <TableCell className="text-right">{wo.pendingTasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
