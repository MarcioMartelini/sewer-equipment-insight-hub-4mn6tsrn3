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

export const getMetricsTracking = async (department?: string, period: string = '7d') => {
  const endDate = new Date()
  let startDate = new Date()

  switch (period) {
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    case 'ytd':
      startDate = new Date(endDate.getFullYear(), 0, 1)
      break
    case '7d':
    default:
      startDate.setDate(startDate.getDate() - 7)
      break
  }

  const formattedStartDate = startDate.toISOString().split('T')[0]

  // Add 1 day to end date to ensure we include records from today completely
  const nextDay = new Date(endDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const formattedEndDate = nextDay.toISOString().split('T')[0]

  let query = supabase
    .from('metrics_tracking')
    .select('*')
    .gte('recorded_date', formattedStartDate)
    .lt('recorded_date', formattedEndDate)
    .order('recorded_date', { ascending: true })

  if (department && department !== 'Todos' && department !== 'All') {
    query = query.eq('department', department)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MetricTracking[]
}
