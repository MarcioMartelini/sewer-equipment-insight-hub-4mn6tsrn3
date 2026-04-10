import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function ExpediteDetailsModal({
  item,
  history,
  onClose,
}: {
  item: any
  history: any[]
  onClose: () => void
}) {
  if (!item) return null
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expedite Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground">WO Number</p>
            <p className="font-medium">{item.work_orders?.wo_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Component Name</p>
            <p className="font-medium">
              {item.purchasing_tasks?.component_name || item.component_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Supplier</p>
            <p className="font-medium">{item.purchasing_tasks?.supplier || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium">{item.expedite_reason || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">
              {item.expedite_date ? format(new Date(item.expedite_date), 'PP') : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cost</p>
            <p className="font-medium">${item.expedite_cost || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Priority</p>
            <Badge variant="outline" className="mt-1 uppercase">
              {item.priority || 'None'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant="outline" className="mt-1 uppercase">
              {item.status}
            </Badge>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Audit History (Related Task)</h4>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history found for this task.</p>
          ) : (
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="text-sm border-l-2 pl-4 border-muted">
                  <p className="font-medium">{h.users?.full_name || 'System'}</p>
                  <p className="text-muted-foreground">
                    Changed <span className="font-semibold">{h.field_changed}</span> from "
                    {h.old_value || 'empty'}" to "{h.new_value || 'empty'}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(h.changed_at), 'PP p')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
