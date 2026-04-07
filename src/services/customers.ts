import { supabase } from '@/lib/supabase/client'

export interface Customer {
  id: string
  customer_id: string
  customer_name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  status: string
  total_wos: number
  last_wo_date: string | null
  created_at: string
  updated_at: string
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Customer[]
}

export const createCustomer = async (customer: Partial<Customer>) => {
  const { data, error } = await supabase.from('customers').insert([customer]).select().single()

  if (error) throw error
  return data as Customer
}

export const updateCustomer = async (id: string, customer: Partial<Customer>) => {
  const { data, error } = await supabase
    .from('customers')
    .update({ ...customer, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Customer
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) throw error
}
