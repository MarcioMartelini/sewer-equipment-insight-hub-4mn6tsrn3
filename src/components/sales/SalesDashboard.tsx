import { useState, useEffect, useMemo } from 'react'
import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
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
  ClipboardList,
  Percent,
  TrendingUp,
  Clock,
  Users,
  ShoppingCart,
  ShoppingBag,
  CalendarIcon,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import { Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { MultiSelect } from '@/components/MultiSelect'

const ALL_METRICS = [
  'Gross Revenue',
  'Total Quotes',
  'Total WOs',
  'Conversion Rate',
  'Avg Profit Margin',
  'Avg Sales Cycle',
  'Customer LTV',
  'Avg Purchase Value',
  'Total Purchases',
  'Revenue Over Time',
  'Work Orders by Salesperson',
  'Machine Family Distribution',
  'Profit Margin Trend',
  'Top 10 Salespersons',
]

const COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
]

export default function SalesDashboard() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(ALL_METRICS)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    salesperson: 'all',
    division: 'all',
    area: 'all',
    customer: 'all',
    machineFamily: 'all',
    machineModel: 'all',
    quoteNumber: '',
    woNumber: '',
    metric: 'all',
  })

  const [quotes, setQuotes] = useState<any[]>([])
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [salespersons, setSalespersons] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async (showLoading = true) => {
      if (showLoading) setLoading(true)
      try {
        const [{ data: qData }, { data: woData }, { data: spData }, { data: cData }] =
          await Promise.all([
            supabase
              .from('quotes')
              .select(
                'id, quote_number, customer_name, salesperson, product_family, machine_model, quote_value, profit_margin_percentage, status, created_at, approval_date, wo_number_ref',
              )
              .is('deleted_at', null),
            supabase
              .from('work_orders')
              .select(
                'id, wo_number, customer_name, product_type, machine_model, price, profit_margin, status, created_at, quote_id',
              )
              .is('deleted_at', null),
            supabase
              .from('salespersons')
              .select('id, name, department, region')
              .is('deleted_at', null),
            supabase
              .from('customers')
              .select('id, customer_name, state, city')
              .is('deleted_at', null),
          ])
        setQuotes(qData || [])
        setWorkOrders(woData || [])
        setSalespersons(spData || [])
        setCustomers(cData || [])
      } catch (error) {
        console.error(error)
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    loadData()

    const channel = supabase
      .channel('sales-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () =>
        loadData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () =>
        loadData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'salespersons' }, () =>
        loadData(false),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () =>
        loadData(false),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const resetFilters = () => {
    setFilters({
      salesperson: 'all',
      division: 'all',
      area: 'all',
      customer: 'all',
      machineFamily: 'all',
      machineModel: 'all',
      quoteNumber: '',
      woNumber: '',
      metric: 'all',
    })
    setSelectedMetrics(ALL_METRICS)
  }

  const uniqueSalespersons = useMemo(
    () => Array.from(new Set(salespersons.map((s) => s.name).filter(Boolean))),
    [salespersons],
  )
  const uniqueDivisions = useMemo(
    () => Array.from(new Set(salespersons.map((s) => s.department).filter(Boolean))),
    [salespersons],
  )
  const uniqueAreas = useMemo(
    () => Array.from(new Set(salespersons.map((s) => s.region).filter(Boolean))),
    [salespersons],
  )
  const uniqueCustomers = useMemo(
    () =>
      Array.from(
        new Set(
          [...quotes.map((q) => q.customer_name), ...workOrders.map((w) => w.customer_name)].filter(
            Boolean,
          ),
        ),
      ),
    [quotes, workOrders],
  )
  const uniqueFamilies = useMemo(
    () =>
      Array.from(
        new Set(
          [...quotes.map((q) => q.product_family), ...workOrders.map((w) => w.product_type)].filter(
            Boolean,
          ),
        ),
      ),
    [quotes, workOrders],
  )
  const uniqueModels = useMemo(
    () =>
      Array.from(
        new Set(
          [...quotes.map((q) => q.machine_model), ...workOrders.map((w) => w.machine_model)].filter(
            Boolean,
          ),
        ),
      ),
    [quotes, workOrders],
  )

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      if (dateRange.from && new Date(q.created_at) < startOfDay(dateRange.from)) return false
      if (dateRange.to && new Date(q.created_at) > endOfDay(dateRange.to)) return false

      if (filters.salesperson !== 'all' && q.salesperson !== filters.salesperson) return false
      if (filters.customer !== 'all' && q.customer_name !== filters.customer) return false
      if (filters.machineFamily !== 'all' && q.product_family !== filters.machineFamily)
        return false
      if (filters.machineModel !== 'all' && q.machine_model !== filters.machineModel) return false
      if (
        filters.quoteNumber &&
        !q.quote_number?.toLowerCase().includes(filters.quoteNumber.toLowerCase())
      )
        return false

      const sp = salespersons.find((s) => s.name === q.salesperson)
      if (filters.division !== 'all' && sp?.department !== filters.division) return false
      if (filters.area !== 'all' && sp?.region !== filters.area) return false

      return true
    })
  }, [quotes, dateRange, filters, salespersons])

  const filteredWOs = useMemo(() => {
    return workOrders.filter((wo) => {
      if (dateRange.from && new Date(wo.created_at) < startOfDay(dateRange.from)) return false
      if (dateRange.to && new Date(wo.created_at) > endOfDay(dateRange.to)) return false

      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      const spName = relatedQuote?.salesperson || 'Unknown'
      const sp = salespersons.find((s) => s.name === spName)

      if (filters.salesperson !== 'all' && spName !== filters.salesperson) return false
      if (filters.customer !== 'all' && wo.customer_name !== filters.customer) return false
      if (
        filters.machineFamily !== 'all' &&
        wo.product_type !== filters.machineFamily &&
        relatedQuote?.product_family !== filters.machineFamily
      )
        return false
      if (filters.machineModel !== 'all' && wo.machine_model !== filters.machineModel) return false
      if (filters.woNumber && !wo.wo_number?.toLowerCase().includes(filters.woNumber.toLowerCase()))
        return false

      if (filters.division !== 'all' && sp?.department !== filters.division) return false
      if (filters.area !== 'all' && sp?.region !== filters.area) return false

      return true
    })
  }, [workOrders, quotes, salespersons, dateRange, filters])

  // KPIs Calculations
  const totalQuotes = filteredQuotes.length
  const totalWOs = filteredWOs.length
  const numberOfPurchases = totalWOs

  const grossRevenue = filteredWOs.reduce((sum, wo) => {
    const relatedQuote = quotes.find(
      (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
    )
    return sum + Number(wo.price || relatedQuote?.quote_value || 0)
  }, 0)

  let totalMargin = 0
  let marginCount = 0
  filteredWOs.forEach((wo) => {
    const relatedQuote = quotes.find(
      (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
    )
    const margin = Number(wo.profit_margin || relatedQuote?.profit_margin_percentage)
    if (!isNaN(margin) && margin > 0) {
      totalMargin += margin
      marginCount++
    }
  })
  const avgProfitMargin = marginCount > 0 ? totalMargin / marginCount : 0

  const approvedQuotesCount = filteredQuotes.filter(
    (q) => q.status === 'approved' || q.status === 'converted',
  ).length
  const conversionRate = totalQuotes > 0 ? (approvedQuotesCount / totalQuotes) * 100 : 0

  let totalCycleDays = 0
  let cycleCount = 0
  filteredQuotes
    .filter((q) => q.status === 'approved' || q.status === 'converted')
    .forEach((q) => {
      if (q.created_at && q.approval_date) {
        const diff = differenceInDays(new Date(q.approval_date), new Date(q.created_at))
        if (diff >= 0) {
          totalCycleDays += diff
          cycleCount++
        }
      }
    })
  const avgSalesCycle = cycleCount > 0 ? totalCycleDays / cycleCount : 0

  const uniqueCustomerNames = new Set(filteredWOs.map((w) => w.customer_name).filter(Boolean))
  const clv = uniqueCustomerNames.size > 0 ? grossRevenue / uniqueCustomerNames.size : 0
  const avgPurchaseValue = totalWOs > 0 ? grossRevenue / totalWOs : 0

  // Charts Data
  const revenueByDate = filteredWOs.reduce(
    (acc, wo) => {
      const date = format(new Date(wo.created_at), 'yyyy-MM-dd')
      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      acc[date] = (acc[date] || 0) + Number(wo.price || relatedQuote?.quote_value || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const revenueTrend = Object.entries(revenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: format(new Date(date), 'MM/dd'),
      revenue,
    }))

  const wosBySp = filteredWOs.reduce(
    (acc, wo) => {
      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      const sp = relatedQuote?.salesperson || 'Unknown'
      acc[sp] = (acc[sp] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const wosBySpData = Object.entries(wosBySp)
    .sort((a, b) => b[1] - a[1])
    .map(([name, wos]) => ({ name, wos }))

  const familyDist = filteredWOs.reduce(
    (acc, wo) => {
      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      const family = wo.product_type || relatedQuote?.product_family || 'Other'
      acc[family] = (acc[family] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const familyData = Object.entries(familyDist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const marginByDate = filteredWOs.reduce(
    (acc, wo) => {
      const date = format(new Date(wo.created_at), 'yyyy-MM-dd')
      if (!acc[date]) acc[date] = { total: 0, count: 0 }
      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      const margin = Number(wo.profit_margin || relatedQuote?.profit_margin_percentage || 0)
      if (!isNaN(margin) && margin > 0) {
        acc[date].total += margin
        acc[date].count += 1
      }
      return acc
    },
    {} as Record<string, { total: number; count: number }>,
  )

  const marginTrend = Object.entries(marginByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: format(new Date(date), 'MM/dd'),
      margin: data.count > 0 ? data.total / data.count : 0,
    }))

  const revenueBySp = filteredWOs.reduce(
    (acc, wo) => {
      const relatedQuote = quotes.find(
        (q) => q.id === wo.quote_id || q.wo_number_ref === wo.wo_number,
      )
      const sp = relatedQuote?.salesperson || 'Unknown'
      acc[sp] = (acc[sp] || 0) + Number(wo.price || relatedQuote?.quote_value || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const topSalespersons = Object.entries(revenueBySp)
    .map(([name, revenue]) => ({
      name,
      revenue,
      department: salespersons.find((s) => s.name === name)?.department || '-',
      region: salespersons.find((s) => s.name === name)?.region || '-',
      wos: wosBySp[name] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(18)
      doc.setTextColor(30, 41, 59)
      doc.text('Sales Dashboard Report', 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      const dateStr = format(new Date(), 'MM/dd/yyyy HH:mm')
      doc.text(`Generated on: ${dateStr}`, 14, 28)

      const periodStr = dateRange.from
        ? `${format(dateRange.from, 'MM/dd/yyyy')} - ${dateRange.to ? format(dateRange.to, 'MM/dd/yyyy') : format(dateRange.from, 'MM/dd/yyyy')}`
        : 'All Time'
      doc.text(`Period: ${periodStr}`, 14, 33)

      const filtersStr = []
      if (filters.salesperson !== 'all') filtersStr.push(`Salesperson: ${filters.salesperson}`)
      if (filters.division !== 'all') filtersStr.push(`Division: ${filters.division}`)
      if (filters.area !== 'all') filtersStr.push(`Area: ${filters.area}`)
      if (filters.customer !== 'all') filtersStr.push(`Customer: ${filters.customer}`)
      if (filters.machineFamily !== 'all')
        filtersStr.push(`Machine Family: ${filters.machineFamily}`)
      if (filters.machineModel !== 'all') filtersStr.push(`Machine Model: ${filters.machineModel}`)
      if (filters.quoteNumber) filtersStr.push(`Quote Number: ${filters.quoteNumber}`)
      if (filters.woNumber) filtersStr.push(`WO Number: ${filters.woNumber}`)

      if (filtersStr.length > 0) {
        const filterText = doc.splitTextToSize(`Filters: ${filtersStr.join(', ')}`, 180)
        doc.text(filterText, 14, 38)
      }

      // KPIs
      doc.setFontSize(14)
      doc.setTextColor(30, 41, 59)
      doc.text('Executive Summary', 14, 50)

      const formatMoney = (val: number) =>
        `${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

      const kpiData = [
        ['Gross Revenue', formatMoney(grossRevenue), 'Total Quotes', totalQuotes.toString()],
        ['Total WOs', totalWOs.toString(), 'Conversion Rate', `${conversionRate.toFixed(1)}%`],
        [
          'Avg Profit Margin',
          `${avgProfitMargin.toFixed(1)}%`,
          'Avg Sales Cycle',
          `${avgSalesCycle.toFixed(1)} days`,
        ],
        ['Customer LTV', formatMoney(clv), 'Avg Purchase Value', formatMoney(avgPurchaseValue)],
        ['Total Purchases', numberOfPurchases.toString(), '', ''],
      ]

      ;(doc as any).autoTable({
        startY: 55,
        body: kpiData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
          2: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        },
      })

      let currentY = (doc as any).lastAutoTable.finalY + 15

      // Charts
      doc.setFontSize(14)
      doc.text('Performance Charts', 14, currentY)
      currentY += 5

      // Capture charts using html2canvas
      const chartIds = ['chart-revenue', 'chart-wos', 'chart-family', 'chart-margin']
      const chartImages: (string | null)[] = []

      for (const id of chartIds) {
        const el = document.getElementById(id)
        if (el) {
          const canvas = await html2canvas(el, { scale: 2, logging: false, useCORS: true })
          chartImages.push(canvas.toDataURL('image/png'))
        } else {
          chartImages.push(null)
        }
      }

      // Draw charts side by side
      // Row 1
      if (chartImages[0]) doc.addImage(chartImages[0]!, 'PNG', 14, currentY, 85, 60)
      if (chartImages[1]) doc.addImage(chartImages[1]!, 'PNG', 110, currentY, 85, 60)
      currentY += 65

      // Row 2
      if (chartImages[2]) doc.addImage(chartImages[2]!, 'PNG', 14, currentY, 85, 60)
      if (chartImages[3]) doc.addImage(chartImages[3]!, 'PNG', 110, currentY, 85, 60)
      currentY += 65

      // Top 10 Salespersons
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(14)
      doc.text('Top 10 Salespersons', 14, currentY)
      currentY += 5

      const spTableData = topSalespersons.map((sp, i) => [
        `#${i + 1}`,
        sp.name,
        sp.department || '-',
        sp.region || '-',
        formatMoney(sp.revenue),
        (sp.wos || 0).toString(),
      ])

      ;(doc as any).autoTable({
        startY: currentY,
        head: [['Rank', 'Salesperson', 'Division', 'Area', 'Revenue', 'WOs']],
        body: spTableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text('CONFIDENTIAL: This report contains sensitive commercial information.', 14, 290)
        doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' })
      }

      doc.save(`Sales_Dashboard_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)

      toast({ title: 'Dashboard exported successfully!' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Error exporting dashboard', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  // Chart Configs
  const lineConfig = { revenue: { label: 'Revenue ($)', color: '#4f46e5' } }
  const barConfig = { wos: { label: 'Work Orders', color: '#0ea5e9' } }
  const areaConfig = { margin: { label: 'Profit Margin (%)', color: '#10b981' } }
  const pieConfig = familyData.reduce(
    (acc, curr, i) => {
      acc[curr.name] = { label: curr.name, color: COLORS[i % COLORS.length] }
      return acc
    },
    {} as Record<string, any>,
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      {/* Header & Global Period Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Sales Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time commercial performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 bg-white dark:bg-slate-950"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Dashboard to PDF
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[260px] justify-start text-left font-normal bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800',
                  !dateRange.from && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MM/dd/yyyy')} - {format(dateRange.to, 'MM/dd/yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MM/dd/yyyy')
                  )
                ) : (
                  <span>Select date range</span>
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
                  if (range) {
                    setDateRange({ from: range.from, to: range.to })
                  } else {
                    setDateRange({ from: undefined, to: undefined })
                  }
                }}
                numberOfMonths={2}
                locale={enUS}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        className="w-full bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Advanced Filters
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {isFiltersOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Reset Filters
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-9 p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              >
                {isFiltersOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle Filters</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Salesperson</Label>
              <Select
                value={filters.salesperson}
                onValueChange={(v) => setFilters((f) => ({ ...f, salesperson: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salespersons</SelectItem>
                  {uniqueSalespersons.map((sp) => (
                    <SelectItem key={sp} value={sp}>
                      {sp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Division</Label>
              <Select
                value={filters.division}
                onValueChange={(v) => setFilters((f) => ({ ...f, division: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {uniqueDivisions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Area/Region</Label>
              <Select
                value={filters.area}
                onValueChange={(v) => setFilters((f) => ({ ...f, area: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {uniqueAreas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</Label>
              <Select
                value={filters.customer}
                onValueChange={(v) => setFilters((f) => ({ ...f, customer: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Machine Family
              </Label>
              <Select
                value={filters.machineFamily}
                onValueChange={(v) => setFilters((f) => ({ ...f, machineFamily: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {uniqueFamilies.map((mf) => (
                    <SelectItem key={mf} value={mf}>
                      {mf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Machine Model
              </Label>
              <Select
                value={filters.machineModel}
                onValueChange={(v) => setFilters((f) => ({ ...f, machineModel: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {uniqueModels.map((mm) => (
                    <SelectItem key={mm} value={mm}>
                      {mm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Quote Number
              </Label>
              <Input
                placeholder="Search Quote..."
                value={filters.quoteNumber}
                onChange={(e) => setFilters((f) => ({ ...f, quoteNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">WO Number</Label>
              <Input
                placeholder="Search WO..."
                value={filters.woNumber}
                onChange={(e) => setFilters((f) => ({ ...f, woNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Metrics</Label>
              <MultiSelect
                options={ALL_METRICS}
                selected={selectedMetrics}
                onChange={setSelectedMetrics}
                placeholder="Select metrics..."
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {selectedMetrics.includes('Gross Revenue') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Gross Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                $
                {grossRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Total Quotes') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Quotes
              </CardTitle>
              <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalQuotes}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Total WOs') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total WOs
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalWOs}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Conversion Rate') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Conversion Rate
              </CardTitle>
              <Percent className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {conversionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Avg Profit Margin') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg Profit Margin
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgProfitMargin.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Avg Sales Cycle') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg Sales Cycle
              </CardTitle>
              <Clock className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgSalesCycle.toFixed(1)}{' '}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">days</span>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Customer LTV') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Customer LTV
              </CardTitle>
              <Users className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                $
                {clv.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Avg Purchase Value') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg Purchase Value
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-teal-500 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                $
                {avgPurchaseValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Total Purchases') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Purchases
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {numberOfPurchases}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {selectedMetrics.includes('Revenue Over Time') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200 text-lg">
                Revenue Over Time
              </CardTitle>
              <CardDescription>Gross revenue generated across the selected period</CardDescription>
            </CardHeader>
            <CardContent id="chart-revenue">
              {revenueTrend.length > 0 ? (
                <ChartContainer config={lineConfig} className="h-[300px] w-full">
                  <LineChart
                    data={revenueTrend}
                    margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
                      }
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      width={60}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#4f46e5' }}
                      activeDot={{ r: 6, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Work Orders by Salesperson') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200 text-lg">
                Work Orders by Salesperson
              </CardTitle>
              <CardDescription>Number of WOs generated per salesperson</CardDescription>
            </CardHeader>
            <CardContent id="chart-wos">
              {wosBySpData.length > 0 ? (
                <ChartContainer config={barConfig} className="h-[300px] w-full">
                  <BarChart data={wosBySpData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="wos" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Machine Family Distribution') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200 text-lg">
                Machine Family Distribution
              </CardTitle>
              <CardDescription>Share of work orders by product family</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center" id="chart-family">
              {familyData.length > 0 ? (
                <ChartContainer config={pieConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={familyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {familyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedMetrics.includes('Profit Margin Trend') && (
          <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200 text-lg">
                Profit Margin Trend
              </CardTitle>
              <CardDescription>Average profit margin over time</CardDescription>
            </CardHeader>
            <CardContent id="chart-margin">
              {marginTrend.length > 0 ? (
                <ChartContainer config={areaConfig} className="h-[300px] w-full">
                  <AreaChart
                    data={marginTrend}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="margin"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Table */}
      {selectedMetrics.includes('Top 10 Salespersons') && (
        <Card className="bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200 text-lg">
              Top 10 Salespersons
            </CardTitle>
            <CardDescription>Highest generating sales professionals by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[80px] font-semibold text-slate-700 dark:text-slate-300">
                    Rank
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    Salesperson
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    Division
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    Area
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    Revenue
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    WOs
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSalespersons.map((sp, index) => (
                  <TableRow
                    key={sp.name}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {sp.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {salespersons.find((s) => s.name === sp.name)?.department || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {salespersons.find((s) => s.name === sp.name)?.region || '-'}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      $
                      {sp.revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-slate-700 dark:text-slate-300 font-medium">
                      {wosBySp[sp.name] || 0}
                    </TableCell>
                  </TableRow>
                ))}
                {topSalespersons.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-500 dark:text-slate-400 py-8"
                    >
                      No sales data available for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
