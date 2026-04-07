import { useState, useEffect, useMemo } from 'react'
import { format, subDays, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ListTodoIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  CalendarIcon,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  EditStatusDialog,
  getTaskName,
  formatDate,
  getStatusBadge,
  formatStatusText,
} from './production-status-helpers'

export function ProductionSubDepartmentDashboard({
  department,
  tableName,
  title,
  selectedWoId,
}: {
  department: string
  tableName: string
  title: string
  selectedWoId: string
}) {
  const { toast } = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const fetchData = async () => {
    setLoading(true)
    let query = supabase.from(tableName).select('*, work_orders(wo_number)')
    if (selectedWoId !== 'all') query = query.eq('wo_id', selectedWoId)
    const { data: res, error } = await query
    if (!error && res) setData(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [tableName, selectedWoId])

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    const { error } = await supabase
      .from(tableName)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) toast({ title: 'Erro', description: 'Falha.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Salvo.' })
      fetchData()
    }
  }

  const filteredData = useMemo(() => {
    if (period === 'all') return data
    let fromDate = new Date(),
      toDate = new Date()
    if (period === '7') fromDate = subDays(new Date(), 7)
    else if (period === '30') fromDate = subDays(new Date(), 30)
    else if (period === '90') fromDate = subDays(new Date(), 90)
    else if (period === 'custom' && dateRange?.from) {
      fromDate = dateRange.from
      toDate = dateRange.to || dateRange.from
    } else if (period === 'custom') return data

    fromDate = startOfDay(fromDate)
    toDate = endOfDay(toDate)
    return data.filter((item) => {
      const created = parseISO(item.created_at)
      return isAfter(created, fromDate) && isAfter(toDate, created)
    })
  }, [data, period, dateRange])

  const total = filteredData.length
  const completed = filteredData.filter((d) => d.status?.toLowerCase() === 'complete').length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  const delayed = filteredData.filter((d) => d.status?.toLowerCase() === 'delayed').length
  const atRisk = filteredData.filter((d) => d.status?.toLowerCase() === 'at risk').length

  const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#94a3b8', '#64748b']
  const statusChartData = Object.entries(
    filteredData.reduce(
      (acc, curr) => {
        const s = curr.status?.toLowerCase() || 'not started'
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  const trendChartData = Object.entries(
    filteredData.reduce(
      (acc, curr) => {
        if (!curr.updated_at || curr.status?.toLowerCase() !== 'complete') return acc
        const d = format(parseISO(curr.updated_at), 'MMM dd')
        acc[d] = (acc[d] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .map(([date, completadas]) => ({ date, completadas }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const topDelayed = [...filteredData]
    .filter((d) => d.status?.toLowerCase() === 'delayed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title} Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {period === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ListTodoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completas</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conclusão</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <ClockIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delayed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRisk}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ChartContainer
              config={{ value: { color: 'hsl(var(--primary))' } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendência</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ChartContainer
              config={{ completadas: { color: 'hsl(var(--primary))' } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="completadas"
                    strokeWidth={2}
                    dot={false}
                    stroke="var(--color-completadas)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            {topDelayed.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Criado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDelayed.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.work_orders?.wo_number || i.wo_id}</TableCell>
                      <TableCell>{getTaskName(i, tableName)}</TableCell>
                      <TableCell>{formatDate(i.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Todas as Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.work_orders?.wo_number || i.wo_id}</TableCell>
                      <TableCell>{getTaskName(i, tableName)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(i.status)}>
                          {formatStatusText(i.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EditStatusDialog
                          item={i}
                          tableName={tableName}
                          onUpdate={handleUpdateStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
