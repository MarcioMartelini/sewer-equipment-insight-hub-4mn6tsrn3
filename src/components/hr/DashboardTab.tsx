import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import HRDashboardKPIs from './HRDashboardKPIs'
import HRDashboardCharts from './HRDashboardCharts'

export default function DashboardTab() {
  const [dateRange, setDateRange] = useState('30')
  const [customDates, setCustomDates] = useState({ start: '', end: '' })
  const [data, setData] = useState({ prod: [], abs: [], inj: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      let start = new Date()
      let end = new Date()

      if (dateRange !== 'custom') {
        start = subDays(new Date(), parseInt(dateRange))
      } else if (customDates.start && customDates.end) {
        start = new Date(customDates.start)
        end = new Date(customDates.end)
      } else {
        setLoading(false)
        return
      }

      const startStr = format(start, 'yyyy-MM-dd')
      const endStr = format(end, 'yyyy-MM-dd')

      const [prodRes, absRes, injRes] = await Promise.all([
        supabase
          .from('hr_productivity')
          .select('*')
          .gte('recorded_date', startStr)
          .lte('recorded_date', endStr),
        supabase
          .from('hr_absences')
          .select('*')
          .gte('absence_date', startStr)
          .lte('absence_date', endStr),
        supabase
          .from('hr_injuries')
          .select('*')
          .gte('injury_date', startStr)
          .lte('injury_date', endStr),
      ])

      setData({
        prod: prodRes.data || [],
        abs: absRes.data || [],
        inj: injRes.data || [],
      })
      setLoading(false)
    }
    fetchData()
  }, [dateRange, customDates])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold">Dashboard Executivo</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 mr-2">
              <Input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates((p) => ({ ...p, start: e.target.value }))}
                className="w-auto h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates((p) => ({ ...p, end: e.target.value }))}
                className="w-auto h-9"
              />
            </div>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Carregando indicadores...
        </div>
      ) : (
        <>
          <HRDashboardKPIs data={data} />
          <HRDashboardCharts data={data} />
        </>
      )}
    </div>
  )
}
