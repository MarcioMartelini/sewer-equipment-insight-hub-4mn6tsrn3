import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import HRDashboardKPIs from './HRDashboardKPIs'
import HRDashboardCharts from './HRDashboardCharts'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'
import { MultiSelect } from '@/components/MultiSelect'
import { Label } from '@/components/ui/label'

const ALL_METRICS = ['KPIs', 'Charts']

export default function DashboardTab() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(ALL_METRICS)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'HR Dashboard')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [data, setData] = useState({ prod: [], abs: [], inj: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      if (!dateRange.from) {
        setLoading(false)
        return
      }

      const startStr = format(dateRange.from, 'yyyy-MM-dd')
      const endStr = format(dateRange.to || dateRange.from, 'yyyy-MM-dd')

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
  }, [dateRange])

  const resetFilters = () => {
    setDateRange({ from: subDays(new Date(), 30), to: new Date() })
    setSelectedMetrics(ALL_METRICS)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader
        title="HR Executive Dashboard"
        description="Overview of human resources performance and metrics"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div>
          <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1">Metrics</Label>
          <MultiSelect
            options={ALL_METRICS}
            selected={selectedMetrics}
            onChange={setSelectedMetrics}
            placeholder="Select metrics..."
          />
        </div>
      </AdvancedFilters>

      <div ref={dashboardRef} className="space-y-6 bg-transparent">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
            Loading indicators...
          </div>
        ) : (
          <>
            {selectedMetrics.includes('KPIs') && <HRDashboardKPIs data={data} />}
            {selectedMetrics.includes('Charts') && <HRDashboardCharts data={data} />}
          </>
        )}
      </div>
    </div>
  )
}
