import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PurchasingPerformanceKPIs from './PurchasingPerformanceKPIs'
import PurchasingPerformanceCharts from './PurchasingPerformanceCharts'
import PurchasingTopSuppliers from './PurchasingTopSuppliers'

export default function PurchasingPerformanceTab({ woFilter }: { woFilter: string }) {
  const [period, setPeriod] = useState('30')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [assigneeFilter, setAssignedFilter] = useState('all')

  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [tasksRes, usersRes] = await Promise.all([
      supabase
        .from('purchasing_tasks')
        .select('*, assigned_to_user:users!purchasing_tasks_assigned_to_fkey(full_name)'),
      supabase.from('users').select('id, full_name'),
    ])

    const tasksData = tasksRes.data || []
    setTasks(tasksData)
    setUsers(usersRes.data || [])

    const uniqueSuppliers = Array.from(
      new Set(tasksData.map((t) => t.supplier).filter(Boolean)),
    ) as string[]
    setSuppliers(uniqueSuppliers)
    setLoading(false)
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (period !== 'all') {
      const days = parseInt(period)
      const cutoff = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((t) => new Date(t.created_at) >= cutoff)
    }

    if (supplierFilter !== 'all') {
      filtered = filtered.filter((t) => t.supplier === supplierFilter)
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter((t) => t.assigned_to === assigneeFilter)
    }

    if (woFilter) {
      filtered = filtered.filter(
        (t) =>
          t.component_name?.toLowerCase().includes(woFilter.toLowerCase()) ||
          t.supplier?.toLowerCase().includes(woFilter.toLowerCase()),
      )
    }

    return filtered
  }, [tasks, period, supplierFilter, assigneeFilter, woFilter])

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance & Health Check</h2>
          <p className="text-muted-foreground">Overview of purchasing tasks performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <PurchasingPerformanceKPIs tasks={filteredTasks} loading={loading} />
      <PurchasingPerformanceCharts tasks={filteredTasks} loading={loading} />
      <PurchasingTopSuppliers tasks={filteredTasks} loading={loading} />
    </div>
  )
}
