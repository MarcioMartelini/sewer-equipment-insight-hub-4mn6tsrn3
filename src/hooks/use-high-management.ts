import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export interface WOData {
  id: string
  wo_number: string
  customer_name: string
  department: string | null
  progress: number | null
  status: string
  created_at: string | null
  quotes: any
}

export function getQuoteData(quotes: any) {
  if (!quotes) return { value: 0, margin: null }
  if (Array.isArray(quotes)) {
    return {
      value: Number(quotes[0]?.quote_value || 0),
      margin:
        quotes[0]?.profit_margin_percentage != null
          ? Number(quotes[0].profit_margin_percentage)
          : null,
    }
  }
  return {
    value: Number(quotes.quote_value || 0),
    margin:
      quotes.profit_margin_percentage != null ? Number(quotes.profit_margin_percentage) : null,
  }
}

export function useHighManagement(startDate: Date, endDate: Date) {
  const [wos, setWos] = useState<WOData[]>([])
  const [csat, setCsat] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const startStr = startOfDay(startDate).toISOString()
      const endStr = endOfDay(endDate).toISOString()

      const [woRes, metricRes] = await Promise.all([
        supabase
          .from('work_orders')
          .select(
            'id, wo_number, customer_name, department, progress, status, created_at, quotes(quote_value, profit_margin_percentage)',
          )
          .gte('created_at', startStr)
          .lte('created_at', endStr),
        supabase
          .from('metrics')
          .select('metric_value')
          .eq('metric_name', 'CSAT')
          .gte('created_at', startStr)
          .lte('created_at', endStr),
      ])

      setWos((woRes.data as unknown as WOData[]) || [])

      if (metricRes.data && metricRes.data.length > 0) {
        const sum = metricRes.data.reduce((acc, m) => acc + Number(m.metric_value || 0), 0)
        setCsat(sum / metricRes.data.length)
      } else {
        setCsat(0)
      }
      setLoading(false)
    }
    fetchData()
  }, [startDate, endDate])

  const kpis = useMemo(() => {
    const totalWOs = wos.length
    const completedWOs = wos.filter(
      (w) => w.progress === 100 || w.status?.toLowerCase().includes('complet'),
    ).length
    const completionRate = totalWOs
      ? Math.round(wos.reduce((acc, w) => acc + (w.progress || 0), 0) / totalWOs)
      : 0
    const totalRevenue = wos.reduce((acc, w) => acc + getQuoteData(w.quotes).value, 0)

    const wosWithMargin = wos.filter((w) => getQuoteData(w.quotes).margin !== null)
    const avgMargin = wosWithMargin.length
      ? wosWithMargin.reduce((acc, w) => acc + (getQuoteData(w.quotes).margin || 0), 0) /
        wosWithMargin.length
      : 0

    return { totalWOs, completedWOs, completionRate, totalRevenue, avgMargin, csat }
  }, [wos, csat])

  const deptProgress = useMemo(() => {
    const depts = ['Sales', 'Engineering', 'Purchasing', 'Production', 'Quality', 'HR']
    return depts.map((d) => {
      const deptWOs = wos.filter((w) => (w.department || '').toLowerCase() === d.toLowerCase())
      const avg = deptWOs.length
        ? deptWOs.reduce((acc, w) => acc + (w.progress || 0), 0) / deptWOs.length
        : 0
      return { department: d, progress: Math.round(avg) }
    })
  }, [wos])

  const trendData = useMemo(() => {
    const diff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
    const data = []
    for (let i = 0; i <= diff; i++) {
      const d = startOfDay(subDays(endDate, diff - i))
      const dStr = format(d, 'MMM dd')
      const dayWOs = wos.filter(
        (w) => w.created_at && startOfDay(new Date(w.created_at)).getTime() === d.getTime(),
      )
      const rev = dayWOs.reduce((acc, w) => acc + getQuoteData(w.quotes).value, 0)
      data.push({ date: dStr, revenue: rev })
    }
    return data
  }, [wos, startDate, endDate])

  const top10 = useMemo(() => {
    return [...wos]
      .sort((a, b) => getQuoteData(b.quotes).value - getQuoteData(a.quotes).value)
      .slice(0, 10)
  }, [wos])

  return { wos, kpis, deptProgress, trendData, top10, loading }
}
