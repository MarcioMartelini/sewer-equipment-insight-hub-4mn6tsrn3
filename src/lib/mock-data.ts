import { WorkOrder } from '@/types/work-order'

const today = new Date()
const addDays = (days: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO-1042',
    customer: 'Indústrias Apex S.A.',
    productType: 'Motor Industrial X-200',
    department: 'Produção',
    status: 'No prazo',
    dueDate: addDays(5),
    progress: 45,
  },
  {
    id: 'WO-1043',
    customer: 'Construtora Horizonte',
    productType: 'Guindaste Articulado',
    department: 'Engenharia',
    status: 'Em risco',
    dueDate: addDays(2),
    progress: 15,
  },
  {
    id: 'WO-1044',
    customer: 'Logística Global Ltda',
    productType: 'Empilhadeira Elétrica',
    department: 'Vendas',
    status: 'Não iniciado',
    dueDate: addDays(15),
    progress: 0,
  },
  {
    id: 'WO-1045',
    customer: 'Agropecuária Vale Verde',
    productType: 'Trator Série T',
    department: 'Qualidade',
    status: 'Atrasado',
    dueDate: addDays(-3),
    progress: 90,
    daysOverdue: 3,
  },
  {
    id: 'WO-1046',
    customer: 'Mineração Pedra Dura',
    productType: 'Escavadeira Pesada',
    department: 'Entrega',
    status: 'No prazo',
    dueDate: addDays(1),
    progress: 98,
  },
  {
    id: 'WO-1047',
    customer: 'Energia Limpa S.A.',
    productType: 'Turbina Eólica',
    department: 'Compras',
    status: 'Estacionado',
    dueDate: addDays(10),
    progress: 30,
  },
  {
    id: 'WO-1048',
    customer: 'Varejo Central',
    productType: 'Esteira Transportadora',
    department: 'Garantia',
    status: 'Concluído',
    dueDate: addDays(-10),
    progress: 100,
  },
  {
    id: 'WO-1049',
    customer: 'Siderúrgica Ferro Forte',
    productType: 'Forno Industrial',
    department: 'Engenharia',
    status: 'No prazo',
    dueDate: addDays(8),
    progress: 25,
  },
  {
    id: 'WO-1050',
    customer: 'Indústrias Apex S.A.',
    productType: 'Peças de Reposição',
    department: 'Produção',
    status: 'Atrasado',
    dueDate: addDays(-1),
    progress: 60,
    daysOverdue: 1,
  },
  {
    id: 'WO-1051',
    customer: 'Construtora Horizonte',
    productType: 'Betoneira Móvel',
    department: 'Produção',
    status: 'Em risco',
    dueDate: addDays(3),
    progress: 50,
  },
]
