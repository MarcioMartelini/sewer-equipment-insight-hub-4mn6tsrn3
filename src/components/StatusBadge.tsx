import { Badge } from '@/components/ui/badge'
import { Status } from '@/types/work-order'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<Status, string> = {
    'Não iniciado': 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
    Estacionado: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    'No prazo': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'Em risco': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    Atrasado: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    Concluído: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium shadow-sm transition-colors', statusStyles[status], className)}
    >
      {status}
    </Badge>
  )
}
