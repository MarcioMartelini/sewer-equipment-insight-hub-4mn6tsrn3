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
    id, status, is_completed, was_delayed, department, task_name, start_date, finish_date, updated_at, completion_date,
    work_orders!inner (wo_number, customer_name, product_type, machine_model, due_date),
    users!wo_tasks_assigned_to_fkey (full_name, role)
  `)
    .in('department', ['Engineering', 'Engenharia'])

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
      if (filters.tasksCompleted && (t.is_completed || t.status === 'complete')) return true
      if (filters.tasksDelayed && (t.was_delayed || t.status === 'delayed')) return true
      if (filters.tasksAtRisk && t.status === 'at_risk') return true
      return false
    })
  }

  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter(
    (t) => t.is_completed || t.status === 'complete',
  ).length
  const delayedTasks = filteredTasks.filter((t) => t.was_delayed || t.status === 'delayed').length
  const atRiskTasks = filteredTasks.filter((t) => t.status === 'at_risk').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const taskTypes = ['Layout', 'BOM', 'Traveler', 'Accessori']
  const progressByType = taskTypes.map((type) => {
    const typeTasks = filteredTasks.filter((t) =>
      t.task_name?.toLowerCase().includes(type.toLowerCase()),
    )
    const total = typeTasks.length
    const completed = typeTasks.filter((t) => t.is_completed || t.status === 'complete').length
    return {
      type: type === 'Accessori' ? 'Accessories' : type + 's',
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }
  })

  const otherTasks = filteredTasks.filter(
    (t) => !taskTypes.some((type) => t.task_name?.toLowerCase().includes(type.toLowerCase())),
  )
  if (otherTasks.length > 0) {
    const totalOther = otherTasks.length
    const completedOther = otherTasks.filter(
      (t) => t.is_completed || t.status === 'complete',
    ).length
    progressByType.push({
      type: 'Others',
      completionRate: totalOther > 0 ? (completedOther / totalOther) * 100 : 0,
    })
  }

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const completedThatDay = filteredTasks.filter((t) => {
      if (!(t.is_completed || t.status === 'complete')) return false
      const compDate = t.completion_date || t.updated_at
      if (!compDate) return false
      return compDate.startsWith(dateStr)
    }).length
    return {
      date: d.toISOString(),
      completed: completedThatDay,
    }
  })

  const delayedTaskWOIds = [
    ...new Set(
      filteredTasks
        .filter((t) => t.was_delayed || t.status === 'delayed')
        .map((t) => t.work_orders?.wo_number),
    ),
  ]

  let wosToConsider: any[] = []

  const { data: delayedWos } = await supabase
    .from('work_orders')
    .select('id, wo_number, customer_name, due_date, status, wo_tasks(id, status, is_completed)')
    .in('status', ['Delayed', 'Atrasado', 'delayed'])

  if (delayedWos) {
    wosToConsider = [...delayedWos]
  }

  if (delayedTaskWOIds.length > 0) {
    const { data: moreWos } = await supabase
      .from('work_orders')
      .select('id, wo_number, customer_name, due_date, status, wo_tasks(id, status, is_completed)')
      .in('wo_number', delayedTaskWOIds)

    if (moreWos) {
      const existingIds = new Set(wosToConsider.map((w) => w.id))
      moreWos.forEach((w) => {
        if (!existingIds.has(w.id)) {
          wosToConsider.push(w)
          existingIds.add(w.id)
        }
      })
    }
  }

  const topDelayed = wosToConsider
    .map((wo: any) => {
      let delayDays = 0
      if (wo.due_date) {
        const due = new Date(wo.due_date)
        const now = new Date()
        const diffTime = now.getTime() - due.getTime()
        if (now > due) {
          delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      const pendingTasks = (wo.wo_tasks || []).filter(
        (t: any) => !t.is_completed && t.status !== 'complete',
      ).length

      return {
        wo_id: wo.id,
        wo_number: wo.wo_number,
        customer_name: wo.customer_name || 'N/A',
        due_date: wo.due_date || new Date().toISOString(),
        delayDays,
        pendingTasks,
      }
    })
    .filter((wo) => wo.delayDays > 0 || wo.pendingTasks > 0)
    .sort((a, b) => b.delayDays - a.delayDays)
    .slice(0, 10)

  return {
    kpis: {
      totalTasks,
      completedTasks,
      completionRate,
      delayedTasks,
      atRiskTasks,
    },
    progressByType,
    trend,
    topDelayed,
  }
}
