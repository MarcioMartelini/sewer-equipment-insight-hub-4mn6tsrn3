import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Loader2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function Reports() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('preview')
  const [loading, setLoading] = useState(false)

  // Filters
  const [reportType, setReportType] = useState('Consolidado')
  const [department, setDepartment] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Data
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])

  const fetchPreviewData = async () => {
    setLoading(true)
    try {
      let query = supabase.from('work_orders').select('*')

      if (department && department !== 'all') {
        query = query.eq('department', department)
      }

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59.999Z')
      }

      const { data, error } = await query
      if (error) throw error

      setWorkOrders(data || [])

      let metricsQuery = supabase
        .from('metrics_tracking')
        .select('*')
        .order('recorded_date', { ascending: true })
      if (department && department !== 'all') {
        metricsQuery = metricsQuery.eq('department', department)
      }
      if (startDate) {
        metricsQuery = metricsQuery.gte('recorded_date', startDate)
      }
      if (endDate) {
        metricsQuery = metricsQuery.lte('recorded_date', endDate)
      }

      const { data: metricsData, error: metricsError } = await metricsQuery
      if (!metricsError) {
        setMetrics(metricsData || [])
      }
    } catch (error: any) {
      toast({ title: 'Erro ao buscar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('report_history' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchHistory()
      fetchPreviewData()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalWOs = workOrders.length
  const completedWOs = workOrders.filter((wo) => wo.status === 'Concluído').length
  const avgProgress =
    workOrders.length > 0
      ? Math.round(workOrders.reduce((acc, wo) => acc + (wo.progress || 0), 0) / workOrders.length)
      : 0

  const chartData = useMemo(() => {
    if (metrics.length > 0) {
      const agg: Record<string, number> = {}
      metrics.forEach((m) => {
        const date = m.recorded_date || 'N/A'
        agg[date] = (agg[date] || 0) + (m.metric_value || 0)
      })
      return Object.entries(agg)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } else {
      const agg: Record<string, number> = {}
      workOrders.forEach((wo) => {
        if (!wo.created_at) return
        const date = wo.created_at.split('T')[0]
        agg[date] = (agg[date] || 0) + 1
      })
      return Object.entries(agg)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  }, [metrics, workOrders])

  const chartConfig = {
    value: {
      label: metrics.length > 0 ? 'Valor da Métrica' : 'WOs Criadas',
      color: 'hsl(var(--primary))',
    },
  }

  const downloadCSV = () => {
    if (workOrders.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para exportar.',
        variant: 'destructive',
      })
      return
    }
    const headers = ['WO Number', 'Cliente', 'Departamento', 'Status', 'Progresso', 'Data Criação']
    const rows = workOrders.map((wo) => [
      wo.wo_number,
      `"${wo.customer_name}"`,
      wo.department || '',
      wo.status,
      wo.progress || 0,
      wo.created_at ? new Date(wo.created_at).toLocaleDateString() : '',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = async (format: 'PDF' | 'Excel' | 'CSV') => {
    try {
      await supabase.from('report_history' as any).insert({
        user_id: user?.id,
        report_type: reportType,
        department: department === 'all' ? null : department,
        date_start: startDate || null,
        date_end: endDate || null,
        format,
      })

      fetchHistory()

      toast({
        title: `Relatório ${format} gerado com sucesso!`,
        description:
          format === 'PDF' ? 'Preparando impressão...' : 'O download foi iniciado automaticamente.',
      })

      if (format === 'CSV' || format === 'Excel') {
        downloadCSV()
      } else if (format === 'PDF') {
        setTimeout(() => window.print(), 500)
      }
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao gerar relatório', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Exportação</h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados, visualize métricas e exporte dados corporativos.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="preview" className="flex-1 md:flex-none">
            Pré-visualização
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 md:flex-none">
            Histórico de Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Relatório</CardTitle>
              <CardDescription>
                Selecione os filtros desejados para compilar os dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label>Tipo de Relatório</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consolidado">Consolidado Geral</SelectItem>
                      <SelectItem value="Sales">Vendas (Sales)</SelectItem>
                      <SelectItem value="Engineering">Engenharia</SelectItem>
                      <SelectItem value="Purchasing">Compras</SelectItem>
                      <SelectItem value="Production">Produção</SelectItem>
                      <SelectItem value="Quality">Qualidade</SelectItem>
                      <SelectItem value="HR">Recursos Humanos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Departamentos</SelectItem>
                      <SelectItem value="Sales">Vendas</SelectItem>
                      <SelectItem value="Engineering">Engenharia</SelectItem>
                      <SelectItem value="Purchasing">Compras</SelectItem>
                      <SelectItem value="Production">Produção</SelectItem>
                      <SelectItem value="Quality">Qualidade</SelectItem>
                      <SelectItem value="HR">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t justify-end">
                <Button variant="ghost" onClick={fetchPreviewData} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Atualizar Dados
                </Button>
                <Button variant="outline" onClick={() => handleExport('CSV')} disabled={loading}>
                  <FileText className="w-4 h-4 mr-2" /> Exportar CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Excel')} disabled={loading}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
                </Button>
                <Button onClick={() => handleExport('PDF')} disabled={loading}>
                  <Printer className="w-4 h-4 mr-2" /> Gerar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Work Orders</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWOs}</div>
                <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WOs Concluídas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedWOs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalWOs > 0 ? Math.round((completedWOs / totalWOs) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">Avanço geral estimado</p>
              </CardContent>
            </Card>
          </div>

          <Card className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Evolução de Volume</CardTitle>
              <CardDescription>Visualização temporal baseada nos filtros aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--muted-foreground)/0.2)"
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          tickMargin={10}
                        />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="value"
                          fill="var(--color-value)"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                  Nenhum dado temporal disponível para o gráfico.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Amostra de Dados ({workOrders.length})</CardTitle>
              <CardDescription>Resumo executivo das ordens de serviço encontradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Data Criação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Carregando dados...
                        </TableCell>
                      </TableRow>
                    ) : (
                      workOrders.slice(0, 10).map((wo) => (
                        <TableRow key={wo.id}>
                          <TableCell className="font-medium">{wo.wo_number}</TableCell>
                          <TableCell>{wo.customer_name}</TableCell>
                          <TableCell>{wo.department}</TableCell>
                          <TableCell>{wo.status}</TableCell>
                          <TableCell>{wo.progress}%</TableCell>
                          <TableCell>
                            {wo.created_at ? new Date(wo.created_at).toLocaleDateString() : ''}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {!loading && workOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum dado encontrado para os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && workOrders.length > 10 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-muted-foreground bg-muted/30"
                        >
                          Mostrando 10 de {workOrders.length} registros. Exporte o relatório para
                          ver todos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Exportações</CardTitle>
              <CardDescription>
                Acesse e baixe novamente relatórios gerados anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data de Geração</TableHead>
                      <TableHead>Tipo de Relatório</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Período Filtrado</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{item.report_type}</TableCell>
                        <TableCell>{item.department || 'Todos'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {item.date_start
                            ? `${new Date(item.date_start).toLocaleDateString()} até ${item.date_end ? new Date(item.date_end).toLocaleDateString() : 'Hoje'}`
                            : 'Todo o período'}
                        </TableCell>
                        <TableCell>{item.format}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => downloadCSV()}>
                            <Download className="w-4 h-4 mr-2" /> Baixar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum relatório foi gerado ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
