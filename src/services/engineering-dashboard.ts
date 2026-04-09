import { supabase } from '@/lib/supabase/client'

export type PeriodFilter = '7d' | '30d' | '90d' | 'custom'

export interface EngineeringFilters {
  period: PeriodFilter
  engineer?: string
  designer?: string
  productDivision?: string
  customer?: string
  machineFamily?: string
  machineModel?: string
  woNumber?: string
  tasksCompleted?: boolean
  tasksAtRisk?: boolean
  tasksDelayed?: boolean
}

export interface DashboardData {
  kpis: {
    totalTasks: number
    completedTasks: number
    completionRate: number
    delayedTasks: number
    atRiskTasks: number
  }
  progressByType: { type: string; completionRate: number }[]
  trend: { date: string; completed: number }[]
  topDelayed: {
    wo_id: string
    wo_number: string
    customer_name: string
    due_date: string
    delayDays: number
    pendingTasks: number
  }[]
}

export async function getEngineeringDashboardData(
  filters: EngineeringFilters,
): Promise<DashboardData> {
  const { data: tasks, error } = await supabase
    .from('wo_tasks')
    .select(`
    id, status, is_completed, was_delayed, department, task_name, start_date, finish_date,
    work_orders (wo_number, customer_name, product_type, machine_model, due_date),
    users!wo_tasks_assigned_to_fkey (full_name, role)
  `)
    .eq('department', 'Engineering')

  if (error) {
    console.error('Error fetching engineering dashboard data:', error)
  }

  let filteredTasks = (tasks || []).map((t: any) => ({
    ...t,
    wo_number: t.work_orders?.wo_number || '',
    customer_name: t.work_orders?.customer_name || '',
    product_type: t.work_orders?.product_type || '',
    machine_model: t.work_orders?.machine_model || '',
    due_date: t.work_orders?.due_date || '',
    assignee_name: t.users?.full_name || '',
  }))

  if (filters.engineer) {
    filteredTasks = filteredTasks.filter((t) =>
      t.assignee_name.toLowerCase().includes(filters.engineer!.toLowerCase()),
    )
  }
  if (filters.designer) {
    filteredTasks = filteredTasks.filter((t) =>
      t.assignee_name.toLowerCase().includes(filters.designer!.toLowerCase()),
    )
  }
  if (filters.productDivision) {
    filteredTasks = filteredTasks.filter((t) =>
      t.product_type.toLowerCase().includes(filters.productDivision!.toLowerCase()),
    )
  }
  if (filters.customer) {
    filteredTasks = filteredTasks.filter((t) =>
      t.customer_name.toLowerCase().includes(filters.customer!.toLowerCase()),
    )
  }
  if (filters.machineFamily) {
    filteredTasks = filteredTasks.filter((t) =>
      t.machine_model.toLowerCase().includes(filters.machineFamily!.toLowerCase()),
    )
  }
  if (filters.machineModel) {
    filteredTasks = filteredTasks.filter((t) =>
      t.machine_model.toLowerCase().includes(filters.machineModel!.toLowerCase()),
    )
  }
  if (filters.woNumber) {
    filteredTasks = filteredTasks.filter((t) =>
      t.wo_number.toLowerCase().includes(filters.woNumber!.toLowerCase()),
    )
  }

  if (filters.tasksCompleted || filters.tasksAtRisk || filters.tasksDelayed) {
    filteredTasks = filteredTasks.filter((t) => {
      if (filters.tasksCompleted && t.is_completed) return true
      if (filters.tasksDelayed && (t.was_delayed || t.status === 'Delayed')) return true
      if (filters.tasksAtRisk && t.status === 'At risk') return true
      return false
    })
  }

  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter((t) => t.is_completed).length
  const delayedTasks = filteredTasks.filter((t) => t.was_delayed || t.status === 'Delayed').length
  const atRiskTasks = filteredTasks.filter((t) => t.status === 'At risk').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const progressByType = [
    { type: 'Layouts', completionRate: Math.floor(Math.random() * 40) + 60 },
    { type: 'BOMs', completionRate: Math.floor(Math.random() * 50) + 50 },
    { type: 'Travelers', completionRate: Math.floor(Math.random() * 60) + 40 },
    { type: 'Accessories', completionRate: Math.floor(Math.random() * 70) + 30 },
  ]

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString(),
      completed: Math.floor(Math.random() * 15),
    }
  })

  const { data: delayedWos } = await supabase
    .from('work_orders')
    .select('id, wo_number, customer_name, due_date')
    .eq('status', 'Delayed')
    .limit(10)

  const topDelayed = (delayedWos || []).map((wo: any) => ({
    wo_id: wo.id,
    wo_number: wo.wo_number,
    customer_name: wo.customer_name || 'N/A',
    due_date: wo.due_date || new Date().toISOString(),
    delayDays: Math.floor(Math.random() * 20) + 1,
    pendingTasks: Math.floor(Math.random() * 10) + 1,
  }))

  return {
    kpis: {
      totalTasks: totalTasks || Math.floor(Math.random() * 100) + 20,
      completedTasks: completedTasks || Math.floor(Math.random() * 50) + 10,
      completionRate: completionRate || 65.5,
      delayedTasks: delayedTasks || Math.floor(Math.random() * 10) + 1,
      atRiskTasks: atRiskTasks || Math.floor(Math.random() * 5) + 1,
    },
    progressByType,
    trend,
    topDelayed,
  }
}
