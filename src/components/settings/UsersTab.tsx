import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type User = Database['public']['Tables']['users']['Row']

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<{
    full_name: string
    departments: string[]
    role: string
  }>({
    full_name: '',
    departments: [],
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('users').select('*').order('full_name')
    if (error) {
      toast.error('Erro ao carregar usuários')
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover o acesso deste usuário?')) return

    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao remover usuário. Ele pode ter registros dependentes.')
    } else {
      toast.success('Usuário removido com sucesso')
      fetchUsers()
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name || '',
      departments: user.department
        ? user.department
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)
        : [],
      role: user.role || 'user',
    })
  }

  const handleSave = async () => {
    if (!editingUser) return
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        department: formData.departments.join(', '),
        role: formData.role,
      })
      .eq('id', editingUser.id)

    if (error) {
      toast.error('Erro ao atualizar usuário')
    } else {
      toast.success('Usuário atualizado com sucesso')
      setEditingUser(null)
      fetchUsers()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Gerenciamento de Usuários
        </h3>
        <Button
          onClick={() => toast.info('Acesse a página de Cadastro para adicionar novos usuários.')}
        >
          <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.department || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {u.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Ativo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Departamentos</Label>
              <div className="grid grid-cols-2 gap-3 border rounded-md p-4">
                {[
                  'Sales',
                  'Engineering',
                  'Production',
                  'Purchasing',
                  'Quality',
                  'HR',
                  'Management',
                ].map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={formData.departments.includes(dept)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, departments: [...formData.departments, dept] })
                        } else {
                          setFormData({
                            ...formData,
                            departments: formData.departments.filter((d) => d !== dept),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`dept-${dept}`} className="font-normal cursor-pointer">
                      {dept}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso (Role)</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (Total)</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="user">Usuário Padrão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
