import { Status } from '@/types/work-order'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'not started':
      case 'not_started':
      case 'pending':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
      case 'parked':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'
      case 'on track':
      case 'on_track':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200'
      case 'at risk':
      case 'at_risk':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
      case 'delayed':
        return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
      case 'complete':
      case 'completed':
        return 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
    }
  }

  const formatStatus = (s: string) => {
    if (!s) return 'Not started'
    if (s.toLowerCase() === 'n/a') return 'N/A'
    if (s.toLowerCase() === 'pending' || s.toLowerCase() === 'not_started') return 'Not Started'
    if (s.toLowerCase() === 'on_track') return 'On Track'
    if (s.toLowerCase() === 'at_risk') return 'At Risk'
    return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium whitespace-nowrap capitalize', getStatusStyles(), className)}
    >
      {formatStatus(status as string)}
    </Badge>
  )
}
