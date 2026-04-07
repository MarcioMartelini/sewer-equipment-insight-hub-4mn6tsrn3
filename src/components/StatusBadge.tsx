import { Status } from '@/types/work-order'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Not started':
        return 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
      case 'Parked':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'
      case 'On track':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'
      case 'At risk':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200'
      case 'Delayed':
        return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
      case 'Complete':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium whitespace-nowrap', getStatusStyles(), className)}
    >
      {status}
    </Badge>
  )
}
