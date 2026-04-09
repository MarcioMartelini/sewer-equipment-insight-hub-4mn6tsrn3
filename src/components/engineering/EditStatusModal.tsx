import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface TaskBase {
  id: string
  task_name: string
  status: string
  wo_number: string
  department?: string | null
  sub_department?: string | null
  customer_name?: string | null
  machine_model?: string | null
  product_type?: string | null
  start_date?: string | null
  finish_date?: string | null
  comments?: string | null
}

interface EditStatusModalProps {
  task: TaskBase | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, status: string, comment?: string) => Promise<void>
}

export function EditStatusModal({ task, isOpen, onClose, onSave }: EditStatusModalProps) {
  const [status, setStatus] = useState<string>('')
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (task) {
      let s = task.status.toLowerCase()
      if (s === 'pending' || s === 'not started') s = 'not_started'
      if (s === 'completed') s = 'complete'
      if (s === 'on track') s = 'on_track'
      if (s === 'at risk') s = 'at_risk'
      setStatus(s)
      setComment('')
    }
  }, [task, isOpen])

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return
    setStatus(newStatus)
    setIsSaving(true)
    await onSave(task.id, newStatus)
    setIsSaving(false)
  }

  const handleAddComment = async () => {
    if (!task || !comment.trim()) return
    setIsSaving(true)
    await onSave(task.id, status, comment.trim())
    setComment('')
    setIsSaving(false)
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 pt-6 pb-4 bg-white border-b border-slate-200">
          <DialogTitle className="text-xl font-bold text-slate-900 flex justify-between items-start">
            <span>{task.task_name}</span>
          </DialogTitle>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-200 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-sm"></span>
              </span>
              {task.department || 'Engineering'}{' '}
              {task.sub_department ? `> ${task.sub_department}` : ''}
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium">WO Number:</span>
              <span className="text-sm font-bold text-slate-900">{task.wo_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium">Customer:</span>
              <span className="text-sm font-bold text-slate-900">{task.customer_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium">Family / Model:</span>
              <span className="text-sm font-bold text-slate-900">
                {task.product_type || '-'} / {task.machine_model || '-'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              CRONOGRAMA
            </h4>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">Start Date</p>
                <div className="flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-1.5">
                  <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                  {task.start_date ? format(new Date(task.start_date), 'MM/dd/yyyy') : '-'}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Finish Date</p>
                <div className="flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-1.5">
                  <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                  {task.finish_date ? format(new Date(task.finish_date), 'MM/dd/yyyy') : '-'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              COMENTÁRIOS
            </h4>
            <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Textarea
                placeholder="Digite seu comentário..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border-0 focus-visible:ring-0 resize-none min-h-[100px] p-4 text-sm"
              />
              <div className="bg-slate-50 border-t border-slate-100 p-2 flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSaving}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center">
          <span className="text-sm font-bold text-slate-700 mr-4">Status:</span>
          <Select value={status} onValueChange={handleStatusChange} disabled={isSaving}>
            <SelectTrigger className="w-[180px] h-9 bg-slate-50">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                  Not Started
                </div>
              </SelectItem>
              <SelectItem value="parked">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  Parked
                </div>
              </SelectItem>
              <SelectItem value="on_track">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  On Track
                </div>
              </SelectItem>
              <SelectItem value="at_risk">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  At Risk
                </div>
              </SelectItem>
              <SelectItem value="delayed">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Delayed
                </div>
              </SelectItem>
              <SelectItem value="complete">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                  Complete
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  )
}
