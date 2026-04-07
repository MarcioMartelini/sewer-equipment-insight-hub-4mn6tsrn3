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
import { Edit2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function WarrantyClaimsTable() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quality_warranty_claims')
      .select('*, work_orders(wo_number)')
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
    setNotes(claim.resolution_notes || '')
  }

  const handleSave = async () => {
    if (!editing) return
    const resolvedDate =
      status === 'resolved' && editing.status !== 'resolved'
        ? new Date().toISOString().split('T')[0]
        : editing.resolved_date

    const { error } = await supabase
      .from('quality_warranty_claims')
      .update({ status, resolution_notes: notes, resolved_date: resolvedDate })
      .eq('id', editing.id)

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Atualizado com sucesso' })
      setEditing(null)
      fetchData()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Garantias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO ID</TableHead>
                <TableHead>S/N</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reportado em</TableHead>
                <TableHead>Resolvido em</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    Nenhum sinistro registrado.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {claim.work_orders?.wo_number || '-'}
                    </TableCell>
                    <TableCell>{claim.serial_number || '-'}</TableCell>
                    <TableCell>{claim.customer_name || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={claim.issue_description}>
                      {claim.issue_description || '-'}
                    </TableCell>
                    <TableCell>{claim.issue_category || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'resolved' ? 'default' : 'secondary'}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {claim.reported_date
                        ? new Date(claim.reported_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {claim.resolved_date
                        ? new Date(claim.resolved_date).toLocaleDateString()
                        : '-'}
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

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Garantia</DialogTitle>
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
              <div className="space-y-2">
                <Label>Notas de Resolução</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes da resolução..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
