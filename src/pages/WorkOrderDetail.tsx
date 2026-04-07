import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  FileEdit,
  Factory,
  Wrench,
  ShoppingCart,
  ShieldCheck,
  Users,
  ArrowLeft,
  Activity,
  Trash2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const MODULES = [
  {
    id: 'engineering',
    name: 'Engineering',
    icon: Wrench,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    path: '/engineering',
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    icon: ShoppingCart,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    path: '/purchasing',
  },
  {
    id: 'production',
    name: 'Production',
    icon: Factory,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    path: '/production',
  },
  {
    id: 'quality',
    name: 'Quality',
    icon: ShieldCheck,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    path: '/quality',
  },
  { id: 'hr', name: 'HR', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10', path: '/hr' },
]

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [wo, setWo] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' })

  const STATUS_OPTIONS = [
    'Pending',
    'In Progress',
    'Engineering',
    'Purchasing',
    'Production',
    'Quality',
    'Completed',
    'On Hold',
  ]

  const fetchWorkOrder = async () => {
    setLoading(true)
    const { data } = await supabase.from('work_orders').select('*').eq('id', id).single()
    if (data) setWo(data)
    else toast.error('Work Order not found')

    const { data: hData } = await supabase
      .from('wo_history')
      .select('*, users(full_name)')
      .eq('wo_id', id)
      .order('changed_at', { ascending: false })
    if (hData) setHistory(hData)
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchWorkOrder()
  }, [id])

  const openEdit = () => {
    setFormData({
      status: wo.status || '',
      customer_name: wo.customer_name || '',
      product_type: wo.product_type || '',
      machine_model: wo.machine_model || '',
      price: wo.price?.toString() || '',
      profit_margin: wo.profit_margin?.toString() || '',
      expected_completion_date: wo.expected_completion_date || wo.due_date || '',
      actual_completion_date: wo.actual_completion_date || '',
      notes: '',
    })
    setEditOpen(true)
  }

  const openStatusUpdate = () => {
    setStatusForm({ status: wo.status || '', notes: '' })
    setStatusOpen(true)
  }

  const handleStatusSave = async () => {
    if (!user) return
    if (!statusForm.status) return toast.error('Status is required')

    const updates = { status: statusForm.status }
    const { error } = await supabase.from('work_orders').update(updates).eq('id', id)
    if (error) return toast.error('Failed to update status')

    const { data: uData } = await supabase
      .from('users')
      .select('department')
      .eq('id', user.id)
      .single()

    await supabase.from('wo_history').insert({
      wo_id: id,
      user_id: user.id,
      department: uData?.department || 'System',
      old_status: wo.status,
      new_status: statusForm.status,
      notes: statusForm.notes || 'Status updated',
    })

    const targetDept = ['Engineering', 'Purchasing', 'Production', 'Quality'].includes(
      statusForm.status,
    )
      ? statusForm.status
      : wo.department

    if (targetDept) {
      const { data: deptUsers } = await supabase
        .from('users')
        .select('id')
        .eq('department', targetDept)

      if (deptUsers && deptUsers.length > 0) {
        const notifications = deptUsers.map((u) => ({
          user_id: u.id,
          type: 'System',
          message: `WO ${wo.wo_number} status changed to ${statusForm.status}`,
          related_entity_id: id,
          related_entity_type: 'work_order',
        }))
        await supabase.from('notifications').insert(notifications)
      }
    }

    toast.success('Status updated successfully')
    setStatusOpen(false)
    fetchWorkOrder()
  }

  const handleDelete = async () => {
    if (!user) return
    const updates = { deleted_at: new Date().toISOString() } as any
    const { error } = await supabase.from('work_orders').update(updates).eq('id', id)

    if (error) return toast.error('Failed to delete Work Order')

    const { data: uData } = await supabase
      .from('users')
      .select('department')
      .eq('id', user.id)
      .single()

    await supabase.from('wo_history').insert({
      wo_id: id,
      user_id: user.id,
      department: uData?.department || 'System',
      action: 'Deleted',
      notes: 'Work Order deletado',
    } as any)

    toast.success('Work Order deletado com sucesso')
    setDeleteOpen(false)
    navigate('/sales')
  }

  const handleSave = async () => {
    if (!user) return
    const updates = {
      status: formData.status,
      customer_name: formData.customer_name,
      product_type: formData.product_type,
      machine_model: formData.machine_model,
      price: formData.price ? parseFloat(formData.price) : null,
      profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : null,
      expected_completion_date: formData.expected_completion_date || null,
      actual_completion_date: formData.actual_completion_date || null,
    }
    const { error } = await supabase.from('work_orders').update(updates).eq('id', id)
    if (error) return toast.error('Failed to update Work Order')

    if (wo.status !== formData.status || formData.notes) {
      const { data: uData } = await supabase
        .from('users')
        .select('department')
        .eq('id', user.id)
        .single()
      await supabase.from('wo_history').insert({
        wo_id: id,
        user_id: user.id,
        department: uData?.department || 'System',
        old_status: wo.status,
        new_status: formData.status,
        notes: formData.notes || 'WO Updated',
      })
    }
    toast.success('Work Order updated')
    setEditOpen(false)
    fetchWorkOrder()
  }

  if (loading)
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  if (!wo) return <div className="p-8 max-w-7xl mx-auto">Work Order not found.</div>

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">WO: {wo.wo_number}</h2>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {wo.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openStatusUpdate}>
            <Activity className="mr-2 h-4 w-4" /> Update Status
          </Button>
          <Button onClick={openEdit}>
            <FileEdit className="mr-2 h-4 w-4" /> Edit WO
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete WO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Customer', value: wo.customer_name },
          { label: 'Product Family', value: wo.product_type || 'N/A' },
          { label: 'Machine Model', value: wo.machine_model || 'N/A' },
          {
            label: 'Price / Margin',
            value: wo.price ? `$${wo.price.toLocaleString()} (${wo.profit_margin || 0}%)` : 'N/A',
          },
          {
            label: 'Date Created',
            value: wo.created_at ? format(new Date(wo.created_at), 'MMM dd, yyyy') : 'N/A',
          },
          {
            label: 'Expected Completion',
            value: wo.expected_completion_date
              ? format(new Date(`${wo.expected_completion_date}T00:00:00`), 'MMM dd, yyyy')
              : 'N/A',
          },
          {
            label: 'Actual Completion',
            value: wo.actual_completion_date
              ? format(new Date(`${wo.actual_completion_date}T00:00:00`), 'MMM dd, yyyy')
              : 'Pending',
          },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold truncate" title={item.value}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-xl font-semibold mt-8">Module Links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {MODULES.map((m) => {
          const Icon = m.icon
          return (
            <Card
              key={m.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate(`${m.path}?wo=${wo.wo_number}`)}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className={`p-3 rounded-full ${m.bg} ${m.color} mb-3`}>
                  <Icon size={24} />
                </div>
                <span className="font-medium">{m.name}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <h3 className="text-xl font-semibold mt-8">Update History</h3>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action / Status Change</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length ? (
                history.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(h.changed_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{h.department}</TableCell>
                    <TableCell>{h.users?.full_name || 'System'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {h.action ? (
                        <Badge variant="outline">{h.action}</Badge>
                      ) : (
                        `${h.old_status || ''} → ${h.new_status || ''}`
                      )}
                    </TableCell>
                    <TableCell>{h.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No history records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Work Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusForm.status}
                onValueChange={(value) => setStatusForm({ ...statusForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                placeholder="Add any relevant notes for this status change..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusSave}>Save Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Work Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja deletar este Work Order? Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirmar Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Product Family</Label>
              <Input
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Machine Model</Label>
              <Input
                value={formData.machine_model}
                onChange={(e) => setFormData({ ...formData, machine_model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Profit Margin (%)</Label>
              <Input
                type="number"
                value={formData.profit_margin}
                onChange={(e) => setFormData({ ...formData, profit_margin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Completion</Label>
              <Input
                type="date"
                value={formData.expected_completion_date}
                onChange={(e) =>
                  setFormData({ ...formData, expected_completion_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Completion</Label>
              <Input
                type="date"
                value={formData.actual_completion_date}
                onChange={(e) =>
                  setFormData({ ...formData, actual_completion_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes (for history)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Reason for update..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
