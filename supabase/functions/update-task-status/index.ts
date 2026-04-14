import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const twoDaysFromNow = new Date(now)
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    const inTwoDays = twoDaysFromNow.toISOString().split('T')[0]

    // Rule 1: If finish_date has passed and status is not 'complete' -> change to 'delayed'
    const { data: delayedWo, error: e1 } = await supabase.from('wo_tasks').update({ status: 'delayed', was_delayed: true }).lt('finish_date', today).neq('status', 'complete').neq('status', 'delayed').select('id')
    if (e1) throw e1

    const { data: delayedProd, error: e2 } = await supabase.from('production_tasks').update({ status: 'delayed' }).lt('finish_date', today).neq('status', 'complete').neq('status', 'delayed').select('id')
    if (e2) throw e2

    const { data: delayedPurch, error: e3 } = await supabase.from('purchasing_tasks').update({ status: 'delayed' }).lt('finish_date', today).neq('status', 'complete').neq('status', 'delayed').select('id')
    if (e3) throw e3

    // Rule 2: If finish_date is within 2 days and status is 'not_started' -> change to 'at_risk'
    const { data: atRiskWo, error: e4 } = await supabase.from('wo_tasks').update({ status: 'at_risk' }).gte('finish_date', today).lte('finish_date', inTwoDays).eq('status', 'not_started').select('id')
    if (e4) throw e4

    const { data: atRiskProd, error: e5 } = await supabase.from('production_tasks').update({ status: 'at_risk' }).gte('finish_date', today).lte('finish_date', inTwoDays).eq('status', 'not_started').select('id')
    if (e5) throw e5

    const { data: atRiskPurch, error: e6 } = await supabase.from('purchasing_tasks').update({ status: 'at_risk' }).gte('finish_date', today).lte('finish_date', inTwoDays).eq('status', 'not_started').select('id')
    if (e6) throw e6

    // Rule 3: If task is 'parked' for more than 3 days, notify assigned user
    const threeDaysAgo = new Date(now)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const parkedDateStr = threeDaysAgo.toISOString()

    const getParked = async (table: string, type: string) => {
      const { data, error } = await supabase.from(table).select('id, assigned_to, task_name').eq('status', 'parked').lt('updated_at', parkedDateStr).not('assigned_to', 'is', null)
      if (error) throw error
      return (data || []).map(t => ({ ...t, type }))
    }

    const parkedWo = await getParked('wo_tasks', 'wo_tasks')
    const parkedProd = await getParked('production_tasks', 'production_tasks')
    
    // For purchasing tasks, the field is component_name
    const { data: parkedPurchRaw, error: e7 } = await supabase.from('purchasing_tasks').select('id, assigned_to, component_name').eq('status', 'parked').lt('updated_at', parkedDateStr).not('assigned_to', 'is', null)
    if (e7) throw e7
    const parkedPurch = (parkedPurchRaw || []).map(t => ({ ...t, type: 'purchasing_tasks', task_name: t.component_name }))

    let parkedNotificationsCount = 0
    const allParkedTasks = [...parkedWo, ...parkedProd, ...parkedPurch]

    if (allParkedTasks.length > 0) {
      const taskIds = allParkedTasks.map((t) => t.id)
      const { data: existingNotifs } = await supabase.from('notifications').select('related_entity_id').in('related_entity_id', taskIds).like('message', '%Parked por mais de 3 dias%')

      const notifiedTaskIds = new Set(existingNotifs?.map((n) => n.related_entity_id) || [])
      const notificationsToInsert = allParkedTasks.filter((t) => !notifiedTaskIds.has(t.id)).map((t) => ({
        user_id: t.assigned_to,
        type: 'System',
        message: `A tarefa "${t.task_name}" está em status Parked por mais de 3 dias.`,
        related_entity_id: t.id,
        related_entity_type: t.type,
        is_read: false,
      }))

      if (notificationsToInsert.length > 0) {
        const { error: notifyError } = await supabase.from('notifications').insert(notificationsToInsert)
        if (notifyError) throw notifyError
        parkedNotificationsCount = notificationsToInsert.length
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Tasks updated successfully',
        delayedCount: (delayedWo?.length || 0) + (delayedProd?.length || 0) + (delayedPurch?.length || 0),
        atRiskCount: (atRiskWo?.length || 0) + (atRiskProd?.length || 0) + (atRiskPurch?.length || 0),
        parkedNotificationsCount,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
