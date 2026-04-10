import { supabase } from '@/lib/supabase/client'

export interface MetricDefinition {
  id: string
  department: string
  metric_name: string
  metric_type: string
  threshold_min: number | null
  threshold_max: number | null
  unit: string
  description: string
}

export interface MetricTracking {
  id: string
  wo_id: string
  department: string
  metric_name: string
  metric_value: number
  recorded_date: string
}

export const getMetricsDefinitions = async (department?: string) => {
  let query = supabase.from('metrics_definitions').select('*')
  if (department && department !== 'Todos' && department !== 'All') {
    query = query.eq('department', department)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MetricDefinition[]
}

export const getMetricsTracking = async (department?: string, startDate?: Date, endDate?: Date) => {
  let query = supabase
    .from('metrics_tracking')
    .select('*')
    .order('recorded_date', { ascending: true })

  if (startDate) {
    query = query.gte('recorded_date', startDate.toISOString().split('T')[0])
  }

  if (endDate) {
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query.lt('recorded_date', nextDay.toISOString().split('T')[0])
  }

  if (department && department !== 'Todos' && department !== 'All') {
    query = query.eq('department', department)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MetricTracking[]
}
