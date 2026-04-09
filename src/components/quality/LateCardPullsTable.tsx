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
import { Edit2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
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
  const [editing, setEditing] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    part_number: '',
    area_supervisor: '',
    occurrence_description: '',
  })

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('late_card_pulls' as any)
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPulls(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (pull: any) => {
    setEditing(pull)
    setStatus(pull.status || 'pending')
  }

  const handleSaveStatus = async () => {
    if (!editing) return
    const { error } = await supabase
      .from('late_card_pulls' as any)
      .update({ status })
      .eq('id', editing.id)

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Atualizado com sucesso' })
      setEditing(null)
      fetchData()
    }
  }

  const handleCreate = async () => {
    const { error } = await supabase.from('late_card_pulls' as any).insert({
      ...formData,
      created_by: user?.id,
    })

    if (error) {
      toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Criado com sucesso' })
      setCreating(false)
      setFormData({ date: '', part_number: '', area_supervisor: '', occurrence_description: '' })
      fetchData()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Late Card Pulls</CardTitle>
        <Button className="bg-[#0013ff]" onClick={() => setCreating(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Registro
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>PN</TableHead>
                <TableHead>Area Supervisor</TableHead>
                <TableHead>Descrição da Ocorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
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
                      {pull.date ? new Date(pull.date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{pull.part_number || '-'}</TableCell>
                    <TableCell>{pull.area_supervisor || '-'}</TableCell>
                    <TableCell
                      className="max-w-[250px] truncate"
                      title={pull.occurrence_description}
                    >
                      {pull.occurrence_description || pull.pull_reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pull.status === 'resolved' ? 'default' : 'secondary'}>
                        {pull.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pull)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Late Card Pull</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>PN (Part Number)</Label>
                <Input
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Area Supervisor</Label>
                <Input
                  value={formData.area_supervisor}
                  onChange={(e) => setFormData({ ...formData, area_supervisor: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Descrição da Ocorrência</Label>
                <Textarea
                  value={formData.occurrence_description}
                  onChange={(e) =>
                    setFormData({ ...formData, occurrence_description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveStatus}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
