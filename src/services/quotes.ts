import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Quote = Database['public']['Tables']['quotes']['Row']

export async function fetchQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createQuote(quote: {
  customer_name: string
  product_type: string
  quote_value: number
  profit_margin_percentage: number
  expiration_date: string
}) {
  const quote_number = `Q-${Math.floor(1000 + Math.random() * 9000)}`

  const { data, error } = await supabase
    .from('quotes')
    .insert([
      {
        ...quote,
        quote_number,
        status: 'draft',
        sent_date: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function approveQuote(quote: Quote) {
  const { error: quoteError } = await supabase
    .from('quotes')
    .update({
      status: 'approved',
      approval_date: new Date().toISOString(),
    })
    .eq('id', quote.id)

  if (quoteError) throw quoteError

  const wo_number = `WO-${Math.floor(10000 + Math.random() * 90000)}`

  const dueDate = quote.expiration_date
    ? new Date(quote.expiration_date).toISOString().split('T')[0]
    : null

  const { error: woError } = await supabase.from('work_orders').insert([
    {
      wo_number,
      customer_name: quote.customer_name,
      product_type: quote.product_type,
      status: 'Not started',
      department: 'Sales',
      quote_id: quote.id,
      progress: 0,
      due_date: dueDate,
    },
  ])

  if (woError) throw woError
}
