import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchSalespersonById, type Salesperson } from '@/services/salespersons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SalespersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const [salesperson, setSalesperson] = useState<Salesperson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        setLoading(true)
        const data = await fetchSalespersonById(id)
        setSalesperson(data)
      } catch (error) {
        toast({ title: 'Error loading details', variant: 'destructive' })
        navigate('/sales')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, navigate, toast])

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  if (!salesperson) return null

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full animate-fade-in p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/sales')}
          className="text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{salesperson.name}</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-slate-200">
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
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border-slate-200 bg-indigo-50/50">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{salesperson.total_wos}</h3>
              <p className="text-sm font-medium text-slate-500">Total Work Orders</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 bg-emerald-50/50">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                ${Number(salesperson.total_revenue || 0).toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Total Revenue ({salesperson.commission_rate}% Comm.)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wos">Work Orders History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 text-slate-500">
          <p>Salesperson overview goes here. You can add performance charts or activity logs.</p>
        </TabsContent>
        <TabsContent value="wos" className="mt-6">
          <Card className="shadow-sm border-slate-200">
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
              <p>Work Order history view is under development.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
