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
import { ShieldAlert, AlertTriangle, Activity, Loader2, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subDays, subMonths, isAfter, startOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Period = '30d' | '3m' | '6m' | '1y' | 'all'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function QualityDashboard() {
  const [period, setPeriod] = useState<Period>('6m')
  const [claims, setClaims] = useState<any[]>([])
  const [pulls, setPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      let startDate = new Date(0)
      const now = new Date()

      switch (period) {
        case '30d':
          startDate = subDays(now, 30)
          break
        case '3m':
          startDate = subMonths(now, 3)
          break
        case '6m':
          startDate = subMonths(now, 6)
          break
        case '1y':
          startDate = subMonths(now, 12)
          break
      }

      let claimsQuery = supabase.from('warranty_claims').select('id, date, created_at')
      let pullsQuery = supabase.from('late_card_pulls').select('id, date, created_at')

      if (period !== 'all') {
        claimsQuery = claimsQuery.gte('created_at', startDate.toISOString())
        pullsQuery = pullsQuery.gte('created_at', startDate.toISOString())
      }

      const [claimsRes, pullsRes] = await Promise.all([claimsQuery, pullsQuery])

      setClaims(claimsRes.data || [])
      setPulls(pullsRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [period])

  const chartData = useMemo(() => {
    if (!claims && !pulls) return []

    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '30d':
        startDate = subDays(now, 30)
        break
      case '3m':
        startDate = subMonths(now, 3)
        break
      case '6m':
        startDate = subMonths(now, 6)
        break
      case '1y':
        startDate = subMonths(now, 12)
        break
      case 'all': {
        const allDates = [...claims, ...pulls]
          .map((i) => i.date || i.created_at)
          .filter(Boolean)
          .map((d) => parseISO(d).getTime())
        if (allDates.length > 0) {
          startDate = new Date(Math.min(...allDates))
        } else {
          startDate = subMonths(now, 6)
        }
        break
      }
    }

    const dataMap = new Map<
      string,
      { month: string; claims: number; pulls: number; timestamp: number }
    >()

    let currentMonth = startOfMonth(startDate)
    const endMonth = startOfMonth(now)

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
      if (isAfter(dateObj, now) || dateObj < startDate) return

      const monthKey = format(startOfMonth(dateObj), 'yyyy-MM')

      if (dataMap.has(monthKey)) {
        const entry = dataMap.get(monthKey)!
        entry[type] += 1
      }
    }

    claims.forEach((c) => processItem(c, 'claims'))
    pulls.forEach((p) => processItem(p, 'pulls'))

    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [claims, pulls, period])

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

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = `quality_dashboard_${format(new Date(), 'yyyy-MM-dd')}`
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="hidden print:block mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Quality Dashboard</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Visão Geral</h3>
          <p className="text-sm text-slate-500">Acompanhe os principais indicadores de qualidade</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="bg-white">
            <FileDown className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 Dias</SelectItem>
              <SelectItem value="3m">Últimos 3 Meses</SelectItem>
              <SelectItem value="6m">Últimos 6 Meses</SelectItem>
              <SelectItem value="1y">Último Ano</SelectItem>
              <SelectItem value="all">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white hover:shadow-md transition-shadow duration-200 border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Warranty Claims
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalClaims}</div>
                <p className="text-xs text-slate-500 mt-1">Registros no período</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow duration-200 border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Late Card Pulls
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalPulls}</div>
                <p className="text-xs text-slate-500 mt-1">Ocorrências no período</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-md transition-shadow duration-200 border-slate-200">
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
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                  <Bar
                    dataKey="claims"
                    fill="var(--color-claims)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="pulls"
                    fill="var(--color-pulls)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
