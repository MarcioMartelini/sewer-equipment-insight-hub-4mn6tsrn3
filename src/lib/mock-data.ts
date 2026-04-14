import { WorkOrder } from '@/types/work-order'

const today = new Date()
const addDays = (days: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const mockWorkOrders: any[] = [
  {
    id: 'WO-1042',
    customer: 'Apex Industries Inc.',
    productType: 'Industrial Motor X-200',
    department: 'Production',
    status: 'On Track',
    dueDate: addDays(5),
    progress: 45,
  },
  {
    id: 'WO-1043',
    customer: 'Horizon Construction',
    productType: 'Articulated Crane',
    department: 'Engineering',
    status: 'At Risk',
    dueDate: addDays(2),
    progress: 15,
  },
  {
    id: 'WO-1044',
    customer: 'Global Logistics Ltd',
    productType: 'Electric Forklift',
    department: 'Sales',
    status: 'Not Started',
    dueDate: addDays(15),
    progress: 0,
  },
  {
    id: 'WO-1045',
    customer: 'Green Valley Farming',
    productType: 'T-Series Tractor',
    department: 'Quality',
    status: 'Delayed',
    dueDate: addDays(-3),
    progress: 90,
    daysOverdue: 3,
  },
  {
    id: 'WO-1046',
    customer: 'Hard Rock Mining',
    productType: 'Heavy Excavator',
    department: 'Delivery',
    status: 'On Track',
    dueDate: addDays(1),
    progress: 98,
  },
  {
    id: 'WO-1047',
    customer: 'Clean Energy Co.',
    productType: 'Wind Turbine',
    department: 'Purchasing',
    status: 'Parked',
    dueDate: addDays(10),
    progress: 30,
  },
  {
    id: 'WO-1048',
    customer: 'Central Retail',
    productType: 'Conveyor Belt',
    department: 'Warranty',
    status: 'Completed',
    dueDate: addDays(-10),
    progress: 100,
  },
  {
    id: 'WO-1049',
    customer: 'Strong Iron Steelworks',
    productType: 'Industrial Furnace',
    department: 'Engineering',
    status: 'On Track',
    dueDate: addDays(8),
    progress: 25,
  },
  {
    id: 'WO-1050',
    customer: 'Apex Industries Inc.',
    productType: 'Spare Parts',
    department: 'Production',
    status: 'Delayed',
    dueDate: addDays(-1),
    progress: 60,
    daysOverdue: 1,
  },
  {
    id: 'WO-1051',
    customer: 'Horizon Construction',
    productType: 'Mobile Concrete Mixer',
    department: 'Production',
    status: 'At Risk',
    dueDate: addDays(3),
    progress: 50,
  },
]
