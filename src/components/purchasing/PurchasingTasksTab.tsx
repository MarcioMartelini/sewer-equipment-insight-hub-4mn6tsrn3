import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PurchasingTasksTable } from './PurchasingTasksTable'
import { PurchasingTasksSummary } from './PurchasingTasksSummary'
import { PurchasingTasksFilters } from './PurchasingTasksFilters'
import { PurchasingTaskDetails } from './PurchasingTaskDetails'
import { useToast } from '@/hooks/use-toast'

export default function PurchasingTasksTab({ woFilter = '' }: { woFilter?: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const { toast } = useToast()

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('purchasing_tasks')
        .select(`
          *,
          work_orders ( wo_number ),
          users ( full_name ),
          comments:purchasing_task_comments_history ( id )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      toast({ title: 'Error fetching tasks', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((t) => {
    if (woFilter && !t.work_orders?.wo_number?.toLowerCase().includes(woFilter.toLowerCase()))
      return false
    if (search) {
      const s = search.toLowerCase()
      const matchComp = t.component_name?.toLowerCase().includes(s)
      const matchWo = t.work_orders?.wo_number?.toLowerCase().includes(s)
      if (!matchComp && !matchWo) return false
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (supplierFilter !== 'all' && t.supplier !== supplierFilter) return false
    if (assigneeFilter !== 'all' && t.users?.full_name !== assigneeFilter) return false

    if (dateRangeFilter !== 'all') {
      const taskDate = new Date(t.start_date || t.created_at)
      const now = new Date()
      const diffDays = (now.getTime() - taskDate.getTime()) / (1000 * 3600 * 24)
      if (dateRangeFilter === '7d' && diffDays > 7) return false
      if (dateRangeFilter === '30d' && diffDays > 30) return false
    }

    return true
  })

  const suppliers = Array.from(new Set(tasks.map((t) => t.supplier).filter(Boolean)))
  const assignees = Array.from(new Set(tasks.map((t) => t.users?.full_name).filter(Boolean)))

  return (
    <div className="space-y-6 animate-fade-in">
      <PurchasingTasksSummary tasks={filteredTasks} />
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <PurchasingTasksFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          supplierFilter={supplierFilter}
          setSupplierFilter={setSupplierFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          suppliers={suppliers}
          assignees={assignees}
        />
        <PurchasingTasksTable
          tasks={filteredTasks}
          onSelectTask={setSelectedTask}
          loading={loading}
        />
      </div>
      {selectedTask && (
        <PurchasingTaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  )
}
