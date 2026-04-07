import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Customer, fetchCustomerById } from '@/services/customers'
import { Button } from '@/components/ui/button'
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
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
} from 'lucide-react'
import CustomerFormDialog from '@/components/sales/CustomerFormDialog'
import CustomerDeleteDialog from '@/components/sales/CustomerDeleteDialog'
import { Skeleton } from '@/components/ui/skeleton'

interface CustomerHistory {
  id: string
  field_changed: string
  old_value: string | null
  new_value: string | null
  changed_at: string
  user: {
    full_name: string
  } | null
}

interface CustomerWO {
  id: string
  wo_number: string
  product_type: string | null
  machine_model: string | null
  price: number | null
  status: string
  created_at: string | null
  expected_completion_date: string | null
  actual_completion_date: string | null
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [wos, setWos] = useState<CustomerWO[]>([])
  const [history, setHistory] = useState<CustomerHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const customerData = await fetchCustomerById(id)
      setCustomer(customerData)

      const { data: woData } = await supabase
        .from('work_orders')
        .select(
          'id, wo_number, product_type, machine_model, price, status, created_at, expected_completion_date, actual_completion_date',
        )
        .eq('customer_name', customerData.customer_name)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (woData) {
        setWos(woData)
      }

      const { data: historyData } = await supabase
        .from('customer_history')
        .select('id, field_changed, old_value, new_value, changed_at, user:users(full_name)')
        .eq('customer_id', id)
        .order('changed_at', { ascending: false })

      if (historyData) {
        setHistory(historyData as any)
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-700">Customer not found</h2>
        <Button onClick={() => navigate('/sales')} className="mt-4">
          Back to Sales
        </Button>
      </div>
    )
  }

  const totalWos = wos.length
  const completedWos = wos.filter(
    (w) => w.status === 'Completed' || w.status === 'Concluído',
  ).length
  const inProgressWos = totalWos - completedWos
  const totalValue = wos.reduce((sum, w) => sum + (Number(w.price) || 0), 0)
  const lastWoDate =
    wos.length > 0 && wos[0].created_at
      ? format(new Date(wos[0].created_at), 'MMM dd, yyyy')
      : 'N/A'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{customer.customer_name}</h1>
            <p className="text-slate-500">Customer ID: {customer.customer_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Main Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <User className="w-4 h-4" />
                <span>
                  <strong>Contact:</strong> {customer.contact_person || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4" />
                <span>
                  <strong>Email:</strong> {customer.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>
                  <strong>Phone:</strong> {customer.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      customer.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                    {customer.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin className="w-4 h-4 mt-1" />
                <div>
                  <strong>Address:</strong>
                  <p>{customer.address || 'N/A'}</p>
                  <p>
                    {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Value</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(totalValue)}
                </h3>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{completedWos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{inProgressWos}</p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Last Work Order</span>
                </div>
                <p className="font-semibold text-slate-900">{lastWoDate}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="wos" className="w-full">
        <TabsList>
          <TabsTrigger value="wos">Work Orders</TabsTrigger>
          <TabsTrigger value="history">Update History</TabsTrigger>
        </TabsList>
        <TabsContent value="wos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Orders History</CardTitle>
            </CardHeader>
            <CardContent>
              {wos.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No Work Orders found for this customer.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>WO Number</TableHead>
                        <TableHead>Product Family</TableHead>
                        <TableHead>Machine Model</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead>Expected Completion</TableHead>
                        <TableHead>Actual Completion</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wos.map((wo) => (
                        <TableRow key={wo.id}>
                          <TableCell>
                            <Link
                              to={`/work-orders/${wo.id}`}
                              className="font-medium text-indigo-600 hover:underline"
                            >
                              {wo.wo_number}
                            </Link>
                          </TableCell>
                          <TableCell>{wo.product_type || '-'}</TableCell>
                          <TableCell>{wo.machine_model || '-'}</TableCell>
                          <TableCell>
                            {wo.created_at ? format(new Date(wo.created_at), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            {wo.expected_completion_date
                              ? format(new Date(wo.expected_completion_date), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {wo.actual_completion_date
                              ? format(new Date(wo.actual_completion_date), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                wo.status === 'Completed' || wo.status === 'Concluído'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {wo.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(Number(wo.price) || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Update History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No updates recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Field Changed</TableHead>
                        <TableHead>Old Value</TableHead>
                        <TableHead>New Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {format(new Date(record.changed_at), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{record.user?.full_name || 'System'}</TableCell>
                          <TableCell className="font-medium capitalize">
                            {record.field_changed.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="text-red-500 line-through">
                            {record.old_value || '-'}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {record.new_value || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        onSuccess={loadData}
      />

      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customerId={customer.id}
        onSuccess={() => navigate('/sales')}
      />
    </div>
  )
}
