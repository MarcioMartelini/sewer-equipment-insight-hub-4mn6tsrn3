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
  const tableMap = {
    layouts: { table: 'engineering_layouts', nameCol: 'layout_name' },
    boms: { table: 'engineering_boms', nameCol: 'bom_name' },
    travelers: { table: 'engineering_travelers', nameCol: 'traveler_name' },
    accessories: { table: 'engineering_accessories', nameCol: 'accessories_list_name' },
  }

  const { table, nameCol } = tableMap[type]

  const { data, error } = await supabase.from(table).select(`
      id,
      wo_id,
      ${nameCol},
      status,
      created_at,
      updated_at,
      work_orders (
        wo_number
      )
    `)

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    wo_id: item.wo_id,
    wo_number: item.work_orders?.wo_number || 'Unknown',
    task_name: item[nameCol],
    status: item.status || 'not started',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export async function updateEngineeringStatus(type: EngineeringType, id: string, status: string) {
  const tableMap = {
    layouts: 'engineering_layouts',
    boms: 'engineering_boms',
    travelers: 'engineering_travelers',
    accessories: 'engineering_accessories',
  }

  const table = tableMap[type]

  const { error } = await supabase
    .from(table)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
