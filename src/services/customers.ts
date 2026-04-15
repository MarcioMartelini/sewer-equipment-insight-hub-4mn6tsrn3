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
  salesperson_id: string | null
  total_wos: number
  last_wo_date: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export const fetchCustomerById = async (id: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Customer
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Customer[]
}

export const createCustomer = async (customer: Partial<Customer>) => {
  const dataToInsert = { ...customer }
  if (!dataToInsert.customer_id) {
    delete dataToInsert.customer_id
  }
  const { data, error } = await supabase.from('customers').insert([dataToInsert]).select().single()

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

export const deleteCustomer = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('customers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  await supabase.from('customer_history').insert({
    customer_id: id,
    user_id: userId,
    field_changed: 'status',
    action: 'Deleted',
    notes: 'Cliente deletado',
  })
}
