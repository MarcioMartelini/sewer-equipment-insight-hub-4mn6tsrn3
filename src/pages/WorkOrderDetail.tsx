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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  Rocket,
  Calendar,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

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

const TASK_GROUPS = [
  {
    department: 'Engineering',
    subDepartment: null,
    tasks: ['Layout', 'BOM', 'Traveler', 'Accessories List'],
  },
  {
    department: 'Purchasing',
    subDepartment: null,
    tasks: [
      'Engine',
      'Hydraulics',
      'Water Pump',
      'Water Tank',
      'Debris Box',
      'Blower',
      'Van Air',
      'Sewer Hose',
      'Shroud',
    ],
  },
  {
    department: 'Production',
    subDepartment: 'Weld Shop',
    tasks: [
      'Chassis frame',
      'Trailer frame',
      'Boiler frame',
      'Engine frame',
      'Pump frame',
      'Upper blower frame',
      'Boom',
      'Debris Box',
      'Shroud',
      'Cab electric box',
      'Mid electric box',
      'Reel electric box',
      'RVCR',
      'Slider',
      'Hose Reel',
      'UPRT',
    ],
  },
  {
    department: 'Production',
    subDepartment: 'Paint',
    tasks: [
      'Chassis frame',
      'Trailer frame',
      'Boiler frame',
      'Engine frame',
      'Pump frame',
      'Upper blower frame',
      'Boom',
      'Debris Box',
      'Shroud',
      'Cab electric box',
      'Mid electric box',
      'Reel electric box',
      'RVCR',
      'Slider',
      'Hose Reel',
      'UPRT',
    ],
  },
  {
    department: 'Production',
    subDepartment: 'Sub-Assembly',
    tasks: [
      'Chassis frame',
      'Trailer frame',
      'Boiler frame',
      'Engine frame',
      'Pump frame',
      'Upper blower frame',
      'Boom',
      'Debris Box',
      'Shroud',
      'Cab electric box',
      'Mid electric box',
      'Reel electric box',
      'RVCR',
      'Slider',
      'Hose Reel',
      'UPRT',
    ],
  },
  {
    department: 'Production',
    subDepartment: 'Warehouse',
    tasks: ['Accessories'],
  },
  {
    department: 'Production',
    subDepartment: 'Final Assembly',
    tasks: [
      'Chassis mod',
      'Station #1',
      'Station #2',
      'Station #3',
      'Station #4',
      'Station #5',
      'Offline',
      'Trim and Pack',
    ],
  },
  {
    department: 'Production',
    subDepartment: 'Tests',
    tasks: [
      'First test',
      'Gig event',
      'Second Test',
      'Paint repair',
      'Final test',
      'Trim and Pack',
    ],
  },
]

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [wo, setWo] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: '',
    expected_completion_date: '',
  })

  const [releaseOpen, setReleaseOpen] = useState(false)
  const [taskDates, setTaskDates] = useState<
    Record<string, { start: string; finish: string; na?: boolean }>
  >({})

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
    if (data) {
      setWo(data)
      if ((data as any).production_schedule) {
        setTaskDates((data as any).production_schedule)
      }
    } else {
      toast.error('Work Order not found')
    }

    const { data: hData } = await supabase
      .from('wo_history')
      .select('*, users(full_name)')
      .eq('wo_id', id)
      .order('changed_at', { ascending: false })
    if (hData) setHistory(hData)

    const { data: tData } = await supabase
      .from('wo_tasks')
      .select('*')
      .eq('wo_id', id)
      .order('department')
      .order('sub_department')
    if (tData) setTasks(tData)

    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchWorkOrder()
  }, [id])

  const openEdit = () => {
    setFormData({
      wo_number: wo.wo_number || '',
      status: wo.status || '',
      customer_name: wo.customer_name || '',
      product_type: wo.product_type || '',
      machine_model: wo.machine_model || '',
      price: wo.price?.toString() || '',
      profit_margin: wo.profit_margin?.toString() || '',
      special_custom: wo.special_custom || '',
      truck_information: wo.truck_information || '',
      truck_supplier: wo.truck_supplier || '',
      expected_completion_date: wo.expected_completion_date || wo.due_date || '',
      actual_completion_date: wo.actual_completion_date || '',
      notes: '',
    })
    setEditOpen(true)
  }

  const openStatusUpdate = () => {
    setStatusForm({
      status: wo.status || '',
      notes: '',
      expected_completion_date: wo.expected_completion_date || '',
    })
    setStatusOpen(true)
  }

  const handleStatusSave = async () => {
    if (!user) return
    if (!statusForm.status) return toast.error('Status is required')

    const updates: any = { status: statusForm.status }
    if (statusForm.expected_completion_date !== undefined) {
      updates.expected_completion_date = statusForm.expected_completion_date || null
    }

    const { error } = await supabase.from('work_orders').update(updates).eq('id', id)
    if (error) return toast.error('Failed to update status')

    const { data: uData } = await supabase
      .from('users')
      .select('department')
      .eq('id', user.id)
      .single()

    const historyInserts = []

    if (wo.status !== statusForm.status) {
      historyInserts.push({
        wo_id: id,
        user_id: user.id,
        department: uData?.department || 'System',
        field_changed: 'status',
        old_value: wo.status,
        new_value: statusForm.status,
        notes: statusForm.notes || 'Status updated',
      })
    }

    if (wo.expected_completion_date !== statusForm.expected_completion_date) {
      historyInserts.push({
        wo_id: id,
        user_id: user.id,
        department: uData?.department || 'System',
        field_changed: 'expected_completion_date',
        old_value: wo.expected_completion_date || null,
        new_value: statusForm.expected_completion_date || null,
        notes: statusForm.notes || 'Expected completion date updated',
      })
    }

    if (historyInserts.length === 0 && statusForm.notes) {
      historyInserts.push({
        wo_id: id,
        user_id: user.id,
        department: uData?.department || 'System',
        action: 'Notes Added',
        notes: statusForm.notes,
      })
    }

    if (historyInserts.length > 0) {
      await supabase.from('wo_history').insert(historyInserts as any)
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

    if (!formData.wo_number || !formData.customer_name || !formData.status) {
      return toast.error('Please fill all mandatory fields (WO Number, Customer, Status).')
    }

    const updates: any = {
      wo_number: formData.wo_number,
      status: formData.status,
      customer_name: formData.customer_name,
      product_type: formData.product_type,
      machine_model: formData.machine_model,
      price: formData.price ? parseFloat(formData.price) : null,
      profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : null,
      special_custom: formData.special_custom,
      truck_information: formData.truck_information,
      truck_supplier: formData.truck_supplier,
      expected_completion_date: formData.expected_completion_date || null,
      actual_completion_date: formData.actual_completion_date || null,
    }

    const changedFields: any[] = []
    for (const key in updates) {
      const oldVal = wo[key]
      const newVal = updates[key]

      if (oldVal != newVal) {
        if ((oldVal === null || oldVal === undefined) && newVal === '') continue
        changedFields.push({ field: key, old: oldVal, new: newVal })
      }
    }

    if (changedFields.length === 0 && !formData.notes) {
      toast.info('No changes detected.')
      setEditOpen(false)
      return
    }

    const { error } = await supabase.from('work_orders').update(updates).eq('id', id)
    if (error) {
      console.error(error)
      return toast.error('Failed to update Work Order')
    }

    if (changedFields.length > 0 || formData.notes) {
      const { data: uData } = await supabase
        .from('users')
        .select('department')
        .eq('id', user.id)
        .single()

      const historyInserts =
        changedFields.length > 0
          ? changedFields.map((cf) => ({
              wo_id: id,
              user_id: user.id,
              department: uData?.department || 'System',
              field_changed: cf.field,
              old_value: cf.old ? String(cf.old) : null,
              new_value: cf.new ? String(cf.new) : null,
              action: 'Field Update',
              notes: formData.notes || null,
            }))
          : [
              {
                wo_id: id,
                user_id: user.id,
                department: uData?.department || 'System',
                action: 'Update',
                notes: formData.notes,
              },
            ]

      const { error: histError } = await supabase.from('wo_history').insert(historyInserts)
      if (histError) console.error('History Error:', histError)
    }

    toast.success('Work Order updated successfully')
    setEditOpen(false)
    fetchWorkOrder()
  }

  const handleDateChange = (
    dept: string,
    subDept: string | null,
    task: string,
    field: 'start' | 'finish',
    value: string,
  ) => {
    const key = `${dept}-${subDept || 'none'}-${task}`
    setTaskDates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const handleNAChange = (dept: string, subDept: string | null, task: string, checked: boolean) => {
    const key = `${dept}-${subDept || 'none'}-${task}`
    setTaskDates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        na: checked,
      },
    }))
  }

  const handleSaveSchedule = async () => {
    const { error } = await supabase
      .from('work_orders')
      .update({ production_schedule: taskDates } as any)
      .eq('id', id)

    if (error) {
      console.error(error)
      return toast.error('Failed to save schedule')
    }

    toast.success('Task schedule saved successfully')
    setReleaseOpen(false)
    fetchWorkOrder()
  }

  const handleRelease = async () => {
    const inserts = TASK_GROUPS.flatMap((group) =>
      group.tasks
        .filter((taskName) => {
          const key = `${group.department}-${group.subDepartment || 'none'}-${taskName}`
          return !taskDates[key]?.na
        })
        .map((taskName) => {
          const key = `${group.department}-${group.subDepartment || 'none'}-${taskName}`
          const dates = taskDates[key] || {}
          return {
            wo_id: id,
            department: group.department,
            sub_department: group.subDepartment,
            task_name: taskName,
            start_date: dates.start || null,
            finish_date: dates.finish || null,
            status: 'Pending',
          }
        }),
    )

    const { error } = await supabase.from('wo_tasks').insert(inserts)
    if (error) {
      console.error(error)
      return toast.error('Failed to release to production')
    }

    await supabase
      .from('work_orders')
      .update({ production_schedule: taskDates } as any)
      .eq('id', id)

    const { data: uData } = await supabase
      .from('users')
      .select('department')
      .eq('id', user?.id)
      .single()

    await supabase.from('wo_history').insert({
      wo_id: id,
      user_id: user?.id,
      department: uData?.department || 'System',
      action: 'Released to Production',
      notes: 'Generated production tasks schedule',
    } as any)

    toast.success('Work Order released to production')
    setReleaseOpen(false)
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">WO: {wo.wo_number}</h2>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {wo.status}
          </Badge>
          {wo.expected_completion_date && (
            <Badge
              variant="outline"
              className="text-sm px-3 py-1 border-primary/20 text-primary bg-primary/5"
            >
              Expected:{' '}
              {format(new Date(`${wo.expected_completion_date}T00:00:00`), 'MMM dd, yyyy')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setReleaseOpen(true)}
            disabled={tasks.length > 0}
          >
            <Rocket className="mr-2 h-4 w-4" /> Release to Production
          </Button>
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
          { label: 'Special Custom', value: wo.special_custom || 'N/A' },
          {
            label: 'Truck Info',
            value: wo.truck_information
              ? `${wo.truck_information} (${wo.truck_supplier || 'No supplier'})`
              : 'N/A',
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
              <div className="text-lg font-semibold truncate" title={item.value}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8">Tasks Schedule</h3>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Sub-Department</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Finish Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.department}</TableCell>
                      <TableCell>{t.sub_department || '-'}</TableCell>
                      <TableCell>{t.task_name}</TableCell>
                      <TableCell>
                        {t.start_date
                          ? format(new Date(`${t.start_date}T00:00:00`), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {t.finish_date
                          ? format(new Date(`${t.finish_date}T00:00:00`), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'Pending' ? 'secondary' : 'default'}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

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
                <TableHead>Action / Field Change</TableHead>
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
                    <TableCell>
                      {h.field_changed ? (
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold text-muted-foreground uppercase text-xs mb-1">
                            {h.field_changed.replace(/_/g, ' ')}
                          </span>
                          <span>
                            <span className="line-through opacity-70 mr-1">
                              {h.old_value || 'Empty'}
                            </span>
                            &rarr;{' '}
                            <span className="font-medium ml-1">{h.new_value || 'Empty'}</span>
                          </span>
                        </div>
                      ) : h.action ? (
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

      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
              <DialogTitle>Release to Production - Task Schedule</DialogTitle>
              {(wo.expected_completion_date || wo.due_date) && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    Expected Completion:{' '}
                    <strong className="text-foreground">
                      {format(
                        new Date(`${wo.expected_completion_date || wo.due_date}T00:00:00`),
                        'MMM dd, yyyy',
                      )}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <Accordion type="multiple" className="w-full space-y-4">
              {TASK_GROUPS.map((group, idx) => {
                const groupTitle = `${group.department}${group.subDepartment ? ` - ${group.subDepartment}` : ''}`
                return (
                  <AccordionItem value={`item-${idx}`} key={idx} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      {groupTitle}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-2/5">Task Name</TableHead>
                              <TableHead className="w-1/5 text-center">Not Applicable</TableHead>
                              <TableHead className="w-1/5">Start Date</TableHead>
                              <TableHead className="w-1/5">Finish Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.tasks.map((task) => {
                              const key = `${group.department}-${group.subDepartment || 'none'}-${task}`
                              const isNa = taskDates[key]?.na || false
                              return (
                                <TableRow
                                  key={task}
                                  className={isNa ? 'opacity-50 bg-muted/50' : ''}
                                >
                                  <TableCell className="font-medium">{task}</TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center">
                                      <Checkbox
                                        id={`na-${key}`}
                                        checked={isNa}
                                        onCheckedChange={(checked) =>
                                          handleNAChange(
                                            group.department,
                                            group.subDepartment,
                                            task,
                                            checked as boolean,
                                          )
                                        }
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      disabled={isNa}
                                      value={taskDates[key]?.start || ''}
                                      onChange={(e) =>
                                        handleDateChange(
                                          group.department,
                                          group.subDepartment,
                                          task,
                                          'start',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      disabled={isNa}
                                      value={taskDates[key]?.finish || ''}
                                      onChange={(e) =>
                                        handleDateChange(
                                          group.department,
                                          group.subDepartment,
                                          task,
                                          'finish',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
          <DialogFooter className="mt-4 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setReleaseOpen(false)
                setTaskDates(wo?.production_schedule || {})
              }}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleSaveSchedule}>
                Save
              </Button>
              <Button onClick={handleRelease} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Rocket className="mr-2 h-4 w-4" /> Release
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label>Expected Completion Date</Label>
              <Input
                type="date"
                value={statusForm.expected_completion_date}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, expected_completion_date: e.target.value })
                }
              />
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
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            <div className="space-y-2">
              <Label>
                WO Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.wo_number}
                onChange={(e) => setFormData({ ...formData, wo_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Customer <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
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
              <Label>Special Custom</Label>
              <Input
                value={formData.special_custom}
                onChange={(e) => setFormData({ ...formData, special_custom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Truck Information</Label>
              <Input
                value={formData.truck_information}
                onChange={(e) => setFormData({ ...formData, truck_information: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Truck Supplier</Label>
              <Input
                value={formData.truck_supplier}
                onChange={(e) => setFormData({ ...formData, truck_supplier: e.target.value })}
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
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
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
