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
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const roleDefinitions = [
  { role: 'admin', access: 'Acesso total ao sistema, configurações e gerenciamento de usuários' },
  { role: 'manager', access: 'Leitura/Escrita em todos os departamentos, relatórios gerenciais' },
  { role: 'supervisor', access: 'Leitura/Escrita limitada ao próprio departamento' },
  { role: 'user', access: 'Acesso básico, atualização de status de tarefas próprias' },
]

export function PermissionsTab() {
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({})

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
              <TableHead className="text-right">Usuários Ativos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleDefinitions.map((r) => (
              <TableRow key={r.role}>
                <TableCell className="font-medium capitalize">{r.role}</TableCell>
                <TableCell>{r.access}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{roleCounts[r.role] || 0} Usuários</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
