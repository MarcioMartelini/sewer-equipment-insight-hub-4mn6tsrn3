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
    complete: 'border-green-300 text-green-900 bg-green-200',
    completed: 'border-green-300 text-green-900 bg-green-200',
    on_track: 'border-emerald-200 text-emerald-700 bg-emerald-100',
    'on track': 'border-emerald-200 text-emerald-700 bg-emerald-100',
    at_risk: 'border-amber-200 text-amber-800 bg-amber-100',
    'at risk': 'border-amber-200 text-amber-800 bg-amber-100',
    delayed: 'border-red-200 text-red-700 bg-red-100',
    parked: 'border-blue-200 text-blue-700 bg-blue-100',
    'n/a': 'border-slate-200 text-slate-700 bg-slate-100',
    not_started: 'border-slate-200 text-slate-700 bg-slate-100',
    'not started': 'border-slate-200 text-slate-700 bg-slate-100',
    pending: 'border-slate-200 text-slate-700 bg-slate-100',
  }
  return map[s] || 'border-slate-200 text-slate-700 bg-slate-100'
}

export const formatStatusText = (status: string | null) => {
  if (!status) return 'Not started'
  if (status.toLowerCase() === 'n/a') return 'N/A'
  if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'not_started')
    return 'Not Started'
  if (status.toLowerCase() === 'on_track') return 'On Track'
  if (status.toLowerCase() === 'at_risk') return 'At Risk'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
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
    let s = (item.status || 'not_started').toLowerCase()
    if (s === 'pending' || s === 'not started') s = 'not_started'
    if (s === 'completed') s = 'complete'
    if (s === 'on track') s = 'on_track'
    if (s === 'at risk') s = 'at_risk'
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
              <SelectItem value="not_started">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  Not Started
                </div>
              </SelectItem>
              <SelectItem value="parked">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Parked
                </div>
              </SelectItem>
              <SelectItem value="on_track">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  On Track
                </div>
              </SelectItem>
              <SelectItem value="at_risk">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  At Risk
                </div>
              </SelectItem>
              <SelectItem value="delayed">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Delayed
                </div>
              </SelectItem>
              <SelectItem value="complete">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  Complete
                </div>
              </SelectItem>
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
