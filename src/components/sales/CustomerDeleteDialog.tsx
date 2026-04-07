import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteCustomer } from '@/services/customers'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
  onSuccess: () => void
}

export default function CustomerDeleteDialog({ open, onOpenChange, customerId, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!customerId) return
    setLoading(true)
    try {
      await deleteCustomer(customerId)
      toast({ title: 'Customer deleted successfully' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({ title: 'Error deleting customer', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 my-4">
          Are you sure you want to delete this customer? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
