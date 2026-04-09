import { useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface DepartmentTasksProps {
  department: string
}

export function DepartmentTasks({ department }: DepartmentTasksProps) {
  const [search, setSearch] = useState('')
  const [taskFilter, setTaskFilter] = useState('all')

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

  const uniqueTasks = useMemo(() => Array.from(new Set(tasks.map((t) => t.title))).sort(), [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      if (taskFilter !== 'all' && t.title !== taskFilter) {
        return false
      }
      return true
    })
  }, [tasks, search, taskFilter])

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>{department} Tasks</CardTitle>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={taskFilter} onValueChange={setTaskFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {uniqueTasks.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
