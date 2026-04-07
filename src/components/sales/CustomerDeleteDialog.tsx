import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteCustomer } from '@/services/customers'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
  onSuccess: () => void
}

export default function CustomerDeleteDialog({ open, onOpenChange, customerId, onSuccess }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    if (!customerId || !user) return
    setLoading(true)
    try {
      await deleteCustomer(customerId, user.id)
      toast({ title: 'Cliente deletado com sucesso' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({ title: 'Erro ao deletar cliente', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Deletar Cliente</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 my-4">
          Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Deletar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
