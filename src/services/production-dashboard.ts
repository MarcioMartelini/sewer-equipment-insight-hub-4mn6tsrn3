import { supabase } from '@/lib/supabase/client'
import { subDays, format } from 'date-fns'

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
    .select(
      `
      id,
      status,
      sub_department,
      created_at,
      updated_at,
      assigned_to,
      wo_id,
      work_orders!inner (
        id,
        wo_number,
        customer_name,
        due_date,
        product_type,
        machine_model
      )
    `,
    )
    .eq('department', 'Production')

  if (filters.woNumber) {
    query = query.ilike('work_orders.wo_number', `%${filters.woNumber}%`)
  }
  if (filters.customer) {
    query = query.ilike('work_orders.customer_name', `%${filters.customer}%`)
  }
  if (filters.machineModel) {
    query = query.ilike('work_orders.machine_model', `%${filters.machineModel}%`)
  }

  if (filters.period && filters.period !== 'custom') {
    const days = parseInt(filters.period.replace('d', ''))
    if (!isNaN(days)) {
      const date = subDays(new Date(), days).toISOString()
      query = query.gte('created_at', date)
    }
  }

  const { data, error } = await query

  if (error) throw error

  let tasks = data || []

  if (filters.tasksCompleted || filters.tasksAtRisk || filters.tasksDelayed) {
    tasks = tasks.filter((t) => {
      const s = t.status?.toLowerCase()
      if (filters.tasksCompleted && s === 'complete') return true
      if (filters.tasksAtRisk && s === 'at_risk') return true
      if (filters.tasksDelayed && s === 'delayed') return true
      return false
    })
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'complete').length
  const delayedTasks = tasks.filter((t) => t.status === 'delayed').length
  const atRiskTasks = tasks.filter((t) => t.status === 'at_risk').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const types = ['Weld Shop', 'Paint', 'Sub Assembly', 'Warehouse', 'Final Assembly', 'Tests']
  const progressByType = types.map((type) => {
    const typeTasks = tasks.filter((t) =>
      t.sub_department?.toLowerCase().includes(type.toLowerCase()),
    )
    const typeTotal = typeTasks.length
    const typeCompleted = typeTasks.filter((t) => t.status === 'complete').length
    return {
      type,
      completionRate: typeTotal > 0 ? (typeCompleted / typeTotal) * 100 : 0,
    }
  })

  const trendMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    trendMap.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), 0)
  }

  tasks
    .filter((t) => t.status === 'complete' && t.updated_at)
    .forEach((t) => {
      const dateStr = t.updated_at!.split('T')[0]
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr)! + 1)
      }
    })

  const trend = Array.from(trendMap.entries()).map(([date, completed]) => ({ date, completed }))

  const delayedWOs = new Map<string, any>()
  tasks
    .filter((t) => t.status === 'delayed' && t.work_orders)
    .forEach((t) => {
      const wo = Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders
      if (!wo) return
      if (!delayedWOs.has(wo.id)) {
        let delayDays = 0
        if (wo.due_date) {
          delayDays = Math.max(
            0,
            Math.floor((new Date().getTime() - new Date(wo.due_date).getTime()) / 86400000),
          )
        }
        delayedWOs.set(wo.id, {
          wo_id: wo.id,
          wo_number: wo.wo_number,
          customer_name: wo.customer_name,
          due_date: wo.due_date || '-',
          delayDays,
          pendingTasks: 0,
        })
      }
      delayedWOs.get(wo.id)!.pendingTasks += 1
    })

  const topDelayed = Array.from(delayedWOs.values())
    .sort((a, b) => b.delayDays - a.delayDays || b.pendingTasks - a.pendingTasks)
    .slice(0, 10)

  return {
    kpis: { totalTasks, completedTasks, completionRate, delayedTasks, atRiskTasks },
    progressByType,
    trend,
    topDelayed,
  }
}
