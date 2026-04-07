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
  if (department && department !== 'Todos') {
    query = query.eq('department', department)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MetricDefinition[]
}

export const getMetricsTracking = async (department?: string) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const formattedDate = sevenDaysAgo.toISOString().split('T')[0]

  let query = supabase
    .from('metrics_tracking')
    .select('*')
    .gte('recorded_date', formattedDate)
    .order('recorded_date', { ascending: true })

  if (department && department !== 'Todos') {
    query = query.eq('department', department)
  }
  const { data, error } = await query
  if (error) throw error
  return data as MetricTracking[]
}

export const getActiveAlerts = async () => {
  const { data, error } = await supabase
    .from('alerts_log')
    .select(`
      id, alert_rule_id, wo_id, metric_value, alert_message, alert_status, assigned_to, created_at, resolved_at,
      users!alerts_log_assigned_to_fkey(full_name),
      work_orders!alerts_log_wo_id_fkey(wo_number),
      alert_rules(
        metrics_definitions(metric_name)
      )
    `)
    .eq('alert_status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as any[]
}

export const acknowledgeAlert = async (id: string) => {
  const { error } = await supabase
    .from('alerts_log')
    .update({ alert_status: 'acknowledged' })
    .eq('id', id)
  if (error) throw error
}
