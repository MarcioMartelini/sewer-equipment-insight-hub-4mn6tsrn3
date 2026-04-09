import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { subDays, format } from 'date-fns'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  LineChart,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, ListTodo, TrendingDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DepartmentTasks } from '@/components/tasks/DepartmentTasks'

const DEPARTMENTS = [
  { t: 'production_weld_shop', n: 'Weld Shop' },
  { t: 'production_paint', n: 'Paint' },
  { t: 'production_sub_assembly', n: 'Sub Assembly' },
  { t: 'production_warehouse', n: 'Warehouse' },
  { t: 'production_final_assembly', n: 'Final Assembly' },
  { t: 'production_tests', n: 'Tests' },
]

export function ProductionDashboard() {
  const [period, setPeriod] = useState('30')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const allData: any[] = []
      const startDate =
        period === 'all' ? null : subDays(new Date(), parseInt(period)).toISOString()

      for (const d of DEPARTMENTS) {
        let q = supabase.from(d.t).select('status, updated_at, work_orders(wo_number, due_date)')
        if (startDate) q = q.gte('created_at', startDate)
        const { data: items } = await q
        if (items) items.forEach((i) => allData.push({ ...i, dept: d.n }))
      }
      setData(allData)
      setLoading(false)
    }
    fetchData()
  }, [period])

  const kpis = useMemo(() => {
    const total = data.length
    const comp = data.filter((d) => d.status?.toLowerCase() === 'complete').length
    return {
      total,
      comp,
      rate: total ? Math.round((comp / total) * 100) : 0,
      del: data.filter((d) => d.status?.toLowerCase() === 'delayed').length,
      risk: data.filter((d) => d.status?.toLowerCase() === 'at risk').length,
    }
  }, [data])

  const progressData = useMemo(
    () =>
      DEPARTMENTS.map((d) => {
        const dData = data.filter((x) => x.dept === d.n)
        const comp = dData.filter((x) => x.status?.toLowerCase() === 'complete').length
        return { name: d.n, rate: dData.length ? Math.round((comp / dData.length) * 100) : 0 }
      }),
    [data],
  )

  const trendData = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 29; i >= 0; i--) map.set(format(subDays(new Date(), i), 'MMM dd'), 0)
    data
      .filter((d) => d.status?.toLowerCase() === 'complete')
      .forEach((d) => {
        const dateStr = d.updated_at ? format(new Date(d.updated_at), 'MMM dd') : null
        if (dateStr && map.has(dateStr)) map.set(dateStr, map.get(dateStr)! + 1)
      })
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
  }, [data])

  const topWOs = useMemo(() => {
    const map = new Map<string, any>()
    data.forEach((d) => {
      if (d.status?.toLowerCase() === 'delayed' && d.work_orders) {
        const wo = Array.isArray(d.work_orders) ? d.work_orders[0] : d.work_orders
        if (!wo) return
        if (!map.has(wo.wo_number)) {
          let delay = 0
          if (wo.due_date) {
            delay = Math.max(
              0,
              Math.floor((new Date().getTime() - new Date(wo.due_date).getTime()) / 86400000),
            )
          }
          map.set(wo.wo_number, { num: wo.wo_number, due: wo.due_date || '-', delay, tasks: 0 })
        }
        map.get(wo.wo_number)!.tasks += 1
      }
    })
    return Array.from(map.values())
      .sort((a, b) => b.delay - a.delay || b.tasks - a.tasks)
      .slice(0, 10)
  }, [data])

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <div>
            <h2 className="text-2xl font-bold">Production Dashboard</h2>
            <p className="text-muted-foreground">Métricas e acompanhamento do chão de fábrica.</p>
          </div>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Schedule</TabsTrigger>
          </TabsList>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Tarefas"
              val={kpis.total}
              icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Completas"
              val={kpis.comp}
              icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            />
            <MetricCard
              title="Conclusão"
              val={`${kpis.rate}%`}
              icon={<TrendingDown className="h-4 w-4 text-blue-500" />}
            />
            <MetricCard
              title="Atrasadas"
              val={kpis.del}
              icon={<Clock className="h-4 w-4 text-red-500" />}
            />
            <MetricCard
              title="Em Risco"
              val={kpis.risk}
              icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progresso (%)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{ rate: { label: 'Conclusão (%)', color: 'hsl(var(--primary))' } }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="rate" fill="var(--color-rate)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conclusão (30 Dias)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{ count: { label: 'Tarefas', color: 'hsl(var(--primary))' } }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-count)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Work Orders Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              {topWOs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma Work Order atrasada encontrada.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO</TableHead>
                      <TableHead>Data de Entrega</TableHead>
                      <TableHead className="text-right">Dias de Atraso</TableHead>
                      <TableHead className="text-right">Tarefas Atrasadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topWOs.map((wo) => (
                      <TableRow key={wo.num}>
                        <TableCell className="font-medium">{wo.num}</TableCell>
                        <TableCell>
                          {wo.due !== '-' ? format(new Date(wo.due), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{wo.delay} dias</Badge>
                        </TableCell>
                        <TableCell className="text-right">{wo.tasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="tasks" className="mt-0">
        <DepartmentTasks department="Production" />
      </TabsContent>
    </Tabs>
  )
}

function MetricCard({ title, val, icon }: { title: string; val: string | number; icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{val}</div>
      </CardContent>
    </Card>
  )
}
