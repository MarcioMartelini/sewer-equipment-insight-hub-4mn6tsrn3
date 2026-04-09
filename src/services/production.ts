import { supabase } from '@/lib/supabase/client'

export type ProductionType =
  | 'weld_shop'
  | 'paint'
  | 'sub_assembly'
  | 'warehouse'
  | 'final_assembly'
  | 'tests'
  | 'all'

export interface ProductionTask {
  id: string
  wo_id: string
  wo_number: string
  task_name: string
  status: string
  created_at: string
  updated_at: string
}

export async function getProductionTasks(type: ProductionType): Promise<ProductionTask[]> {
  const searchMap: Record<string, string> = {
    weld_shop: 'Weld Shop',
    paint: 'Paint',
    sub_assembly: 'Sub Assembly',
    warehouse: 'Warehouse',
    final_assembly: 'Final Assembly',
    tests: 'Tests',
  }

  let query = supabase
    .from('wo_tasks')
    .select(
      `
      id,
      wo_id,
      task_name,
      status,
      created_at,
      updated_at,
      work_orders (
        wo_number
      )
    `,
    )
    .eq('department', 'Production')

  if (type !== 'all') {
    const term = searchMap[type] || type
    query = query.ilike('sub_department', `%${term}%`)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    wo_id: item.wo_id,
    wo_number: item.work_orders?.wo_number || 'Unknown',
    task_name: item.task_name,
    status: item.status || 'not started',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export async function updateProductionStatus(
  type: ProductionType,
  id: string,
  status: string,
  comment?: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: oldTask } = await supabase
    .from('wo_tasks')
    .select('status, was_delayed, finish_date')
    .eq('id', id)
    .single()

  const oldStatus = oldTask?.status || 'not_started'
  const isCompleted = status === 'complete'
  const completionDate = isCompleted ? new Date().toISOString() : null

  let delayed = oldTask?.was_delayed || false
  if (!delayed && oldTask?.finish_date) {
    const finish = new Date(oldTask.finish_date)
    const today = new Date()
    finish.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (today > finish) {
      delayed = true
    }
  }

  const { error } = await supabase
    .from('wo_tasks')
    .update({
      status: status as any,
      is_completed: isCompleted,
      completion_date: completionDate,
      was_delayed: delayed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error

  if (oldStatus !== status) {
    const formatStatus = (s: string) => {
      if (s === 'not_started') return 'Not Started'
      if (s === 'on_track') return 'On Track'
      if (s === 'at_risk') return 'At Risk'
      return s.charAt(0).toUpperCase() + s.slice(1)
    }

    const finalComment = comment
      ? `Status changed from ${formatStatus(oldStatus)} to ${formatStatus(status)}. Reason: ${comment}`
      : `Status changed from ${formatStatus(oldStatus)} to ${formatStatus(status)}`

    await supabase.from('wo_task_comments_history').insert({
      task_id: id,
      comment: finalComment,
      author_id: user?.id,
      status: status as any,
      created_at: new Date().toISOString(),
    })
  }
}
