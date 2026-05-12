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
      throw new Error('Missing environment variables')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !userData.user) {
      throw new Error('Unauthorized')
    }

    // Verify if user is admin
    const { data: profile } = await supabase.from('users').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') {
      throw new Error('Forbidden: Only administrators can export the database.')
    }

    // Tables to export
    const tables = [
      'users', 
      'customers', 
      'departments', 
      'work_orders', 
      'quotes', 
      'salespersons',
      'wo_tasks', 
      'production_tasks', 
      'purchasing_tasks', 
      'engineering_tasks',
      'metrics',
      'notifications'
    ]
    
    const exportData: Record<string, any> = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        console.error(`Error exporting table ${table}:`, error)
        exportData[table] = { error: error.message }
      } else {
        exportData[table] = data
      }
    }

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
