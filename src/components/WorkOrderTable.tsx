import { WorkOrder } from '@/types/work-order'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface WorkOrderTableProps {
  data: WorkOrder[]
}

export function WorkOrderTable({ data }: WorkOrderTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
        <p className="text-slate-500">
          Nenhuma Work Order encontrada para os filtros selecionados.
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-fade-in">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px] font-semibold text-slate-700">WO ID</TableHead>
            <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-slate-700">
              Tipo de Produto
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Status Geral</TableHead>
            <TableHead className="font-semibold text-slate-700">Prazo</TableHead>
            <TableHead className="hidden sm:table-cell w-[200px] font-semibold text-slate-700">
              Progresso %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((wo) => (
            <TableRow key={wo.id} className="group hover:bg-slate-50/50 transition-colors">
              <TableCell className="font-semibold text-slate-900">{wo.id}</TableCell>
              <TableCell className="font-medium text-slate-700">{wo.customer}</TableCell>
              <TableCell className="hidden md:table-cell text-slate-500">
                {wo.productType}
              </TableCell>
              <TableCell>
                <StatusBadge status={wo.status} />
              </TableCell>
              <TableCell className="text-slate-600 font-medium">{formatDate(wo.dueDate)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-3">
                  <Progress
                    value={wo.progress}
                    className="h-2 flex-1 bg-slate-100"
                    indicatorClassName={cn(
                      'bg-indigo-500',
                      wo.progress === 100 && 'bg-emerald-500',
                      wo.status === 'Delayed' && 'bg-red-500',
                    )}
                  />
                  <span className="text-xs font-medium text-slate-500 w-8">{wo.progress}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
