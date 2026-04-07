import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area } from 'recharts'
import {
  getMetricsDefinitions,
  getMetricsTracking,
  getActiveAlerts,
  acknowledgeAlert,
  MetricDefinition,
  MetricTracking,
} from '@/services/metrics'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Activity, AlertTriangle, CheckCircle, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

const chartConfig = {
  value: {
    label: 'Valor',
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
  const [department, setDepartment] = useState<string>('Todos')
  const [metricsDef, setMetricsDef] = useState<MetricDefinition[]>([])
  const [metricsTrack, setMetricsTrack] = useState<MetricTracking[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [defs, tracks, activeAlerts] = await Promise.all([
        getMetricsDefinitions(department),
        getMetricsTracking(department),
        getActiveAlerts(),
      ])
      setMetricsDef(defs)
      setMetricsTrack(tracks)
      setAlerts(activeAlerts)
    } catch (err: any) {
      toast({ title: 'Erro ao carregar dados', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [department])

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id)
      toast({ title: 'Alerta reconhecido com sucesso' })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao reconhecer alerta',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const departments = ['Todos', 'Sales', 'Engineering', 'Purchasing', 'Production', 'Quality', 'HR']

  const metricsData = useMemo(() => {
    return metricsDef.map((def) => {
      const trackings = metricsTrack
        .filter((t) => t.metric_name === def.metric_name && t.department === def.department)
        .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())

      const latest = trackings[trackings.length - 1]
      const currentValue = latest ? latest.metric_value : 0
      const status = getStatus(currentValue, def.threshold_min, def.threshold_max)
      const chartData = trackings.map((t) => ({
        date: format(parseISO(t.recorded_date), 'dd/MM'),
        value: t.metric_value,
      }))

      return { def, currentValue, status, chartData }
    })
  }, [metricsDef, metricsTrack])

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Métricas</h1>
          <p className="text-muted-foreground">Monitore o desempenho e alertas em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o departamento" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricsData.map((m, i) => (
          <Card key={`${m.def.id}-${i}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                {m.def.metric_name}
                <Activity className={cn('h-4 w-4', statusColors[m.status])} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-4">
                <div className={cn('text-2xl font-bold', statusColors[m.status])}>
                  {m.currentValue}{' '}
                  <span className="text-sm font-normal text-muted-foreground">{m.def.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Limites: {m.def.threshold_min ?? '-'} ~ {m.def.threshold_max ?? '-'}
                </div>
              </div>

              <div className="h-[80px]">
                {m.chartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={m.chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
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
                        fillOpacity={1}
                        fill={`url(#fill-${i})`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Sem dados recentes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {metricsData.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            Nenhuma métrica encontrada para este departamento.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Alertas Ativos</h2>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO ID</TableHead>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                      Nenhum alerta pendente.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.work_orders?.wo_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {alert.alert_rules?.metrics_definitions?.metric_name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={alert.alert_message}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="truncate">{alert.alert_message}</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.users?.full_name || 'Não atribuído'}</TableCell>
                      <TableCell>
                        <Badge
                          className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0"
                          variant="secondary"
                        >
                          {alert.alert_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reconhecer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
