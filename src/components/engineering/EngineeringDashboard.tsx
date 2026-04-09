import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getEngineeringDashboardData,
  EngineeringFilters,
  DashboardData,
} from '@/services/engineering-dashboard'
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
import { EngineeringFiltersPanel } from './EngineeringFiltersPanel'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import logoUrl from '@/assets/design-sem-nome-689e7.png'

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function EngineeringDashboard() {
  const { toast } = useToast()
  const dashboardRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<EngineeringFilters>({
    period: '30d',
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
        const result = await getEngineeringDashboardData(filters)
        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const updateFilter = (key: keyof EngineeringFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      period: '30d',
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

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return

    try {
      toast({
        title: 'Gerando PDF',
        description: 'Aguarde enquanto o documento é gerado...',
      })

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const startY = 25
      const maxImgHeight = pageHeight - startY - 10

      let imgWidth = pdfWidth - 20
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight
        imgWidth = (canvas.width * imgHeight) / canvas.height
      }

      const startX = (pdfWidth - imgWidth) / 2

      pdf.setFontSize(16)
      pdf.text('Engineering Dashboard Report', 14, 15)
      pdf.setFontSize(10)
      pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22)

      try {
        const logoImg = await loadImage(logoUrl)
        const logoHeight = 15
        const logoWidth = (logoImg.width * logoHeight) / logoImg.height
        const logoX = pdfWidth - logoWidth - 14
        const logoY = 7
        pdf.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight)
      } catch (err) {
        console.error('Could not load logo for PDF:', err)
      }

      pdf.addImage(imgData, 'PNG', startX, startY, imgWidth, imgHeight)
      pdf.save(`engineering-dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`)

      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso!',
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      })
    }
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Engineering Overview</h2>
        <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div ref={dashboardRef} className="space-y-6 bg-background p-2 rounded-lg -mx-2 px-2">
        <EngineeringFiltersPanel
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />

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
        </div>
      </div>
    </div>
  )
}
