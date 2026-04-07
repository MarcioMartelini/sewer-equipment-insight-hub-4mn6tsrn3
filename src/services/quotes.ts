import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Quote = Database['public']['Tables']['quotes']['Row'] & {
  salesperson?: string
  product_family?: string
  machine_model?: string
  special_custom?: string
  truck_information?: string
  truck_supplier?: string
  wo_number_ref?: string
  expected_completion_date?: string
  actual_completion_date?: string
  date_order?: string
  customer_city?: string
  customer_state?: string
}

export async function fetchQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createQuote(quote: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user_id = session?.user?.id

  const { data, error } = await supabase
    .from('quotes')
    .insert([
      {
        ...quote,
        status: 'draft',
        sent_date: new Date().toISOString(),
        created_by: user_id || null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateQuote(id: string, quote: any) {
  const { data, error } = await supabase.from('quotes').update(quote).eq('id', id).select().single()

  if (error) throw error
  return data
}

export async function deleteQuote(id: string) {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function fetchQuoteById(id: string) {
  const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single()

  if (error) throw error
  return data as Quote
}

export async function fetchQuoteHistory(quoteId: string) {
  const { data, error } = await supabase
    .from('quote_history' as any)
    .select('*, user:users(full_name)')
    .eq('quote_id', quoteId)
    .order('changed_at', { ascending: false })

  if (error) throw error
  return data
}

export async function convertToWorkOrder(quoteId: string, woNumber: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user_id = session?.user?.id

  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  if (fetchError) throw fetchError

  const { error: woError } = await supabase.from('work_orders').insert([
    {
      wo_number: woNumber,
      customer_name: quote.customer_name,
      product_type: quote.product_family || quote.product_type,
      machine_model: quote.machine_model,
      price: quote.quote_value,
      profit_margin: quote.profit_margin_percentage,
      due_date: quote.expected_completion_date,
      quote_id: quote.id,
      status: 'Not started',
      department: 'Production',
      progress: 0,
      created_by: user_id || null,
    },
  ] as any)

  if (woError) throw woError

  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      status: 'converted',
      date_order: new Date().toISOString(),
      wo_number_ref: woNumber,
    })
    .eq('id', quoteId)

  if (updateError) throw updateError
}

export async function approveQuote(quote: Quote) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user_id = session?.user?.id

  const { error: quoteError } = await supabase
    .from('quotes')
    .update({
      status: 'approved',
      approval_date: new Date().toISOString(),
      date_order: new Date().toISOString(),
    })
    .eq('id', quote.id)

  if (quoteError) throw quoteError

  const wo_number = quote.wo_number_ref || `WO-${Math.floor(10000 + Math.random() * 90000)}`

  const dueDate = quote.expected_completion_date
    ? new Date(quote.expected_completion_date).toISOString().split('T')[0]
    : quote.expiration_date
      ? new Date(quote.expiration_date).toISOString().split('T')[0]
      : null

  const { error: woError } = await supabase.from('work_orders').insert([
    {
      wo_number,
      customer_name: quote.customer_name,
      product_type: quote.product_family || quote.product_type,
      status: 'Not started',
      department: 'Sales',
      quote_id: quote.id,
      progress: 0,
      due_date: dueDate,
      created_by: user_id || null,
    },
  ])

  if (woError) throw woError
}
