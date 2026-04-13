import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import PurchasingKPIs from './PurchasingKPIs'
import PurchasingCharts from './PurchasingCharts'
import PurchasingDelayedTable from './PurchasingDelayedTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DepartmentTasks } from '@/components/tasks/DepartmentTasks'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { AdvancedFilters } from '@/components/shared/AdvancedFilters'
import { useDashboardExport } from '@/hooks/use-dashboard-export'

export default function PurchasingDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(dashboardRef, 'Purchasing Dashboard')

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    componentType: 'all',
    woNumber: '',
  })

  const [components, setComponents] = useState<any[]>([])
  const [expedites, setExpedites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (!dateRange.from) {
        setLoading(false)
        return
      }

      const { data: compData } = await supabase
        .from('purchasing_components')
        .select('*, work_orders(wo_number)')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte(
          'created_at',
          dateRange.to
            ? endOfDay(dateRange.to).toISOString()
            : endOfDay(dateRange.from).toISOString(),
        )

      const { data: expData } = await supabase
        .from('purchasing_expedites')
        .select('*')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte(
          'created_at',
          dateRange.to
            ? endOfDay(dateRange.to).toISOString()
            : endOfDay(dateRange.from).toISOString(),
        )

      setComponents(compData || [])
      setExpedites(expData || [])
      setLoading(false)
    }
    fetchData()
  }, [dateRange])

  const resetFilters = () => {
    setFilters({ status: 'all', componentType: 'all', woNumber: '' })
    setDateRange({ from: subDays(new Date(), 30), to: new Date() })
  }

  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      if (filters.status !== 'all' && c.status !== filters.status) return false
      if (filters.componentType !== 'all' && c.component_type !== filters.componentType)
        return false
      if (
        filters.woNumber &&
        !c.work_orders?.wo_number?.toLowerCase().includes(filters.woNumber.toLowerCase())
      )
        return false
      return true
    })
  }, [components, filters])

  const filteredExpedites = useMemo(() => {
    return expedites.filter((e) => {
      if (filters.status !== 'all' && e.status !== filters.status) return false
      if (filters.componentType !== 'all' && e.component_type !== filters.componentType)
        return false
      return true
    })
  }, [expedites, filters])

  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader
        title="Purchasing Dashboard"
        description="Overview of supply chain and component delivery performance"
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExportPDF}
        isExporting={isExporting}
      >
        <TabsList className="w-fit h-9 mt-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Schedule</TabsTrigger>
        </TabsList>
      </DashboardHeader>

      <AdvancedFilters isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} onReset={resetFilters}>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Component Type</Label>
          <Select
            value={filters.componentType}
            onValueChange={(v) => setFilters((f) => ({ ...f, componentType: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Engine">Engine</SelectItem>
              <SelectItem value="Hydraulics">Hydraulics</SelectItem>
              <SelectItem value="Water Pump">Water Pump</SelectItem>
              <SelectItem value="Water Tank">Water Tank</SelectItem>
              <SelectItem value="Debris Box">Debris Box</SelectItem>
              <SelectItem value="Blower">Blower</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">WO Number</Label>
          <Input
            value={filters.woNumber}
            onChange={(e) => setFilters((f) => ({ ...f, woNumber: e.target.value }))}
            placeholder="Search WO..."
          />
        </div>
      </AdvancedFilters>

      <TabsContent value="overview" className="space-y-6 mt-0" ref={dashboardRef}>
        <PurchasingKPIs
          components={filteredComponents}
          expedites={filteredExpedites}
          loading={loading}
        />
        <PurchasingCharts components={filteredComponents} loading={loading} />
        <PurchasingDelayedTable components={filteredComponents} loading={loading} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-0">
        <DepartmentTasks department="Purchasing" />
      </TabsContent>
    </Tabs>
  )
}
