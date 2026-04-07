import { supabase } from '@/lib/supabase/client'
import { WorkOrder, Department, Status } from '@/types/work-order'

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching WOs:', error)
    return []
  }

  return (data || []).map((wo) => {
    let daysOverdue = 0
    if (wo.due_date) {
      const due = new Date(wo.due_date)
      const today = new Date()
      due.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      const diffTime = today.getTime() - due.getTime()
      daysOverdue = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0
    }

    return {
      id: wo.wo_number,
      customer: wo.customer_name,
      productType: wo.product_type || 'N/A',
      department: (wo.department as Department) || 'Sales',
      status: (wo.status as Status) || 'Not started',
      dueDate: wo.due_date || new Date().toISOString().split('T')[0],
      progress: wo.progress || 0,
      daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
    }
  })
}
