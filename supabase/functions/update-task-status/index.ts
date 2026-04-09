import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
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

    // Create a Supabase client with the Service Role key to bypass RLS
    // This is required because this function will be triggered by a background cron job
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    const now = new Date()
    const today = now.toISOString().split('T')[0] // Format: YYYY-MM-DD

    // Calculate date for 2 days from now
    const twoDaysFromNow = new Date(now)
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    const inTwoDays = twoDaysFromNow.toISOString().split('T')[0]

    // Rule 1: If finish_date has passed and status is not 'complete' -> change to 'delayed'
    const { data: delayedTasks, error: delayedError } = await supabase
      .from('wo_tasks')
      .update({ status: 'delayed', was_delayed: true })
      .lt('finish_date', today)
      .neq('status', 'complete')
      .neq('status', 'delayed') // Avoid updating already delayed tasks
      .select('id')

    if (delayedError) {
      console.error('Error updating delayed tasks:', delayedError)
      throw delayedError
    }

    // Rule 2: If finish_date is within 2 days and status is 'not_started' -> change to 'at_risk'
    const { data: atRiskTasks, error: atRiskError } = await supabase
      .from('wo_tasks')
      .update({ status: 'at_risk' })
      .gte('finish_date', today)
      .lte('finish_date', inTwoDays)
      .eq('status', 'not_started')
      .select('id')

    if (atRiskError) {
      console.error('Error updating at_risk tasks:', atRiskError)
      throw atRiskError
    }

    // Rule 3: If task is 'parked' for more than 3 days, notify assigned user
    const threeDaysAgo = new Date(now)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const parkedDateStr = threeDaysAgo.toISOString()

    const { data: parkedTasks, error: parkedError } = await supabase
      .from('wo_tasks')
      .select('id, assigned_to, task_name')
      .eq('status', 'parked')
      .lt('updated_at', parkedDateStr)
      .not('assigned_to', 'is', null)

    if (parkedError) {
      console.error('Error fetching parked tasks:', parkedError)
      throw parkedError
    }

    let parkedNotificationsCount = 0
    if (parkedTasks && parkedTasks.length > 0) {
      const taskIds = parkedTasks.map((t) => t.id)
      const { data: existingNotifs } = await supabase
        .from('notifications')
        .select('related_entity_id')
        .in('related_entity_id', taskIds)
        .like('message', '%Parked por mais de 3 dias%')

      const notifiedTaskIds = new Set(existingNotifs?.map((n) => n.related_entity_id) || [])

      const notificationsToInsert = parkedTasks
        .filter((task) => !notifiedTaskIds.has(task.id))
        .map((task) => ({
          user_id: task.assigned_to,
          type: 'System',
          message: `A tarefa "${task.task_name}" está em status Parked por mais de 3 dias.`,
          related_entity_id: task.id,
          related_entity_type: 'wo_tasks',
          is_read: false,
        }))

      if (notificationsToInsert.length > 0) {
        const { error: notifyError } = await supabase
          .from('notifications')
          .insert(notificationsToInsert)

        if (notifyError) {
          console.error('Error inserting parked notifications:', notifyError)
          throw notifyError
        }
        parkedNotificationsCount = notificationsToInsert.length
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Tasks updated successfully',
        delayedCount: delayedTasks?.length || 0,
        atRiskCount: atRiskTasks?.length || 0,
        parkedNotificationsCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
