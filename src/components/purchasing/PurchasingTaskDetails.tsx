import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Calendar, DollarSign, Package } from 'lucide-react'

const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

export function PurchasingTaskDetails({ task, onClose, onUpdate }: any) {
  if (!task) return null

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col p-6">
        <SheetHeader className="pb-4 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl leading-tight">{task.component_name}</SheetTitle>
            <Badge variant="outline" className="whitespace-nowrap">
              {formatStatus(task.status)}
            </Badge>
          </div>
          <SheetDescription className="text-base">
            Work Order: {task.work_orders?.wo_number || '-'}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 py-4 pr-4 -mr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <Package className="h-4 w-4" /> Supplier
                </div>
                <div className="font-medium">{task.supplier || 'Not specified'}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <User className="h-4 w-4" /> Assigned To
                </div>
                <div className="font-medium">{task.users?.full_name || 'Unassigned'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <DollarSign className="h-4 w-4" /> Unit Price
                </div>
                <div className="font-medium">
                  {task.unit_price ? `$${task.unit_price.toFixed(2)}` : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <Package className="h-4 w-4" /> Quantity
                </div>
                <div className="font-medium">{task.quantity || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <DollarSign className="h-4 w-4" /> Total Price
                </div>
                <div className="font-medium">
                  {task.total_price ? `$${task.total_price.toFixed(2)}` : '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <Calendar className="h-4 w-4" /> Start Date
                </div>
                <div className="font-medium">{formatDate(task.start_date)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                  <Calendar className="h-4 w-4" /> Finish Date
                </div>
                <div className="font-medium">{formatDate(task.finish_date)}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-sm font-medium text-muted-foreground">Description / Notes</div>
              <div className="text-sm bg-muted/40 p-4 rounded-lg border text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {task.comments || 'No description provided.'}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
