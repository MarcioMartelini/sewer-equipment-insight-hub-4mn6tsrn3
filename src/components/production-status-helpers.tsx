import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export const getTaskName = (item: any, tableName: string) => {
  if (tableName === 'production_final_assembly') return item.station_name
  if (tableName === 'production_tests') return item.test_name
  return item.task_name
}

export const formatDate = (date: string | null) =>
  date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-'

export const getStatusBadge = (status: string | null) => {
  const s = (status || '').toLowerCase()
  const map: Record<string, string> = {
    complete: 'border-green-500 text-green-700 bg-green-50',
    completed: 'border-green-500 text-green-700 bg-green-50',
    'on track': 'border-blue-500 text-blue-700 bg-blue-50',
    'at risk': 'border-yellow-500 text-yellow-700 bg-yellow-50',
    delayed: 'border-red-500 text-red-700 bg-red-50',
    parked: 'border-slate-500 text-slate-700 bg-slate-50',
    'n/a': 'border-slate-400 text-slate-600 bg-slate-100',
    'not started': 'border-slate-400 text-slate-600 bg-slate-100',
    pending: 'border-slate-400 text-slate-600 bg-slate-100',
  }
  return map[s] || 'border-slate-300 text-slate-700 bg-slate-50'
}

export const formatStatusText = (status: string | null) => {
  if (!status) return 'Not started'
  if (status.toLowerCase() === 'n/a') return 'N/A'
  if (status.toLowerCase() === 'pending') return 'Not started'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export function EditStatusDialog({
  item,
  tableName,
  onUpdate,
}: {
  item: any
  tableName: string
  onUpdate: (i: any, s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(() => {
    let s = (item.status || 'not started').toLowerCase()
    if (s === 'pending') s = 'not started'
    if (s === 'completed') s = 'complete'
    return s
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status</DialogTitle>
          <DialogDescription>
            Alterar o status da tarefa {getTaskName(item, tableName)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="parked">Parked</SelectItem>
              <SelectItem value="on track">On Track</SelectItem>
              <SelectItem value="at risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onUpdate(item, status)
              setOpen(false)
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
