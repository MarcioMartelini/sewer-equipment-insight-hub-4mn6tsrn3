import { useState, useEffect, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import PurchasingKPIs from './PurchasingKPIs'
import PurchasingCharts from './PurchasingCharts'
import PurchasingDelayedTable from './PurchasingDelayedTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DepartmentTasks } from '@/components/tasks/DepartmentTasks'

export default function PurchasingDashboard() {
  const [period, setPeriod] = useState('30')
  const [components, setComponents] = useState<any[]>([])
  const [expedites, setExpedites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const dateRange = useMemo(() => {
    const today = endOfDay(new Date())
    if (period === '7') return { from: startOfDay(subDays(today, 7)), to: today }
    if (period === '30') return { from: startOfDay(subDays(today, 30)), to: today }
    if (period === '90') return { from: startOfDay(subDays(today, 90)), to: today }
    // Fallback for custom selection if a date picker is not fully implemented
    return { from: startOfDay(subDays(today, 30)), to: today }
  }, [period])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: compData } = await supabase
        .from('purchasing_components')
        .select('*, work_orders(wo_number)')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())

      const { data: expData } = await supabase
        .from('purchasing_expedites')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())

      setComponents(compData || [])
      setExpedites(expData || [])
      setLoading(false)
    }
    fetchData()
  }, [dateRange])

  return (
    <Tabs defaultValue="overview" className="space-y-4 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Purchasing Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of supply chain and component delivery performance.
            </p>
          </div>
          <TabsList className="w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Schedule</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom (Last 30 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-4 mt-0">
        <PurchasingKPIs components={components} expedites={expedites} loading={loading} />
        <PurchasingCharts components={components} loading={loading} />
        <PurchasingDelayedTable components={components} loading={loading} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-0">
        <DepartmentTasks department="Purchasing" />
      </TabsContent>
    </Tabs>
  )
}
