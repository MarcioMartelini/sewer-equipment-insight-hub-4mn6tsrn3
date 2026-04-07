export type Department =
  | 'Vendas'
  | 'Engenharia'
  | 'Compras'
  | 'Produção'
  | 'Qualidade'
  | 'Entrega'
  | 'Garantia'

export type Status =
  | 'Não iniciado'
  | 'Estacionado'
  | 'No prazo'
  | 'Em risco'
  | 'Atrasado'
  | 'Concluído'

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
}
