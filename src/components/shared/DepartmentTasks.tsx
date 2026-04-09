import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DepartmentTasksProps {
  department: string
}

export function DepartmentTasks({ department }: DepartmentTasksProps) {
  // Mock data for tasks
  const tasks = [
    {
      id: 'TSK-001',
      title: 'Design Review',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-04-15',
    },
    {
      id: 'TSK-002',
      title: 'Component Sourcing',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2026-04-18',
    },
    { id: 'TSK-003', title: 'Final QA', status: 'Done', priority: 'Low', dueDate: '2026-04-10' },
    {
      id: 'TSK-004',
      title: 'Initial Prototype',
      status: 'Pending',
      priority: 'High',
      dueDate: '2026-04-20',
    },
    {
      id: 'TSK-005',
      title: 'Client Feedback Analysis',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: '2026-04-22',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{department} Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.id}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.status === 'Done'
                        ? 'default'
                        : task.status === 'In Progress'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={task.priority === 'High' ? 'destructive' : 'outline'}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
