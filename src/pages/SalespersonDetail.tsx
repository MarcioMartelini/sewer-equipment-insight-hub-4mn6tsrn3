import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  fetchSalespersonById,
  deleteSalesperson,
  updateSalesperson,
  fetchWorkOrdersBySalesperson,
  type Salesperson,
} from '@/services/salespersons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Loader2,
  Wallet,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Percent,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import SalespersonFormModal from '@/components/sales/SalespersonFormModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function SalespersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const [salesperson, setSalesperson] = useState<Salesperson | null>(null)
  const [wos, setWos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    if (!id) return
    try {
      setLoading(true)
      const data = await fetchSalespersonById(id)
      setSalesperson(data)
      const relatedWos = await fetchWorkOrdersBySalesperson(data.name, data.salesperson_id)
      setWos(relatedWos)
    } catch (error) {
      console.error(error)
      toast({ title: 'Error loading details', variant: 'destructive' })
      navigate('/sales')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    if (!salesperson) return
    try {
      setIsSaving(true)
      const updated = await updateSalesperson(salesperson.id, formData)
      setSalesperson(updated)
      setIsEditModalOpen(false)
      toast({ title: 'Salesperson updated successfully' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Error updating salesperson', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!salesperson) return
    try {
      setIsDeleting(true)
      await deleteSalesperson(salesperson.id)
      toast({ title: 'Salesperson deleted successfully' })
      navigate('/sales')
    } catch (error) {
      console.error(error)
      toast({ title: 'Error deleting salesperson', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const stats = useMemo(() => {
    const totalWos = wos.length
    const completedWos = wos.filter((w) =>
      ['Completed', 'Concluído', 'Finalizado'].includes(w.status),
    ).length
    const canceledWos = wos.filter((w) => ['Canceled', 'Cancelado'].includes(w.status)).length
    const inProgressWos = totalWos - completedWos - canceledWos

    const totalSalesValue = wos.reduce((acc, w) => acc + Number(w.price || 0), 0)
    const commissionRate = salesperson?.commission_rate || 0
    const totalCommission = (totalSalesValue * commissionRate) / 100

    let lastWoDate = 'N/A'
    if (wos.length > 0) {
      const dates = wos.map((w) => new Date(w.created_at).getTime())
      lastWoDate = new Date(Math.max(...dates)).toLocaleDateString()
    }

    return {
      totalWos,
      completedWos,
      inProgressWos,
      totalSalesValue,
      totalCommission,
      lastWoDate,
    }
  }, [wos, salesperson])

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  if (!salesperson) return null

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full animate-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sales')}
            className="text-slate-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {salesperson.name}
              </h1>
              <Badge
                variant={salesperson.status === 'Active' ? 'default' : 'secondary'}
                className={salesperson.status === 'Active' ? 'bg-emerald-500' : ''}
              >
                {salesperson.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              ID: {salesperson.salesperson_id} • Registered since{' '}
              {new Date(salesperson.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Salesperson
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Salesperson
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" /> Email
              </p>
              <p className="text-slate-900 font-medium">{salesperson.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4" /> Phone
              </p>
              <p className="text-slate-900 font-medium">{salesperson.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Building className="w-4 h-4" /> Department
              </p>
              <p className="text-slate-900 font-medium">{salesperson.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" /> Region
              </p>
              <p className="text-slate-900 font-medium">{salesperson.region || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <Percent className="w-4 h-4" /> Commission Rate
              </p>
              <p className="text-slate-900 font-medium">{salesperson.commission_rate || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border-slate-200 bg-emerald-50/50">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                $
                {stats.totalCommission.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-sm font-medium text-slate-500">Total Accumulated Commission</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 bg-indigo-50/50">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                $
                {stats.totalSalesValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-sm font-medium text-slate-500">Total Sales Value</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalWos}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Total WOs
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completedWos}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Completed
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inProgressWos}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                In Progress
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 truncate">{stats.lastWoDate}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Last WO</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wos">Work Orders History ({wos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 text-slate-500">
          <Card>
            <CardContent className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-1">More Insights Coming Soon</p>
              <p>Additional charts and performance logs will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wos" className="mt-6">
          <Card className="shadow-sm border-slate-200">
            {wos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                <p>No Work Orders found for this salesperson.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product Family</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wos.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium text-slate-900">{wo.wo_number}</TableCell>
                        <TableCell>{wo.customer_name}</TableCell>
                        <TableCell>{wo.quotes?.product_family || 'N/A'}</TableCell>
                        <TableCell>${Number(wo.price || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{wo.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(wo.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {wo.expected_completion_date
                            ? new Date(wo.expected_completion_date).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {wo.actual_completion_date
                            ? new Date(wo.actual_completion_date).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/work-orders/${wo.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <SalespersonFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        salesperson={salesperson}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salesperson?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this salesperson? This action cannot be undone and
              will mark them as inactive in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
