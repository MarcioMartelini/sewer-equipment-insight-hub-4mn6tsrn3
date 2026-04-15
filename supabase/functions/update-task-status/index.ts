import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)',
      )
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
    const { data: delayedWo, error: e1 } = await supabase
      .from('wo_tasks')
      .update({ status: 'delayed', was_delayed: true })
      .lt('finish_date', today)
      .neq('status', 'complete')
      .neq('status', 'delayed')
      .select('id')
    if (e1) throw e1

    const { data: delayedProd, error: e2 } = await supabase
      .from('production_tasks')
      .update({ status: 'delayed' })
      .lt('finish_date', today)
      .neq('status', 'complete')
      .neq('status', 'delayed')
      .select('id')
    if (e2) throw e2

    const { data: delayedPurch, error: e3 } = await supabase
      .from('purchasing_tasks')
      .update({ status: 'delayed' })
      .lt('finish_date', today)
      .neq('status', 'complete')
      .neq('status', 'delayed')
      .select('id')
    if (e3) throw e3

    // Rule 2: If finish_date is within 2 days and status is 'not_started' -> change to 'at_risk'
    const { data: atRiskWo, error: e4 } = await supabase
      .from('wo_tasks')
      .update({ status: 'at_risk' })
      .gte('finish_date', today)
      .lte('finish_date', inTwoDays)
      .eq('status', 'not_started')
      .select('id')
    if (e4) throw e4

    const { data: atRiskProd, error: e5 } = await supabase
      .from('production_tasks')
      .update({ status: 'at_risk' })
      .gte('finish_date', today)
      .lte('finish_date', inTwoDays)
      .eq('status', 'not_started')
      .select('id')
    if (e5) throw e5

    const { data: atRiskPurch, error: e6 } = await supabase
      .from('purchasing_tasks')
      .update({ status: 'at_risk' })
      .gte('finish_date', today)
      .lte('finish_date', inTwoDays)
      .eq('status', 'not_started')
      .select('id')
    if (e6) throw e6

    // Rule 3: If task is 'parked' for more than 3 days, notify assigned user
    const threeDaysAgo = new Date(now)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const parkedDateStr = threeDaysAgo.toISOString()

    const getParked = async (table: string, type: string) => {
      const { data, error } = await supabase
        .from(table)
        .select('id, assigned_to, task_name')
        .eq('status', 'parked')
        .lt('updated_at', parkedDateStr)
        .not('assigned_to', 'is', null)
      if (error) throw error
      return (data || []).map((t) => ({ ...t, type }))
    }

    const parkedWo = await getParked('wo_tasks', 'wo_tasks')
    const parkedProd = await getParked('production_tasks', 'production_tasks')

    const { data: parkedPurchRaw, error: e7 } = await supabase
      .from('purchasing_tasks')
      .select('id, assigned_to, component_name')
      .eq('status', 'parked')
      .lt('updated_at', parkedDateStr)
      .not('assigned_to', 'is', null)
    if (e7) throw e7
    const parkedPurch = (parkedPurchRaw || []).map((t) => ({
      ...t,
      type: 'purchasing_tasks',
      task_name: t.component_name,
    }))

    let parkedNotificationsCount = 0
    const allParkedTasks = [...parkedWo, ...parkedProd, ...parkedPurch]

    if (allParkedTasks.length > 0) {
      const taskIds = allParkedTasks.map((t) => t.id)
      const { data: existingNotifs } = await supabase
        .from('notifications')
        .select('related_entity_id')
        .in('related_entity_id', taskIds)
        .like('message', '%Parked for more than 3 days%')

      const notifiedTaskIds = new Set(existingNotifs?.map((n) => n.related_entity_id) || [])
      const notificationsToInsert = allParkedTasks
        .filter((t) => !notifiedTaskIds.has(t.id))
        .map((t) => ({
          user_id: t.assigned_to,
          type: 'System',
          message: `The task "${t.task_name}" has been in Parked status for more than 3 days.`,
          related_entity_id: t.id,
          related_entity_type: t.type,
          is_read: false,
        }))
      if (notificationsToInsert.length > 0) {
        const { error: notifyError } = await supabase
          .from('notifications')
          .insert(notificationsToInsert)
        if (notifyError) throw notifyError
        parkedNotificationsCount = notificationsToInsert.length
      }
    }

    // Rule 4: Critical Delay Notification (> 5 days)
    const fiveDaysAgo = new Date(now)
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0]

    const criticalWoRaw = await supabase
      .from('wo_tasks')
      .select('id, assigned_to, task_name, department')
      .lt('finish_date', fiveDaysAgoStr)
      .neq('status', 'complete')
    const criticalWo = (criticalWoRaw.data || []).map((t) => ({ ...t, type: 'wo_tasks' }))

    const criticalProdRaw = await supabase
      .from('production_tasks')
      .select('id, assigned_to, task_name, department, sub_department')
      .lt('finish_date', fiveDaysAgoStr)
      .neq('status', 'complete')
    const criticalProd = (criticalProdRaw.data || []).map((t) => ({
      ...t,
      type: 'production_tasks',
    }))

    const criticalPurchRaw = await supabase
      .from('purchasing_tasks')
      .select('id, assigned_to, component_name')
      .lt('finish_date', fiveDaysAgoStr)
      .neq('status', 'complete')
    const criticalPurch = (criticalPurchRaw.data || []).map((t) => ({
      ...t,
      type: 'purchasing_tasks',
      task_name: t.component_name,
      department: 'Purchasing',
      sub_department: null,
    }))

    const allCriticalTasks = [...criticalWo, ...criticalProd, ...criticalPurch]
    let criticalNotificationsCount = 0

    if (allCriticalTasks.length > 0) {
      // Fetch all users to find department managers/admins
      const { data: allUsers } = await supabase.from('users').select('id, department, role')
      const admins = allUsers?.filter((u) => u.role === 'admin') || []

      const taskIds = allCriticalTasks.map((t) => t.id)

      const { data: existingCriticalNotifs } = await supabase
        .from('notifications')
        .select('related_entity_id, user_id')
        .in('related_entity_id', taskIds)
        .like('message', '%Critically delayed%')

      const notifiedSet = new Set(
        existingCriticalNotifs?.map((n) => `${n.related_entity_id}-${n.user_id}`) || [],
      )

      const criticalNotificationsToInsert: any[] = []

      for (const t of allCriticalTasks) {
        const usersToNotify = new Set<string>()

        // Notify the assigned user
        if (t.assigned_to) {
          usersToNotify.add(t.assigned_to)
        }

        // Notify admins of that specific department (or all admins if none specific)
        const deptAdmins = admins.filter((a) => a.department === t.department)
        if (deptAdmins.length > 0) {
          deptAdmins.forEach((a) => usersToNotify.add(a.id))
        } else {
          // Fallback to all admins
          admins.forEach((a) => usersToNotify.add(a.id))
        }

        for (const userId of usersToNotify) {
          if (!notifiedSet.has(`${t.id}-${userId}`)) {
            const contextStr = [t.department, t.sub_department].filter(Boolean).join(' - ')
            const message = `Critically delayed (more than 5 days): The task "${t.task_name}" ${contextStr ? `in ${contextStr}` : ''} is significantly behind schedule.`

            criticalNotificationsToInsert.push({
              user_id: userId,
              type: 'System',
              message,
              related_entity_id: t.id,
              related_entity_type: t.type,
              is_read: false,
            })
          }
        }
      }

      if (criticalNotificationsToInsert.length > 0) {
        const { error: notifyCriticalError } = await supabase
          .from('notifications')
          .insert(criticalNotificationsToInsert)
        if (notifyCriticalError) throw notifyCriticalError
        criticalNotificationsCount = criticalNotificationsToInsert.length
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Tasks updated successfully',
        delayedCount:
          (delayedWo?.length || 0) + (delayedProd?.length || 0) + (delayedPurch?.length || 0),
        atRiskCount:
          (atRiskWo?.length || 0) + (atRiskProd?.length || 0) + (atRiskPurch?.length || 0),
        parkedNotificationsCount,
        criticalNotificationsCount,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
