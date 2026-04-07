import { supabase } from '@/lib/supabase/client'
import { subDays, addDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'

export type PeriodFilter = '7d' | '30d' | '90d' | 'custom'

export interface DashboardData {
  kpis: {
    totalTasks: number
    completedTasks: number
    completionRate: number
    delayedTasks: number
    atRiskTasks: number
  }
  progressByType: {
    type: string
    total: number
    completed: number
    completionRate: number
  }[]
  trend: {
    date: string
    completed: number
  }[]
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
  period: PeriodFilter,
  customStart?: Date,
  customEnd?: Date,
): Promise<DashboardData> {
  let startDate = startOfDay(subDays(new Date(), 30))
  let endDate = endOfDay(new Date())

  if (period === '7d') startDate = startOfDay(subDays(new Date(), 7))
  else if (period === '30d') startDate = startOfDay(subDays(new Date(), 30))
  else if (period === '90d') startDate = startOfDay(subDays(new Date(), 90))
  else if (period === 'custom') {
    startDate = customStart ? startOfDay(customStart) : startOfDay(subDays(new Date(), 365))
    endDate = customEnd ? endOfDay(customEnd) : endOfDay(new Date())
  }

  const tables = [
    { name: 'engineering_layouts', type: 'Layouts' },
    { name: 'engineering_boms', type: 'BOMs' },
    { name: 'engineering_travelers', type: 'Travelers' },
    { name: 'engineering_accessories', type: 'Accessories' },
  ]

  let allTasks: any[] = []

  for (const { name, type } of tables) {
    const { data, error } = await supabase.from(name).select(`
        id, 
        status, 
        created_at, 
        updated_at, 
        wo_id, 
        work_orders (wo_number, due_date, customer_name)
      `)

    if (error) {
      console.error(`Error fetching ${name}:`, error)
      continue
    }

    if (data) {
      allTasks = allTasks.concat(
        data.map((item: any) => ({
          ...item,
          task_type: type,
        })),
      )
    }
  }

  const relevantTasks = allTasks.filter((task) => {
    if (!task.created_at || !task.updated_at) return false
    const created = new Date(task.created_at)
    const updated = new Date(task.updated_at)
    const inPeriod =
      (isAfter(created, startDate) && isBefore(created, endDate)) ||
      (isAfter(updated, startDate) && isBefore(updated, endDate))
    const isPending = task.status !== 'completed' && task.status !== 'Concluído'
    return inPeriod || isPending
  })

  const totalTasks = relevantTasks.length
  const completedTasks = relevantTasks.filter(
    (t) => t.status === 'completed' || t.status === 'Concluído',
  ).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const now = new Date()
  let delayedTasks = 0
  let atRiskTasks = 0
  const delayedWOs = new Map<string, any>()

  relevantTasks.forEach((task) => {
    const isCompleted = task.status === 'completed' || task.status === 'Concluído'
    if (!isCompleted && task.work_orders?.due_date) {
      const dueDate = new Date(task.work_orders.due_date)
      if (isBefore(dueDate, startOfDay(now))) {
        delayedTasks++
        const delayDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        if (!delayedWOs.has(task.wo_id)) {
          delayedWOs.set(task.wo_id, {
            wo_id: task.wo_id,
            wo_number: task.work_orders.wo_number,
            customer_name: task.work_orders.customer_name,
            due_date: task.work_orders.due_date,
            delayDays,
            pendingTasks: 1,
          })
        } else {
          delayedWOs.get(task.wo_id).pendingTasks++
        }
      } else if (isBefore(dueDate, startOfDay(addDays(now, 3)))) {
        atRiskTasks++
      }
    }
  })

  const progressByType = tables.map((t) => {
    const typeTasks = relevantTasks.filter((task) => task.task_type === t.type)
    const typeTotal = typeTasks.length
    const typeCompleted = typeTasks.filter(
      (task) => task.status === 'completed' || task.status === 'Concluído',
    ).length
    return {
      type: t.type,
      total: typeTotal,
      completed: typeCompleted,
      completionRate: typeTotal > 0 ? Number(((typeCompleted / typeTotal) * 100).toFixed(1)) : 0,
    }
  })

  const trendMap = new Map<string, number>()
  const trendDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30

  for (let i = trendDays - 1; i >= 0; i--) {
    const d = startOfDay(subDays(now, i)).toISOString().split('T')[0]
    trendMap.set(d, 0)
  }

  relevantTasks.forEach((task) => {
    if (task.status === 'completed' || task.status === 'Concluído') {
      const date = new Date(task.updated_at).toISOString().split('T')[0]
      if (trendMap.has(date)) {
        trendMap.set(date, trendMap.get(date)! + 1)
      }
    }
  })

  const trend = Array.from(trendMap.entries()).map(([date, completed]) => ({ date, completed }))

  const topDelayed = Array.from(delayedWOs.values())
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
