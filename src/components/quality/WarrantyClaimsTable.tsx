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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'

export function WarrantyClaimsTable() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    customer_name: '',
    product_family: '',
    machine_model: '',
    serial_number: '',
    occurrence_description: '',
  })

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('warranty_claims' as any)
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setClaims(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (claim: any) => {
    setEditing(claim)
    setStatus(claim.status || 'pending')
  }

  const handleSaveStatus = async () => {
    if (!editing) return
    const { error } = await supabase
      .from('warranty_claims' as any)
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
    const { error } = await supabase.from('warranty_claims' as any).insert({
      ...formData,
      created_by: user?.id,
    })

    if (error) {
      toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Criado com sucesso' })
      setCreating(false)
      setFormData({
        date: '',
        customer_name: '',
        product_family: '',
        machine_model: '',
        serial_number: '',
        occurrence_description: '',
      })
      fetchData()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Garantias</CardTitle>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Garantia
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Família de Produto</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>S/N</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      {claim.date ? new Date(claim.date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{claim.customer_name || '-'}</TableCell>
                    <TableCell>{claim.product_family || '-'}</TableCell>
                    <TableCell>{claim.machine_model || '-'}</TableCell>
                    <TableCell>{claim.serial_number || '-'}</TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={claim.occurrence_description || claim.issue_description}
                    >
                      {claim.occurrence_description || claim.issue_description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'resolved' ? 'default' : 'secondary'}>
                        {claim.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(claim)}>
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
              <DialogTitle>Nova Garantia</DialogTitle>
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
                <Label>Cliente</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Família de Produto</Label>
                <Input
                  value={formData.product_family}
                  onChange={(e) => setFormData({ ...formData, product_family: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Modelo da Máquina</Label>
                <Input
                  value={formData.machine_model}
                  onChange={(e) => setFormData({ ...formData, machine_model: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Número de Série (S/N)</Label>
                <Input
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
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
