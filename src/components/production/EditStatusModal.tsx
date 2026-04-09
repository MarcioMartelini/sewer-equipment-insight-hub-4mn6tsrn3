import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ProductionTask } from '@/services/production'

interface EditStatusModalProps {
  task: ProductionTask | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, status: string, comment?: string) => Promise<void>
}

export function EditStatusModal({ task, isOpen, onClose, onSave }: EditStatusModalProps) {
  const [status, setStatus] = useState<string>('')
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isCommentRequired = status === 'parked' || status === 'at_risk'

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

  const handleSave = async () => {
    if (!task) return
    setIsSaving(true)
    await onSave(task.id, status, isCommentRequired ? comment : undefined)
    setIsSaving(false)
    onClose()
  }

  const isSaveDisabled = isSaving || (isCommentRequired && !comment.trim())

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Task: {task?.task_name}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="parked">Parked</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCommentRequired && (
            <div className="grid gap-2 animate-fade-in">
              <Label htmlFor="status-comment" className="text-sm font-medium">
                Reason for status change <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-comment"
                placeholder="Please provide a reason for this status change..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                required
              />
              <p className="text-xs text-slate-500">
                A comment is required when changing status to Parked or At Risk.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
