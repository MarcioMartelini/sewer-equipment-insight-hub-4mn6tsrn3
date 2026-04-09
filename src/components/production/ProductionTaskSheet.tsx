import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { format, differenceInDays } from 'date-fns'
import {
  Loader2,
  Calendar,
  User,
  Info,
  MessageSquare,
  Send,
  Building2,
  Tag,
  Box,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  updateProductionStatus,
  ProductionType,
  ProductionTask,
  getProductionTaskComments,
  addProductionTaskComment,
} from '@/services/production'

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none',
  parked: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-none',
  on_track: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-none',
  at_risk: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none',
  delayed: 'bg-red-100 text-red-700 hover:bg-red-200 border-none',
  complete: 'bg-green-100 text-green-700 hover:bg-green-200 border-none',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  parked: 'Parked',
  on_track: 'On Track',
  at_risk: 'At Risk',
  delayed: 'Delayed',
  complete: 'Complete',
}

interface ProductionTaskSheetProps {
  task: ProductionTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
  type: ProductionType
}

export function ProductionTaskSheet({
  task,
  open,
  onOpenChange,
  onUpdate,
  type,
}: ProductionTaskSheetProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    newStatus: string
  } | null>(null)
  const [statusComment, setStatusComment] = useState('')

  useEffect(() => {
    if (open && task) {
      loadComments()
    } else {
      setComments([])
      setNewComment('')
    }
  }, [open, task?.id])

  const loadComments = async () => {
    if (!task) return
    setLoadingComments(true)
    try {
      const data = await getProductionTaskComments(task.id)
      setComments(data)
    } catch (error: any) {
      toast({ title: 'Error loading comments', description: error.message, variant: 'destructive' })
    } finally {
      setLoadingComments(false)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (!task) return
    if (newStatus === task.status) return

    if (newStatus === 'parked' || newStatus === 'at_risk') {
      setConfirmModal({ isOpen: true, newStatus })
      setStatusComment('')
    } else {
      executeStatusUpdate(newStatus)
    }
  }

  const executeStatusUpdate = async (newStatus: string, comment?: string) => {
    if (!task) return
    setSubmitting(true)
    try {
      await updateProductionStatus(type, task.id, newStatus, comment)
      toast({ title: 'Status updated' })
      onUpdate()
      if (open) loadComments()
    } catch (error: any) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmStatusChange = () => {
    if (confirmModal) {
      executeStatusUpdate(confirmModal.newStatus, statusComment)
      setConfirmModal(null)
    }
  }

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return
    setSubmitting(true)
    try {
      await addProductionTaskComment(task.id, newComment, task.status)
      setNewComment('')
      await loadComments()
      toast({ title: 'Comment added' })
    } catch (error: any) {
      toast({ title: 'Error adding comment', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const getDateColor = (dateStr?: string | null) => {
    if (!dateStr || task?.status === 'complete') return 'text-slate-600'
    const date = new Date(dateStr)
    const diff = differenceInDays(date, new Date())
    if (diff < 0) return 'text-red-600 font-semibold'
    if (diff <= 2) return 'text-amber-600 font-semibold'
    return 'text-emerald-600 font-semibold'
  }

  if (!task) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between mt-6 sm:mt-0">
              <SheetTitle className="text-xl font-bold">Task Details</SheetTitle>
              <Badge className={STATUS_COLORS[task.status] || 'bg-slate-100'}>
                {STATUS_LABELS[task.status] || task.status}
              </Badge>
            </div>
            <SheetDescription className="text-sm text-slate-500">
              {task.task_name} - {task.wo_number}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                WO Information
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">WO Number</span>
                    <span className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-indigo-500" />
                      {task.wo_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Customer</span>
                    <span className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      {task.customer_name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Product Family</span>
                    <span className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-emerald-500" />
                      {task.product_type || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Machine Model</span>
                    <span className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                      <Box className="h-4 w-4 text-purple-500" />
                      {task.machine_model || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Task Details
              </h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Task Name</span>
                  <span className="font-medium text-slate-900">{task.task_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Department</span>
                    <span className="text-sm font-medium text-slate-700">
                      {task.department || 'Production'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Sub-Department</span>
                    <Badge
                      variant="secondary"
                      className="font-medium text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border-none"
                    >
                      {task.sub_department || 'General'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-500 block mb-1">Assigned To</span>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      {task.assigned_to_name || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Scheduled Dates
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Start Date
                  </span>
                  <span
                    className={`text-sm font-medium ${task.start_date ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                    {task.start_date
                      ? format(new Date(task.start_date), 'MMM dd, yyyy')
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Finish Date
                  </span>
                  <span className={`text-sm ${getDateColor(task.finish_date)}`}>
                    {task.finish_date
                      ? format(new Date(task.finish_date), 'MMM dd, yyyy')
                      : 'Not set'}
                  </span>
                </div>
                {task.is_completed && task.completion_date && (
                  <div className="col-span-2 pt-3 border-t border-slate-200 mt-1">
                    <span className="text-xs text-emerald-600 font-bold block mb-1 uppercase tracking-wider">
                      Completion Date
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {format(new Date(task.completion_date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Status
              </h3>
              <Select value={task.status} onValueChange={handleStatusChange} disabled={submitting}>
                <SelectTrigger className="w-full h-11 bg-white border-slate-200 shadow-sm">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      <div className="flex items-center gap-2 font-medium">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[val].split(' ')[0]}`}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" /> Comments History
              </h3>

              <div className="space-y-3">
                <Textarea
                  placeholder="Add a new comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none bg-white border-slate-200 shadow-sm focus-visible:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {loadingComments ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
                    <p className="text-sm text-slate-500 font-medium">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl text-sm space-y-2 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-100" />
                      <div className="flex items-center justify-between pl-2">
                        <span className="font-semibold text-slate-900">{comment.author_name}</span>
                        <span className="text-xs font-medium text-slate-400">
                          {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-slate-600 pl-2 leading-relaxed whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                      {comment.status && comment.status !== 'not_started' && (
                        <div className="mt-3 pl-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0.5 px-2 bg-slate-100 text-slate-600 border-none font-semibold"
                          >
                            Status changed to: {STATUS_LABELS[comment.status] || comment.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={confirmModal?.isOpen || false}
        onOpenChange={(open) => !open && setConfirmModal(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Justification Required</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Please provide a reason for changing the status to{' '}
              <strong className="text-slate-900 font-bold">
                {confirmModal?.newStatus ? STATUS_LABELS[confirmModal.newStatus] : ''}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter your justification here..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="min-h-[120px] resize-none focus-visible:ring-indigo-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModal(null)} className="font-medium">
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={!statusComment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
