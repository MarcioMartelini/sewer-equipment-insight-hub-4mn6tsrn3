import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'not started', label: 'Not started' },
  { value: 'parked', label: 'Parked' },
  { value: 'on track', label: 'On track' },
  { value: 'at risk', label: 'At risk' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'complete', label: 'Complete' },
]

export default function EditStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  onSave: (status: string) => Promise<void>
}) {
  const [status, setStatus] = useState(() => {
    let s = currentStatus?.toLowerCase() || 'not started'
    if (s === 'pending') s = 'not started'
    if (s === 'completed') s = 'complete'
    return s
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      let s = currentStatus?.toLowerCase() || 'not started'
      if (s === 'pending') s = 'not started'
      if (s === 'completed') s = 'complete'
      setStatus(s)
    }
  }, [isOpen, currentStatus])

  const handleSave = async () => {
    setLoading(true)
    await onSave(status)
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none">Status</label>
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
