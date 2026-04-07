import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ShieldAlert, CheckCircle2, Activity, FileWarning, Cpu } from 'lucide-react'
import { QualityTopCustomers } from './QualityTopCustomers'

export function QualityDashboard() {
  const [period, setPeriod] = useState('30')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [claims, setClaims] = useState<any[]>([])
  const [pulls, setPulls] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      let startDateStr = ''
      const endDateStr =
        customEnd && period === 'custom'
          ? new Date(customEnd).toISOString()
          : new Date().toISOString()

      if (period !== 'custom') {
        const d = new Date()
        d.setDate(d.getDate() - parseInt(period))
        startDateStr = d.toISOString()
      } else if (customStart) {
        startDateStr = new Date(customStart).toISOString()
      }

      let q1 = supabase.from('quality_warranty_claims').select('*')
      let q2 = supabase.from('quality_late_card_pulls').select('*')

      if (startDateStr) {
        q1 = q1.gte('created_at', startDateStr)
        q2 = q2.gte('created_at', startDateStr)
      }
      if (endDateStr) {
        q1 = q1.lte('created_at', endDateStr)
        q2 = q2.lte('created_at', endDateStr)
      }

      const [res1, res2] = await Promise.all([q1, q2])
      setClaims(res1.data || [])
      setPulls(res2.data || [])
    }
    fetchData()
  }, [period, customStart, customEnd])

  const { kpis, trendData, categoryData, topCustomers } = useMemo(() => {
    const resolved = claims.filter((c) => c.status === 'resolved').length
    const rate = claims.length ? Math.round((resolved / claims.length) * 100) : 0
    const pullCounts = pulls.reduce(
      (acc, p) => ({
        ...acc,
        [p.component_name || 'N/A']: (acc[p.component_name || 'N/A'] || 0) + 1,
      }),
      {},
    )
    const topComp = Object.entries(pullCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-'

    const trendMap = claims.reduce((acc, c) => {
      const d = c.created_at.split('T')[0]
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})

    const catMap = claims.reduce((acc, c) => {
      const cat = c.issue_category || 'N/A'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    const custMap = claims.reduce((acc, c) => {
      const cust = c.customer_name || 'Unknown'
      acc[cust] = (acc[cust] || 0) + 1
      return acc
    }, {})

    return {
      kpis: [
        { title: 'Total Claims', value: claims.length, icon: ShieldAlert },
        { title: 'Resolved Claims', value: resolved, icon: CheckCircle2 },
        { title: 'Resolution Rate', value: `${rate}%`, icon: Activity },
        { title: 'Late Card Pulls', value: pulls.length, icon: FileWarning },
        { title: 'Top Pull (Comp.)', value: topComp, icon: Cpu },
      ],
      trendData: Object.entries(trendMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date: new Date(date).toLocaleDateString(), count })),
      categoryData: Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => (b.count as number) - (a.count as number)),
      topCustomers: Object.entries(custMap)
        .map(([name, count]) => ({ name, claims: count as number }))
        .sort((a, b) => b.claims - a.claims)
        .slice(0, 10),
    }
  }, [claims, pulls])

  const chartConfig = { count: { label: 'Quantity', color: 'hsl(var(--primary))' } }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-auto"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims by Category</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <QualityTopCustomers customers={topCustomers} />
    </div>
  )
}
