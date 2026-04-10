import { useEffect, useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import ExpediteKPIs from './ExpediteKPIs'
import ExpediteDetailsModal from './ExpediteDetailsModal'

export default function ExpeditesTab({ woFilter }: { woFilter: string }) {
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [viewItem, setViewItem] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [editItem, setEditItem] = useState<any>(null)
  const [newStatus, setNewStatus] = useState('')

  const fetchData = async () => {
    const { data: res, error } = await supabase
      .from('purchasing_expedites')
      .select('*, purchasing_tasks(component_name, supplier), work_orders(wo_number)')
      .order('created_at', { ascending: false })
    if (!error) setData(res || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(
    () =>
      data.filter((d) => {
        const cName = (d.purchasing_tasks?.component_name || d.component_type || '').toLowerCase()
        const supp = (d.purchasing_tasks?.supplier || '').toLowerCase()
        const wo = (d.work_orders?.wo_number || '').toLowerCase()

        if (woFilter && !wo.includes(woFilter.toLowerCase())) return false
        if (search && !cName.includes(search.toLowerCase()) && !supp.includes(search.toLowerCase()))
          return false
        if (status !== 'all' && d.status !== status) return false
        if (priority !== 'all' && d.priority !== priority) return false
        if (dateFrom && d.expedite_date && d.expedite_date < dateFrom) return false
        if (dateTo && d.expedite_date && d.expedite_date > dateTo) return false
        return true
      }),
    [data, woFilter, search, status, priority, dateFrom, dateTo],
  )

  const handleUpdate = async () => {
    if (!editItem || !newStatus) return
    const { error } = await supabase
      .from('purchasing_expedites')
      .update({ status: newStatus })
      .eq('id', editItem.id)
    if (!error) {
      toast({ title: 'Status updated' })
      setEditItem(null)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expedite?')) return
    const { error } = await supabase.from('purchasing_expedites').delete().eq('id', id)
    if (!error) {
      toast({ title: 'Deleted successfully' })
      fetchData()
    }
  }

  const openDetails = async (item: any) => {
    setViewItem(item)
    if (item.task_id) {
      const { data: h } = await supabase
        .from('purchasing_task_audit_log')
        .select('*, users(full_name)')
        .eq('task_id', item.task_id)
        .order('changed_at', { ascending: false })
      setHistory(h || [])
    }
  }

  const pColors: Record<string, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  }
  const sColors: Record<string, string> = {
    pending: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      <ExpediteKPIs data={filtered} />

      <div className="flex flex-col xl:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1 w-full min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search component or supplier..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[130px]"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[130px]"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">
                  {item.task_id?.split('-')[0] || '-'}
                </TableCell>
                <TableCell>
                  {item.purchasing_tasks?.component_name || item.component_type}
                </TableCell>
                <TableCell>{item.purchasing_tasks?.supplier || '-'}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={item.expedite_reason || ''}>
                  {item.expedite_reason || '-'}
                </TableCell>
                <TableCell>
                  {item.expedite_date ? format(new Date(item.expedite_date), 'MM/dd/yy') : '-'}
                </TableCell>
                <TableCell>${item.expedite_cost || 0}</TableCell>
                <TableCell>
                  <Badge
                    className={`${pColors[item.priority] || 'bg-slate-400'} text-white hover:opacity-80 uppercase text-[10px]`}
                  >
                    {item.priority || 'None'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${sColors[item.status] || 'bg-slate-400'} text-white hover:opacity-80 uppercase text-[10px]`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.created_at ? format(new Date(item.created_at), 'MM/dd/yy') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDetails(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditItem(item)
                        setNewStatus(item.status || 'pending')
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No expedites found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ExpediteDetailsModal item={viewItem} history={history} onClose={() => setViewItem(null)} />

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
