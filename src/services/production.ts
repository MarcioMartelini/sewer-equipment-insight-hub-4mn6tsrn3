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
  customer_name?: string
  product_type?: string
  machine_model?: string
  task_name: string
  department?: string
  sub_department?: string
  start_date?: string | null
  finish_date?: string | null
  status: string
  assigned_to?: string | null
  assigned_to_name?: string | null
  is_completed?: boolean | null
  completion_date?: string | null
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
    .from('production_tasks')
    .select(
      `
    id,
    wo_id,
    task_name,
    department,
    sub_department,
    start_date,
    finish_date,
    status,
    assigned_to,
    is_completed,
    completion_date,
    created_at,
    updated_at,
    work_orders (
      wo_number,
      customer_name,
      product_type,
      machine_model
    ),
    users!production_tasks_assigned_to_fkey (
      full_name
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
    customer_name: item.work_orders?.customer_name,
    product_type: item.work_orders?.product_type,
    machine_model: item.work_orders?.machine_model,
    task_name: item.task_name,
    department: item.department,
    sub_department: item.sub_department,
    start_date: item.start_date,
    finish_date: item.finish_date,
    status: item.status || 'not_started',
    assigned_to: item.assigned_to,
    assigned_to_name: item.users?.full_name,
    is_completed: item.is_completed,
    completion_date: item.completion_date,
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
    .from('production_tasks')
    .select('status, finish_date')
    .eq('id', id)
    .single()

  const oldStatus = oldTask?.status || 'not_started'
  const isCompleted = status === 'complete'
  const completionDate = isCompleted ? new Date().toISOString() : null

  const { error } = await supabase
    .from('production_tasks')
    .update({
      status: status as any,
      is_completed: isCompleted,
      completion_date: completionDate,
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

    await supabase.from('production_task_comments_history').insert({
      task_id: id,
      comment: finalComment,
      author_id: user?.id,
      status: status as any,
      created_at: new Date().toISOString(),
    })
  }
}

export async function getProductionTaskComments(taskId: string) {
  const { data, error } = await supabase
    .from('production_task_comments_history')
    .select(`
      id,
      comment,
      status,
      created_at,
      users!production_task_comments_history_author_id_fkey (
        full_name
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((c: any) => ({
    id: c.id,
    comment: c.comment,
    status: c.status,
    created_at: c.created_at,
    author_name: c.users?.full_name || 'Unknown User',
  }))
}

export async function addProductionTaskComment(taskId: string, comment: string, status: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from('production_task_comments_history').insert({
    task_id: taskId,
    comment,
    author_id: user?.id,
    status: status as any,
    created_at: new Date().toISOString(),
  })
  if (error) throw error
}
