import { supabase } from '@/lib/supabase/client'

export interface ProductionFilters {
  period: string
  operator: string
  productDivision: string
  customer: string
  machineFamily: string
  machineModel: string
  woNumber: string
  tasksCompleted: boolean
  tasksAtRisk: boolean
  tasksDelayed: boolean
  subDepartment?: string
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

export async function getProductionDashboardData(
  filters: ProductionFilters,
): Promise<DashboardData> {
  let query = supabase
    .from('wo_tasks')
    .select(`
      id,
      status,
      is_completed,
      completion_date,
      was_delayed,
      sub_department,
      created_at,
      work_orders!inner (
        wo_number,
        customer_name,
        machine_model,
        due_date
      )
    `)
    .eq('department', 'Production')

  if (filters.subDepartment && filters.subDepartment !== 'all') {
    const searchMap: Record<string, string> = {
      weld_shop: 'Weld Shop',
      paint: 'Paint',
      sub_assembly: 'Sub Assembly',
      warehouse: 'Warehouse',
      final_assembly: 'Final Assembly',
      tests: 'Tests',
    }
    const term = searchMap[filters.subDepartment] || filters.subDepartment
    query = query.ilike('sub_department', `%${term}%`)
  }

  if (filters.woNumber) {
    query = query.ilike('work_orders.wo_number', `%${filters.woNumber}%`)
  }
  if (filters.customer) {
    query = query.ilike('work_orders.customer_name', `%${filters.customer}%`)
  }
  if (filters.machineModel) {
    query = query.ilike('work_orders.machine_model', `%${filters.machineModel}%`)
  }

  if (filters.tasksCompleted) {
    query = query.eq('is_completed', true)
  }
  if (filters.tasksDelayed) {
    query = query.eq('status', 'delayed')
  }
  if (filters.tasksAtRisk) {
    query = query.eq('status', 'at_risk')
  }

  if (filters.period && filters.period !== 'custom') {
    const days = parseInt(filters.period.replace('d', ''))
    if (!isNaN(days)) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      query = query.gte('created_at', date.toISOString())
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Dashboard error:', error)
    throw error
  }

  const tasks = data || []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.is_completed || t.status === 'complete').length
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0
  const delayedTasks = tasks.filter((t) => t.status === 'delayed' || t.was_delayed).length
  const atRiskTasks = tasks.filter((t) => t.status === 'at_risk').length

  const types = ['Weld Shop', 'Paint', 'Sub Assembly', 'Warehouse', 'Final Assembly', 'Tests']
  const progressByType = types.map((type) => {
    const typeTasks = tasks.filter((t) =>
      t.sub_department?.toLowerCase().includes(type.toLowerCase()),
    )
    const total = typeTasks.length
    const comp = typeTasks.filter((t) => t.is_completed || t.status === 'complete').length
    return {
      type,
      completionRate: total ? (comp / total) * 100 : 0,
    }
  })

  const trendMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    trendMap[d.toISOString().split('T')[0]] = 0
  }

  tasks.forEach((t) => {
    if ((t.is_completed || t.status === 'complete') && t.completion_date) {
      const dateStr = t.completion_date.split('T')[0]
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr]++
      }
    }
  })

  const trend = Object.entries(trendMap)
    .map(([date, completed]) => ({ date, completed }))
    .slice(-30)

  const delayedWOsMap = new Map<string, any>()
  tasks
    .filter((t) => t.status === 'delayed' || t.was_delayed)
    .forEach((t) => {
      const wo = Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders
      if (!wo) return

      if (!delayedWOsMap.has(wo.wo_number)) {
        let delayDays = 0
        if (wo.due_date) {
          const diff = new Date().getTime() - new Date(wo.due_date).getTime()
          delayDays = Math.max(0, Math.floor(diff / (1000 * 3600 * 24)))
        }
        delayedWOsMap.set(wo.wo_number, {
          wo_id: wo.wo_number,
          wo_number: wo.wo_number,
          customer_name: wo.customer_name || 'Unknown',
          due_date: wo.due_date || '-',
          delayDays,
          pendingTasks: 0,
        })
      }
      if (!t.is_completed && t.status !== 'complete') {
        delayedWOsMap.get(wo.wo_number).pendingTasks++
      }
    })

  const topDelayed = Array.from(delayedWOsMap.values())
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
