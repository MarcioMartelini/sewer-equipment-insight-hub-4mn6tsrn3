import { supabase } from '@/lib/supabase/client'

export type EngineeringType = 'layouts' | 'boms' | 'travelers' | 'accessories'

export interface EngineeringTask {
  id: string
  wo_id: string
  wo_number: string
  task_name: string
  status: string
  assigned_to: string | null
  assignee_name: string | null
  start_date: string | null
  finish_date: string | null
  completion_date: string | null
  comments: string | null
  created_at: string
  updated_at: string
}

export async function getEngineeringTasks(type: EngineeringType): Promise<EngineeringTask[]> {
  const searchMap: Record<string, string> = {
    layouts: 'layout',
    boms: 'bom',
    travelers: 'traveler',
    accessories: 'accessor',
  }
  const term = searchMap[type] || type

  const { data, error } = await supabase
    .from('wo_tasks')
    .select(`
      id,
      wo_id,
      task_name,
      status,
      assigned_to,
      start_date,
      finish_date,
      completion_date,
      comments,
      created_at,
      updated_at,
      work_orders ( wo_number ),
      users!wo_tasks_assigned_to_fkey ( full_name )
    `)
    .eq('department', 'Engineering')
    .or(`sub_department.ilike.%${term}%,task_name.ilike.%${term}%`)

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    wo_id: item.wo_id,
    wo_number: item.work_orders?.wo_number || 'Unknown',
    task_name: item.task_name,
    status: item.status || 'not_started',
    assigned_to: item.assigned_to,
    assignee_name: item.users?.full_name || null,
    start_date: item.start_date,
    finish_date: item.finish_date,
    completion_date: item.completion_date,
    comments: item.comments,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export async function assignEngineeringTask(id: string, userId: string | null) {
  const { error } = await supabase
    .from('wo_tasks')
    .update({ assigned_to: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateEngineeringStatus(type: EngineeringType, id: string, status: string) {
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

    await supabase.from('wo_task_comments_history').insert({
      task_id: id,
      comment: `Status changed from ${formatStatus(oldStatus)} to ${formatStatus(status)}`,
      author_id: user?.id,
      status: status as any,
      created_at: new Date().toISOString(),
    })
  }
}
