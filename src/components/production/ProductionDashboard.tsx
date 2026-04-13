import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getProductionDashboardData,
  ProductionFilters,
  DashboardData,
} from '@/services/production-dashboard'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export function ProductionDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'Production Dashboard')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<ProductionFilters & { subDepartment?: string }>({
    period: 'custom',
    subDepartment: 'all',
    operator: '',
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
        const result = await getProductionDashboardData({
          ...filters,
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to?.toISOString(),
        } as any)
        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters, dateRange])

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setDateRange({ from: subDays(new Date(), 30), to: new Date() })
    setFilters({
      period: 'custom',
      subDepartment: 'all',
      operator: '',
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
        title="Production Dashboard"
        description="Real-time production performance and insights"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Sub Department</Label>
          <Select
            value={filters.subDepartment}
            onValueChange={(v) => updateFilter('subDepartment', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="weld_shop">Weld Shop</SelectItem>
              <SelectItem value="paint">Paint</SelectItem>
              <SelectItem value="sub_assembly">Sub Assembly</SelectItem>
              <SelectItem value="final_assembly">Final Assembly</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Operator</Label>
          <Input
            value={filters.operator}
            onChange={(e) => updateFilter('operator', e.target.value)}
            placeholder="Search Operator..."
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
              id="t-comp-prod"
              checked={filters.tasksCompleted}
              onCheckedChange={(v) => updateFilter('tasksCompleted', v)}
            />
            <Label htmlFor="t-comp-prod" className="text-sm">
              Tasks Completed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="t-risk-prod"
              checked={filters.tasksAtRisk}
              onCheckedChange={(v) => updateFilter('tasksAtRisk', v)}
            />
            <Label htmlFor="t-risk-prod" className="text-sm">
              Tasks at Risk
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="t-del-prod"
              checked={filters.tasksDelayed}
              onCheckedChange={(v) => updateFilter('tasksDelayed', v)}
            />
            <Label htmlFor="t-del-prod" className="text-sm">
              Tasks Delayed
            </Label>
          </div>
        </div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6 bg-transparent">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.kpis.totalTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.kpis.completedTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.kpis.completionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.kpis.delayedTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk Tasks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{data.kpis.atRiskTasks}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completion by Department</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ completed: { label: 'Completed Tasks', color: 'hsl(var(--primary))' } }}
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
          </div>

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
                      <TableCell>
                        {wo.due_date !== '-' ? format(new Date(wo.due_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
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
        </div>
      </div>
    </div>
  )
}
