import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AbsencesTab() {
  const [data, setData] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data: absData, error } = await supabase
      .from('hr_absences')
      .select('*')
      .order('absence_date', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setData(absData || [])
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data: uData } = await supabase.from('users').select('id, full_name').order('full_name')
    if (uData) setUsers(uData)
  }

  useEffect(() => {
    fetchData()
    fetchUsers()
  }, [])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const employeeId = formData.get('employee_id') as string
    const employee = users.find((u) => u.id === employeeId)

    if (!employeeId || !employee) {
      return toast({
        title: 'Erro',
        description: 'Selecione um colaborador.',
        variant: 'destructive',
      })
    }

    const { error } = await supabase.from('hr_absences').insert({
      employee_id: employeeId,
      employee_name: employee.full_name,
      absence_date: formData.get('absence_date') as string,
      absence_type: formData.get('absence_type') as string,
      reason: formData.get('reason') as string,
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Ausência registrada.' })
      setIsAddOpen(false)
      fetchData()
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('T')[0].split('-')
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Controle de Ausências</CardTitle>
          <CardDescription>Registro de faltas justificadas e não justificadas.</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Ausência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Ausência</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Colaborador</Label>
                <Select name="employee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="absence_date">Data da Ausência</Label>
                <Input id="absence_date" name="absence_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="absence_type">Tipo</Label>
                <Select name="absence_type" required defaultValue="excused">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excused">Justificada (Excused)</SelectItem>
                    <SelectItem value="unexcused">Não Justificada (Unexcused)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input id="reason" name="reason" required />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employee_name}</TableCell>
                    <TableCell>{formatDate(item.absence_date)}</TableCell>
                    <TableCell>
                      <Badge variant={item.absence_type === 'excused' ? 'default' : 'destructive'}>
                        {item.absence_type === 'excused' ? 'Justificada' : 'Não Justificada'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        ...
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
