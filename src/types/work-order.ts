export type Department =
  | 'Sales'
  | 'Engineering'
  | 'Purchasing'
  | 'Production'
  | 'Quality'
  | 'Delivery'
  | 'Warranty'
  | 'High Management'

export type Status =
  | 'Not started'
  | 'Parked'
  | 'On track'
  | 'At risk'
  | 'Delayed'
  | 'Complete'
  | 'N/A'

export type PrazoFilter = 'Todos' | 'Atrasado' | 'Esta semana' | 'Próxima semana' | 'Futuro'

export interface WorkOrder {
  id: string
  customer: string
  productType: string
  department: Department
  status: Status
  dueDate: string // ISO string YYYY-MM-DD
  progress: number // 0 to 100
  daysOverdue?: number
  quoteId?: string
  quoteNumber?: string
}
