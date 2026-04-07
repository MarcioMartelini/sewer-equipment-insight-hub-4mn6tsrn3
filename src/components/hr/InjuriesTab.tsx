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
import { Textarea } from '@/components/ui/textarea'

export default function InjuriesTab() {
  const [data, setData] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data: injData, error } = await supabase
      .from('hr_injuries')
      .select('*')
      .order('injury_date', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setData(injData || [])
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

    const { error } = await supabase.from('hr_injuries').insert({
      employee_id: employeeId,
      employee_name: employee.full_name,
      injury_date: formData.get('injury_date') as string,
      injury_description: formData.get('injury_description') as string,
      injury_type: formData.get('injury_type') as string,
      severity_level: formData.get('severity_level') as string,
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Lesão registrada.' })
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
          <CardTitle>Segurança do Trabalho</CardTitle>
          <CardDescription>Registro de incidentes e acidentes (Injuries).</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Lesão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Lesão</DialogTitle>
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
                <Label htmlFor="injury_date">Data da Lesão</Label>
                <Input id="injury_date" name="injury_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="injury_type">Tipo de Lesão</Label>
                <Select name="injury_type" required defaultValue="non-recordable">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recordable">Registrável (Recordable)</SelectItem>
                    <SelectItem value="non-recordable">Não Registrável (Non-recordable)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity_level">Nível de Severidade</Label>
                <Select name="severity_level" required defaultValue="Low">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Baixo</SelectItem>
                    <SelectItem value="Medium">Médio</SelectItem>
                    <SelectItem value="High">Alto</SelectItem>
                    <SelectItem value="Critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="injury_description">Descrição</Label>
                <Textarea id="injury_description" name="injury_description" required />
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
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employee_name}</TableCell>
                    <TableCell>{formatDate(item.injury_date)}</TableCell>
                    <TableCell>{item.injury_description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.injury_type === 'recordable' ? 'destructive' : 'secondary'}
                      >
                        {item.injury_type === 'recordable' ? 'Registrável' : 'Não Registrável'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{item.severity_level}</span>
                    </TableCell>
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
