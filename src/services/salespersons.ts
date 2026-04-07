import { supabase } from '@/lib/supabase/client'

export interface Salesperson {
  id: string
  salesperson_id: string
  name: string
  email: string | null
  phone: string | null
  department: string | null
  region: string | null
  total_wos: number
  total_revenue: number
  commission_rate: number
  status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function fetchSalespersons() {
  const { data, error } = await supabase
    .from('salespersons')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Salesperson[]
}

export async function fetchSalespersonById(id: string) {
  const { data, error } = await supabase
    .from('salespersons')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Salesperson
}

export async function createSalesperson(sp: Partial<Salesperson>) {
  const { data, error } = await supabase.from('salespersons').insert([sp]).select().single()

  if (error) throw error
  return data as Salesperson
}

export async function updateSalesperson(id: string, sp: Partial<Salesperson>) {
  const { data, error } = await supabase
    .from('salespersons')
    .update({ ...sp, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Salesperson
}

export async function deleteSalesperson(id: string) {
  const { error } = await supabase
    .from('salespersons')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export interface SalespersonHistory {
  id: string
  salesperson_id: string
  user_id: string | null
  field_changed: string
  old_value: string | null
  new_value: string | null
  action: string | null
  notes: string | null
  changed_at: string
  users?: {
    full_name: string
    email: string
  } | null
}

export async function fetchSalespersonHistory(id: string) {
  const { data, error } = await supabase
    .from('salesperson_history' as any)
    .select('*')
    .eq('salesperson_id', id)
    .order('changed_at', { ascending: false })

  if (error) throw error

  const userIds = Array.from(new Set(data.map((h: any) => h.user_id).filter(Boolean))) as string[]

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds)

    if (users) {
      const userMap = new Map(users.map((u) => [u.id, u]))
      return data.map((h: any) => ({
        ...h,
        users: userMap.get(h.user_id) || null,
      })) as SalespersonHistory[]
    }
  }

  return data as SalespersonHistory[]
}

export async function fetchWorkOrdersBySalesperson(salespersonName: string, salespersonId: string) {
  const [quotesByName, quotesById] = await Promise.all([
    supabase.from('quotes').select('id').eq('salesperson', salespersonName),
    supabase.from('quotes').select('id').eq('salesperson', salespersonId),
  ])

  const quoteIds = Array.from(
    new Set([...(quotesByName.data || []), ...(quotesById.data || [])].map((q) => q.id)),
  )

  if (quoteIds.length === 0) return []

  const { data: wos, error: wosError } = await supabase
    .from('work_orders')
    .select('*, quotes(product_family)')
    .in('quote_id', quoteIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (wosError) throw wosError
  return wos
}
