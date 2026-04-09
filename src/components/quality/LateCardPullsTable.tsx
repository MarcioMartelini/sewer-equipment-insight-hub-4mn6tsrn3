import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Edit2, Plus, Eye, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoUrl from '@/assets/design-sem-nome-70de8.png'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'

export function LateCardPullsTable() {
  const [pulls, setPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogState, setDialogState] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', pn: '', supervisor: '' })
  const [formData, setFormData] = useState({
    date: '',
    part_number: '',
    area_supervisor: '',
    occurrence_description: '',
    status: 'pending',
  })

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    let q = supabase.from('late_card_pulls').select('*').order('created_at', { ascending: false })
    if (filters.dateFrom) q = q.gte('date', filters.dateFrom)
    if (filters.dateTo) q = q.lte('date', filters.dateTo)
    if (filters.pn) q = q.ilike('part_number', `%${filters.pn}%`)
    if (filters.supervisor) q = q.ilike('area_supervisor', `%${filters.supervisor}%`)

    const { data } = await q
    if (data) setPulls(data)
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(fetchData, 500)
    return () => clearTimeout(t)
  }, [filters])

  const openDialog = (type: 'create' | 'edit' | 'view', pull?: any) => {
    setSelectedId(pull?.id || null)
    setFormData({
      date: pull?.date || new Date().toISOString().split('T')[0],
      part_number: pull?.part_number || '',
      area_supervisor: pull?.area_supervisor || '',
      occurrence_description: pull?.occurrence_description || '',
      status: pull?.status || 'pending',
    })
    setDialogState(type)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return
    const { error } = await supabase.from('late_card_pulls').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Excluído com sucesso' })
      fetchData()
    }
  }

  const handleExportPDF = async () => {
    const doc = new jsPDF()
    try {
      const img = new Image()
      img.src = logoUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      doc.addImage(img, 'PNG', 14, 10, 40, 15, undefined, 'FAST')
    } catch (e) {
      console.error('Failed to load image', e)
    }

    doc.setFontSize(16)
    doc.text('Late Card Pulls Report', 14, 35)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 42)

    const tableData = pulls.map((pull) => [
      pull.date ? pull.date.split('-').reverse().join('/') : '-',
      pull.part_number || '-',
      pull.area_supervisor || '-',
      pull.occurrence_description || '-',
      pull.status || 'pending',
    ])

    autoTable(doc, {
      head: [['Date', 'PN', 'Supervisor', 'Occurrence', 'Status']],
      body: tableData,
      startY: 48,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 19, 255] },
    })

    doc.save(`late_card_pulls_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleSave = async () => {
    const dataToSave = dialogState === 'create' ? { ...formData, created_by: user?.id } : formData
    const req =
      dialogState === 'create'
        ? supabase.from('late_card_pulls').insert(dataToSave)
        : supabase.from('late_card_pulls').update(dataToSave).eq('id', selectedId)

    const { error } = await req
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Salvo com sucesso' })
      setDialogState(null)
      fetchData()
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl">Late Card Pulls</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button
            className="bg-[#0013ff] hover:bg-[#0013ff]/90"
            onClick={() => openDialog('create')}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Late Card Pull
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-slate-50 border rounded-lg p-4 mb-6 flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Data Inicial</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Data Final</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">PN</Label>
              <Input
                placeholder="Buscar PN..."
                value={filters.pn}
                onChange={(e) => setFilters({ ...filters, pn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Supervisor</Label>
              <Input
                placeholder="Buscar Supervisor..."
                value={filters.supervisor}
                onChange={(e) => setFilters({ ...filters, supervisor: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ dateFrom: '', dateTo: '', pn: '', supervisor: '' })}
              className="w-full xl:w-auto"
            >
              <X className="w-4 h-4 mr-2" /> Limpar Filtros
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>PN</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Ocorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : pulls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pulls.map((pull) => (
                  <TableRow key={pull.id}>
                    <TableCell>
                      {pull.date ? pull.date.split('-').reverse().join('/') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{pull.part_number || '-'}</TableCell>
                    <TableCell>{pull.area_supervisor || '-'}</TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={pull.occurrence_description}
                    >
                      {pull.occurrence_description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pull.status === 'resolved' ? 'default' : 'secondary'}>
                        {pull.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDialog('view', pull)}
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDialog('edit', pull)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(pull.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!dialogState} onOpenChange={(o) => !o && setDialogState(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogState === 'create'
                  ? 'Novo Late Card Pull'
                  : dialogState === 'edit'
                    ? 'Editar Late Card Pull'
                    : 'Detalhes do Late Card Pull'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={dialogState === 'view'}
                />
              </div>
              <div className="grid gap-2">
                <Label>PN (Part Number)</Label>
                <Input
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  disabled={dialogState === 'view'}
                />
              </div>
              <div className="grid gap-2">
                <Label>Supervisor</Label>
                <Input
                  value={formData.area_supervisor}
                  onChange={(e) => setFormData({ ...formData, area_supervisor: e.target.value })}
                  disabled={dialogState === 'view'}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ocorrência</Label>
                <Textarea
                  value={formData.occurrence_description}
                  onChange={(e) =>
                    setFormData({ ...formData, occurrence_description: e.target.value })
                  }
                  disabled={dialogState === 'view'}
                />
              </div>
              {dialogState !== 'create' && (
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                    disabled={dialogState === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogState(null)}>
                Fechar
              </Button>
              {dialogState !== 'view' && <Button onClick={handleSave}>Salvar</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
