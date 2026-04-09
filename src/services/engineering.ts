import { supabase } from '@/lib/supabase/client'

export type EngineeringType = 'layouts' | 'boms' | 'travelers' | 'accessories'

export interface EngineeringTask {
  id: string
  wo_id: string
  wo_number: string
  task_name: string
  status: string
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
      created_at,
      updated_at,
      work_orders (
        wo_number
      )
    `)
    .eq('department', 'Engineering')
    .or(`sub_department.ilike.%${term}%,task_name.ilike.%${term}%`)

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

export async function updateEngineeringStatus(type: EngineeringType, id: string, status: string) {
  const { error } = await supabase
    .from('wo_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
