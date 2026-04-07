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
  { name: 'Admin', depts: ['All Departments'], access: 'Full Access' },
  { name: 'Manager', depts: ['Sales', 'Engineering', 'Production'], access: 'Read/Write' },
  { name: 'Supervisor', depts: ['Production', 'Quality'], access: 'Read/Write (Specific)' },
  { name: 'Operator', depts: ['Production'], access: 'Read Only / Status' },
]

export function PermissionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Permissions Control (RBAC)
        </h3>
        <Button variant="outline" onClick={() => toast.info('Edit policies (simulation)')}>
          <ShieldAlert className="w-4 h-4 mr-2" /> Edit Global Policies
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Allowed Departments</TableHead>
              <TableHead>Access Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                    onClick={() => toast.info(`Edit permissions for ${r.name}`)}
                  >
                    Edit Permissions
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
