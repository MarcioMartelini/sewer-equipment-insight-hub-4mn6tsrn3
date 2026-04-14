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
          Access Levels and Permissions (RBAC)
        </h3>
        <p className="text-sm text-slate-500">
          Control the rules and access limits for each role in the system.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Integrated Security</AlertTitle>
        <AlertDescription>
          Permissions are controlled natively by the database (Row Level Security). To grant new
          access, change the user's "Access Level" in the Users tab.
        </AlertDescription>
      </Alert>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Allowed Access Level</TableHead>
              <TableHead className="text-center">Active Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.role}>
                <TableCell className="font-medium capitalize">{r.role}</TableCell>
                <TableCell>{r.access}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{roleCounts[r.role] || 0} Users</Badge>
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
            <DialogTitle className="capitalize">Edit Permissions: {editingRole?.role}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Access and Permissions Description</Label>
              <Textarea
                value={editingRole?.access || ''}
                onChange={(e) =>
                  setEditingRole((prev) => (prev ? { ...prev, access: e.target.value } : null))
                }
                rows={4}
                placeholder="Describe the permissions for this access level..."
              />
              <p className="text-xs text-slate-500">
                Note: This change will update the visual description of the role. Actual access
                control (RLS) remains securely configured in the database.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
