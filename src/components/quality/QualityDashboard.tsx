import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Loader2,
  FileDown,
  FilterX,
  CalendarIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { format, subMonths, isAfter, startOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function QualityDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  })
  const [showWarranty, setShowWarranty] = useState(true)
  const [showLateCard, setShowLateCard] = useState(true)
  const [supervisors, setSupervisors] = useState<string[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all')

  const [claims, setClaims] = useState<any[]>([])
  const [pulls, setPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch unique supervisors for the filter
  useEffect(() => {
    supabase
      .from('late_card_pulls')
      .select('area_supervisor')
      .not('area_supervisor', 'is', null)
      .then(({ data }) => {
        if (data) {
          const unique = Array.from(
            new Set(data.map((d) => d.area_supervisor).filter(Boolean)),
          ) as string[]
          setSupervisors(unique.sort())
        }
      })
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      let qClaims = supabase.from('warranty_claims').select('id, date, created_at')
      let qPulls = supabase.from('late_card_pulls').select('id, date, created_at, area_supervisor')

      if (date?.from) {
        qClaims = qClaims.gte('created_at', date.from.toISOString())
        qPulls = qPulls.gte('created_at', date.from.toISOString())
      }
      if (date?.to) {
        const endOfDay = new Date(date.to)
        endOfDay.setHours(23, 59, 59, 999)
        qClaims = qClaims.lte('created_at', endOfDay.toISOString())
        qPulls = qPulls.lte('created_at', endOfDay.toISOString())
      }

      if (selectedSupervisor !== 'all') {
        qPulls = qPulls.eq('area_supervisor', selectedSupervisor)
      }

      const promises = []
      if (showWarranty) {
        promises.push(qClaims.then((r) => ({ type: 'claims', data: r.data })))
      }
      if (showLateCard) {
        promises.push(qPulls.then((r) => ({ type: 'pulls', data: r.data })))
      }

      const results = await Promise.all(promises)
      let newClaims: any[] = []
      let newPulls: any[] = []

      results.forEach((res) => {
        if (res.type === 'claims') newClaims = res.data || []
        if (res.type === 'pulls') newPulls = res.data || []
      })

      setClaims(newClaims)
      setPulls(newPulls)
      setLoading(false)
    }

    fetchData()
  }, [date, showWarranty, showLateCard, selectedSupervisor])

  const chartData = useMemo(() => {
    if (!claims.length && !pulls.length) return []

    const now = new Date()
    let startDate = date?.from || subMonths(now, 6)
    let endDate = date?.to || now

    if (startDate > endDate) {
      startDate = endDate
    }

    const dataMap = new Map<
      string,
      { month: string; claims: number; pulls: number; timestamp: number }
    >()

    let currentMonth = startOfMonth(startDate)
    const endMonth = startOfMonth(endDate)

    while (currentMonth <= endMonth) {
      const monthKey = format(currentMonth, 'yyyy-MM')
      const formattedMonth = capitalize(format(currentMonth, 'MMM yy', { locale: ptBR }))
      dataMap.set(monthKey, {
        month: formattedMonth,
        claims: 0,
        pulls: 0,
        timestamp: currentMonth.getTime(),
      })
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    }

    const processItem = (item: any, type: 'claims' | 'pulls') => {
      const dateStr = item.date || item.created_at
      if (!dateStr) return
      const dateObj = parseISO(dateStr)
      if (isAfter(dateObj, endDate) || dateObj < startDate) return

      const monthKey = format(startOfMonth(dateObj), 'yyyy-MM')

      if (dataMap.has(monthKey)) {
        const entry = dataMap.get(monthKey)!
        entry[type] += 1
      }
    }

    claims.forEach((c) => processItem(c, 'claims'))
    pulls.forEach((p) => processItem(p, 'pulls'))

    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [claims, pulls, date])

  const totalClaims = claims.length
  const totalPulls = pulls.length
  const monthsCount = chartData.length || 1
  const avgOccurrences = ((totalClaims + totalPulls) / monthsCount).toFixed(1)

  const chartConfig = {
    claims: {
      label: 'Warranty Claims',
      color: 'hsl(var(--primary))',
    },
    pulls: {
      label: 'Late Card Pulls',
      color: '#f97316', // orange-500
    },
  }

  const activeChartConfig = { ...chartConfig }
  if (!showWarranty) delete (activeChartConfig as any).claims
  if (!showLateCard) delete (activeChartConfig as any).pulls

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = `quality_dashboard_${format(new Date(), 'yyyy-MM-dd')}`
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  const handleClearFilters = () => {
    setDate({ from: subMonths(new Date(), 6), to: new Date() })
    setShowWarranty(true)
    setShowLateCard(true)
    setSelectedSupervisor('all')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="hidden print:block mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Quality Dashboard</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden mb-2">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Visão Geral</h3>
          <p className="text-sm text-slate-500">Acompanhe os principais indicadores de qualidade</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
            <FileDown className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-200 mb-6 print:hidden">
        <div className="flex-1 flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Período de Análise
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[260px] justify-start text-left font-normal bg-white',
                    !date && 'text-slate-500',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(date.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supervisor (Late Cards)
            </Label>
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger className="w-[220px] bg-white">
                <SelectValue placeholder="Todos os Supervisores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Supervisores</SelectItem>
                {supervisors.map((sup) => (
                  <SelectItem key={sup} value={sup}>
                    {sup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6 h-10 px-2">
            <div className="flex items-center space-x-2">
              <Switch
                className="bg-[#0012fa]"
                id="show-warranty"
                checked={showWarranty}
                onCheckedChange={setShowWarranty}
              />
              <Label htmlFor="show-warranty" className="text-sm font-medium cursor-pointer">
                Warranty Claims
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-late-card"
                checked={showLateCard}
                onCheckedChange={setShowLateCard}
              />
              <Label htmlFor="show-late-card" className="text-sm font-medium cursor-pointer">
                Late Card Pulls
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-10"
            onClick={handleClearFilters}
          >
            <FilterX className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className={cn(
                'bg-white transition-all duration-200 border-slate-200',
                showWarranty ? 'opacity-100' : 'opacity-50 grayscale',
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Warranty Claims
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {showWarranty ? totalClaims : '-'}
                </div>
                <p className="text-xs text-slate-500 mt-1">Registros no período</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                'bg-white transition-all duration-200 border-slate-200',
                showLateCard ? 'opacity-100' : 'opacity-50 grayscale',
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Late Card Pulls
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {showLateCard ? totalPulls : '-'}
                </div>
                <p className="text-xs text-slate-500 mt-1">Ocorrências no período</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Taxa Mensal</CardTitle>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{avgOccurrences}</div>
                <p className="text-xs text-slate-500 mt-1">Ocorrências em média por mês</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Tendência de Ocorrências</CardTitle>
              <CardDescription>
                Evolução de Warranty Claims e Late Card Pulls ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={activeChartConfig} className="h-[350px] w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {showWarranty && (
                    <Bar
                      dataKey="claims"
                      fill="var(--color-claims)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  )}
                  {showLateCard && (
                    <Bar
                      dataKey="pulls"
                      fill="var(--color-pulls)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  )}
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
