import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TaskCard, TaskWithWO } from './TaskCard'
import { Loader2, ClipboardList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DepartmentTasks({ department }: { department: string }) {
  const [tasks, setTasks] = useState<TaskWithWO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wo_tasks')
      .select('*, work_orders(wo_number, customer_name, product_type, machine_model)')
      .eq('department', department)
      .order('is_completed', { ascending: true })
      .order('finish_date', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      // Normalize work_orders to single object if it happens to return an array
      const normalizedData = (data || []).map((t: any) => ({
        ...t,
        work_orders: Array.isArray(t.work_orders) ? t.work_orders[0] : t.work_orders,
      }))
      setTasks(normalizedData as TaskWithWO[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [department])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_name.toLowerCase().includes(search.toLowerCase()) ||
      task.work_orders?.wo_number?.toLowerCase().includes(search.toLowerCase()) ||
      task.work_orders?.customer_name?.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'pending') return !task.is_completed
    if (statusFilter === 'completed') return task.is_completed

    return true
  })

  return (
    <div className="space-y-4 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar por WO, Cliente ou Tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[350px]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Tarefas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-16 bg-muted/10 rounded-lg border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col justify-center items-center p-16 bg-muted/10 rounded-lg border border-dashed text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {search || statusFilter !== 'all'
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : `Não há tarefas cadastradas para o departamento de ${department}.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  )
}
