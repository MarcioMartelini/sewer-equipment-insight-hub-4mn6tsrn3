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

export interface TaskStatusCounts {
  not_started: number
  parked: number
  on_track: number
  at_risk: number
  delayed: number
  complete: number
}

export interface DashboardData {
  kpis: {
    totalTasks: number
    notStartedTasks: number
    onTrackTasks: number
    parkedTasks: number
    atRiskTasks: number
    delayedTasks: number
    completedTasks: number
    completionRate: number
  }
  progressByType: { type: string; completionRate: number }[]
  trend: { date: string; completed: number }[]
  delayedTasksList: {
    task_id: string
    wo_number: string
    customer_name: string
    task_due_date: string
    delayDays: number
    assigned_to: string
  }[]
  layoutsStatus: TaskStatusCounts
  bomsStatus: TaskStatusCounts
  travelersStatus: TaskStatusCounts
  accessoriesStatus: TaskStatusCounts
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
  const notStartedTasks = filteredTasks.filter((t) => t.status === 'not_started').length
  const onTrackTasks = filteredTasks.filter((t) => t.status === 'on_track').length
  const parkedTasks = filteredTasks.filter((t) => t.status === 'parked').length
  const atRiskTasks = filteredTasks.filter((t) => t.status === 'at_risk').length
  const delayedTasks = filteredTasks.filter((t) => t.was_delayed || t.status === 'delayed').length
  const completedTasks = filteredTasks.filter(
    (t) => t.is_completed || t.status === 'complete',
  ).length
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

  const getCounts = (type: string) => {
    const tasks = filteredTasks.filter((t) =>
      t.task_name?.toLowerCase().includes(type.toLowerCase()),
    )
    return {
      not_started: tasks.filter((t) => t.status === 'not_started').length,
      parked: tasks.filter((t) => t.status === 'parked').length,
      on_track: tasks.filter((t) => t.status === 'on_track').length,
      at_risk: tasks.filter((t) => t.status === 'at_risk').length,
      delayed: tasks.filter((t) => t.was_delayed || t.status === 'delayed').length,
      complete: tasks.filter((t) => t.status === 'complete' || t.is_completed).length,
    }
  }

  const layoutsStatus = getCounts('layout')
  const bomsStatus = getCounts('bom')
  const travelersStatus = getCounts('traveler')
  const accessoriesStatus = getCounts('accessori')

  const delayedTasksList = filteredTasks
    .filter((t) => {
      if (t.is_completed || t.status === 'complete') return false
      let isPast = false
      if (t.finish_date) {
        isPast = new Date() > new Date(t.finish_date)
      }
      return t.status === 'delayed' || t.was_delayed || isPast
    })
    .map((t: any) => {
      let delayDays = 0
      if (t.finish_date) {
        const due = new Date(t.finish_date)
        const now = new Date()
        const diffTime = now.getTime() - due.getTime()
        if (now > due) {
          delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      return {
        task_id: t.id,
        wo_number: t.wo_number,
        customer_name: t.customer_name || 'N/A',
        task_due_date: t.finish_date || '',
        delayDays,
        assigned_to: t.assignee_name || 'Unassigned',
      }
    })
    .filter((t) => t.delayDays > 0)
    .sort((a, b) => b.delayDays - a.delayDays)

  return {
    kpis: {
      totalTasks,
      notStartedTasks,
      onTrackTasks,
      parkedTasks,
      atRiskTasks,
      delayedTasks,
      completedTasks,
      completionRate,
    },
    progressByType,
    trend,
    delayedTasksList,
    layoutsStatus,
    bomsStatus,
    travelersStatus,
    accessoriesStatus,
  }
}
