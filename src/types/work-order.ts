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
  | 'not_started'
  | 'not started'
  | 'parked'
  | 'on_track'
  | 'on track'
  | 'at_risk'
  | 'at risk'
  | 'delayed'
  | 'complete'
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
  woNumber?: string
  customer: string
  productType: string
  machineModel?: string
  price?: number
  department: Department
  status: Status | string
  dueDate: string // ISO string YYYY-MM-DD
  expectedCompletionDate?: string
  createdAt?: string
  progress: number // 0 to 100
  daysOverdue?: number
  quoteId?: string
  quoteNumber?: string
}
