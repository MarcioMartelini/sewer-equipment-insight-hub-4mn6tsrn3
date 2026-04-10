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
import { Badge } from '@/components/ui/badge'
import { Info, Edit } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const initialRoleDefinitions = [
  { role: 'admin', access: 'Acesso total ao sistema, configurações e gerenciamento de usuários' },
  { role: 'manager', access: 'Leitura/Escrita em todos os departamentos, relatórios gerenciais' },
  { role: 'supervisor', access: 'Leitura/Escrita limitada ao próprio departamento' },
  { role: 'user', access: 'Acesso básico, atualização de status de tarefas próprias' },
]

export function PermissionsTab() {
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({})
  const [roles, setRoles] = useState(initialRoleDefinitions)
  const [editingRole, setEditingRole] = useState<{ role: string; access: string } | null>(null)

  useEffect(() => {
    async function fetchRoles() {
      const { data } = await supabase.from('users').select('role')
      if (data) {
        const counts = data.reduce(
          (acc, user) => {
            const r = user.role || 'user'
            acc[r] = (acc[r] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )
        setRoleCounts(counts)
      }
    }
    fetchRoles()
  }, [])

  const handleSaveRole = () => {
    if (!editingRole) return
    setRoles((prev) =>
      prev.map((r) => (r.role === editingRole.role ? { ...r, access: editingRole.access } : r)),
    )
    setEditingRole(null)
    toast.success(`Permissões do nível ${editingRole.role} atualizadas com sucesso.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Níveis de Acesso e Permissões (RBAC)
        </h3>
        <p className="text-sm text-slate-500">
          Controle as regras e limites de acesso de cada função no sistema.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Segurança Integrada</AlertTitle>
        <AlertDescription>
          As permissões são controladas nativamente pelo banco de dados (Row Level Security). Para
          conceder um novo acesso, altere o "Nível de Acesso" do usuário na aba Usuários.
        </AlertDescription>
      </Alert>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Função (Role)</TableHead>
              <TableHead>Nível de Acesso Permitido</TableHead>
              <TableHead className="text-center">Usuários Ativos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.role}>
                <TableCell className="font-medium capitalize">{r.role}</TableCell>
                <TableCell>{r.access}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{roleCounts[r.role] || 0} Usuários</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingRole(r)}>
                    <Edit className="w-4 h-4 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Editar Permissões: {editingRole?.role}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição de Acesso e Permissões</Label>
              <Textarea
                value={editingRole?.access || ''}
                onChange={(e) =>
                  setEditingRole((prev) => (prev ? { ...prev, access: e.target.value } : null))
                }
                rows={4}
                placeholder="Descreva as permissões deste nível de acesso..."
              />
              <p className="text-xs text-slate-500">
                Nota: Esta alteração atualizará a descrição visual do papel. O controle real de
                acesso (RLS) permanece configurado de forma segura no banco de dados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRole}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
