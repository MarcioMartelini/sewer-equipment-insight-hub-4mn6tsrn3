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
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

const roles = [
  { name: 'Admin', depts: ['Todos os Departamentos'], access: 'Acesso Total' },
  { name: 'Manager', depts: ['Sales', 'Engineering', 'Production'], access: 'Leitura/Escrita' },
  { name: 'Supervisor', depts: ['Production', 'Quality'], access: 'Leitura/Escrita (Específico)' },
  { name: 'Operator', depts: ['Production'], access: 'Somente Leitura / Status' },
]

export function PermissionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Controle de Permissões (RBAC)
        </h3>
        <Button variant="outline" onClick={() => toast.info('Editar políticas (simulação)')}>
          <ShieldAlert className="w-4 h-4 mr-2" /> Editar Políticas Gerais
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Departamentos Permitidos</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {r.depts.map((d) => (
                      <Badge key={d} variant="secondary">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{r.access}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info(`Editar permissões de ${r.name}`)}
                  >
                    Editar Permissões
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
