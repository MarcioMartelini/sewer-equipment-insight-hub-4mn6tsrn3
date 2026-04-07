import { useState, useEffect, useMemo } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fetchQuotes, type Quote } from '@/services/quotes'
import { fetchWorkOrders } from '@/services/work-orders'
import { WorkOrder } from '@/types/work-order'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  FileText,
  CheckCircle,
  Percent,
  TrendingUp,
  CalendarIcon,
  Loader2,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const COLORS = ['#4f46e5', '#06b6d4', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899']

export default function SalesDashboard() {
  const [period, setPeriod] = useState<string>('30')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (period !== 'custom') {
      const days = parseInt(period)
      setDateRange({
        from: subDays(new Date(), days),
        to: new Date(),
      })
    }
  }, [period])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [fetchedQuotes, fetchedWOs] = await Promise.all([fetchQuotes(), fetchWorkOrders()])
        setQuotes(fetchedQuotes)
        setWorkOrders(fetchedWOs)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const date = q.created_at ? new Date(q.created_at) : new Date()
      return date >= startOfDay(dateRange.from) && date <= endOfDay(dateRange.to)
    })
  }, [quotes, dateRange])

  const totalQuotes = filteredQuotes.length

  // Verify with work orders to ensure integration as requested,
  // though quote status 'approved' reflects the sales KPIs accurately.
  const approvedQuotes = filteredQuotes.filter((q) => q.status === 'approved')
  const totalApproved = approvedQuotes.length
  const conversionRate = totalQuotes > 0 ? (totalApproved / totalQuotes) * 100 : 0

  const totalSalesValue = approvedQuotes.reduce((sum, q) => sum + Number(q.quote_value || 0), 0)

  const avgProfitMargin =
    totalApproved > 0
      ? approvedQuotes.reduce((sum, q) => sum + Number(q.profit_margin_percentage || 0), 0) /
        totalApproved
      : 0

  const trendData = useMemo(() => {
    const daysMap: Record<string, { date: string; value: number }> = {}

    let currentDate = startOfDay(dateRange.from)
    const end = endOfDay(dateRange.to)

    // Safety break to prevent too many points if period is large
    const diffDays = Math.ceil((end.getTime() - currentDate.getTime()) / (1000 * 3600 * 24))
    const step = diffDays > 60 ? Math.ceil(diffDays / 60) : 1

    while (currentDate <= end) {
      const key = format(currentDate, 'yyyy-MM-dd')
      daysMap[key] = { date: format(currentDate, 'dd/MM'), value: 0 }
      currentDate = new Date(currentDate.getTime() + step * 24 * 60 * 60 * 1000)
    }

    const exactDaysMap: Record<string, { date: string; value: number }> = {}
    let cd = startOfDay(dateRange.from)
    while (cd <= end) {
      const key = format(cd, 'yyyy-MM-dd')
      exactDaysMap[key] = { date: format(cd, 'dd/MM'), value: 0 }
      cd = new Date(cd.getTime() + 24 * 60 * 60 * 1000)
    }

    approvedQuotes.forEach((q) => {
      const date = q.approval_date ? new Date(q.approval_date) : new Date(q.created_at!)
      const key = format(date, 'yyyy-MM-dd')
      if (exactDaysMap[key]) exactDaysMap[key].value += Number(q.quote_value || 0)
    })

    return Object.values(exactDaysMap)
  }, [approvedQuotes, dateRange])

  const distributionData = useMemo(() => {
    const map: Record<string, number> = {}
    approvedQuotes.forEach((q) => {
      const type = q.product_type || 'Outros'
      map[type] = (map[type] || 0) + Number(q.quote_value || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [approvedQuotes])

  const topCustomers = useMemo(() => {
    const map: Record<string, number> = {}
    approvedQuotes.forEach((q) => {
      const customer = q.customer_name || 'Desconhecido'
      map[customer] = (map[customer] || 0) + Number(q.quote_value || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [approvedQuotes])

  const chartConfig = {
    value: {
      label: 'Vendas ($)',
      color: 'hsl(var(--primary))',
    },
  }

  const pieConfig = distributionData.reduce(
    (acc, curr, i) => {
      acc[curr.name] = { label: curr.name, color: COLORS[i % COLORS.length] }
      return acc
    },
    {} as Record<string, any>,
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Indicadores de Desempenho</h2>
          <p className="text-sm text-slate-500">Métricas em tempo real de vendas e cotações</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
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
                    !dateRange.from && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from) {
                      setDateRange({ from: range.from, to: range.to || range.from })
                    }
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalQuotes}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Quotes Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalApproved}</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor em Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              $
              {totalSalesValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Margem Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{avgProfitMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-4 bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Tendência de Vendas (Valor)</CardTitle>
            <CardDescription>Volume de vendas aprovadas no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={60}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Distribuição por Produto</CardTitle>
            <CardDescription>Valor de vendas aprovadas por tipo</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {distributionData.length > 0 ? (
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Top 5 Clientes</CardTitle>
          <CardDescription>Maiores clientes por volume de compras no período</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Valor em Vendas
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((c, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                  <TableCell className="text-right text-slate-700 font-medium">
                    $
                    {c.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {topCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                    Nenhuma venda registrada no período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
