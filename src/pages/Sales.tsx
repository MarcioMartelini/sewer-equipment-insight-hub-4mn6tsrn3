import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchQuotes,
  createQuote,
  updateQuote,
  convertToWorkOrder,
  approveQuote,
  type Quote,
} from '@/services/quotes'
import { fetchWorkOrders, updateWorkOrder, deleteWorkOrder } from '@/services/work-orders'
import { Eye } from 'lucide-react'
import { WorkOrder } from '@/types/work-order'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Check,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SalesDashboard from '@/components/sales/SalesDashboard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMemo } from 'react'
import { deleteQuote } from '@/services/quotes'

const WO_STATUSES = [
  'Pending',
  'In Progress',
  'Engineering',
  'Purchasing',
  'Production',
  'Quality',
  'Completed',
  'On Hold',
]

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const quoteSchema = z.object({
  quote_number: z.string().min(1, 'Required'),
  customer_name: z.string().min(1, 'Required'),
  customer_city: z.string().min(1, 'Required'),
  customer_state: z.string().min(1, 'Required'),
  salesperson: z.string().min(1, 'Required'),
  product_family: z.string().min(1, 'Required'),
  machine_model: z.string().min(1, 'Required'),
  quote_value: z.coerce.number().min(0, 'Must be positive'),
  profit_margin_percentage: z.coerce.number().min(0, 'Must be positive'),
  special_custom: z.string().optional(),
  truck_information: z.string().min(1, 'Required'),
  truck_supplier: z.string().min(1, 'Required'),
  expected_completion_date: z.string().min(1, 'Required'),
  actual_completion_date: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

export default function Sales() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
  const [woNumber, setWoNumber] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [salespersonFilter, setSalespersonFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // WO States
  const [searchWoQuery, setSearchWoQuery] = useState('')
  const [statusWoFilter, setStatusWoFilter] = useState('all')
  const [customerWoFilter, setCustomerWoFilter] = useState('all')
  const [productFamilyWoFilter, setProductFamilyWoFilter] = useState('all')
  const [dateFromWo, setDateFromWo] = useState('')
  const [dateToWo, setDateToWo] = useState('')
  const [currentWoPage, setCurrentWoPage] = useState(1)

  const [editingWo, setEditingWo] = useState<WorkOrder | null>(null)
  const [isWoDialogOpen, setIsWoDialogOpen] = useState(false)
  const [deleteWoId, setDeleteWoId] = useState<string | null>(null)

  const woForm = useForm({
    defaultValues: {
      woNumber: '',
      customer: '',
      productType: '',
      machineModel: '',
      price: 0,
      status: '',
      expectedCompletionDate: '',
    },
  })

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quote_number: '',
      customer_name: '',
      customer_city: '',
      customer_state: '',
      salesperson: '',
      product_family: '',
      machine_model: '',
      quote_value: 0,
      profit_margin_percentage: 0,
      special_custom: '',
      truck_information: '',
      truck_supplier: '',
      expected_completion_date: '',
      actual_completion_date: '',
    },
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [fetchedQuotes, fetchedWOs] = await Promise.all([fetchQuotes(), fetchWorkOrders()])
      setQuotes(fetchedQuotes)
      setWorkOrders(fetchedWOs)
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openQuoteModal = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote)
      form.reset({
        quote_number: quote.quote_number || '',
        customer_name: quote.customer_name || '',
        customer_city: quote.customer_city || '',
        customer_state: quote.customer_state || '',
        salesperson: quote.salesperson || '',
        product_family: quote.product_family || '',
        machine_model: quote.machine_model || '',
        quote_value: Number(quote.quote_value || 0),
        profit_margin_percentage: Number(quote.profit_margin_percentage || 0),
        special_custom: quote.special_custom || '',
        truck_information: quote.truck_information || '',
        truck_supplier: quote.truck_supplier || '',
        expected_completion_date: quote.expected_completion_date || '',
        actual_completion_date: quote.actual_completion_date || '',
      })
    } else {
      setEditingQuote(null)
      form.reset({
        quote_number: '',
        customer_name: '',
        customer_city: '',
        customer_state: '',
        salesperson: '',
        product_family: '',
        machine_model: '',
        quote_value: 0,
        profit_margin_percentage: 0,
        special_custom: '',
        truck_information: '',
        truck_supplier: '',
        expected_completion_date: '',
        actual_completion_date: '',
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, data)
        toast({ title: 'Quote updated successfully' })
      } else {
        await createQuote(data)
        toast({ title: 'Quote created successfully' })
      }
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Error saving quote', variant: 'destructive' })
    }
  }

  const handleConvertClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const isValid = await form.trigger()
    if (isValid) {
      setWoNumber('')
      setIsConvertDialogOpen(true)
    } else {
      toast({ title: 'Please fill all required fields', variant: 'destructive' })
    }
  }

  const executeConversion = async () => {
    if (!woNumber.trim()) {
      toast({ title: 'WO Number is required', variant: 'destructive' })
      return
    }

    setIsConverting(true)
    try {
      const data = form.getValues()
      let quoteId = editingQuote?.id

      if (quoteId) {
        await updateQuote(quoteId, data)
      } else {
        const newQuote = await createQuote(data)
        quoteId = newQuote.id
      }

      await convertToWorkOrder(quoteId, woNumber)

      toast({ title: 'Quote converted to Work Order successfully!' })
      setIsConvertDialogOpen(false)
      setIsDialogOpen(false)

      await loadData()
      setActiveTab('work-orders')
    } catch (error) {
      toast({ title: 'Error converting quote', variant: 'destructive' })
    } finally {
      setIsConverting(false)
    }
  }

  const handleApprove = async (quote: Quote) => {
    try {
      setApprovingId(quote.id)
      await approveQuote(quote)
      toast({ title: 'Quote approved and Work Order created' })
      loadData()
    } catch (error) {
      toast({ title: 'Error approving quote', variant: 'destructive' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleWoDelete = async () => {
    if (!deleteWoId) return
    try {
      await deleteWorkOrder(deleteWoId)
      toast({ title: 'Work Order deleted successfully' })
      loadData()
    } catch (error) {
      toast({ title: 'Error deleting Work Order', variant: 'destructive' })
    } finally {
      setDeleteWoId(null)
    }
  }

  const onWoSubmit = async (data: any) => {
    if (!editingWo) return
    try {
      await updateWorkOrder(editingWo.id, data)
      toast({ title: 'Work Order updated successfully' })
      setIsWoDialogOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Error saving Work Order', variant: 'destructive' })
    }
  }

  const openWoModal = (wo: WorkOrder) => {
    setEditingWo(wo)
    woForm.reset({
      woNumber: wo.woNumber || '',
      customer: wo.customer || '',
      productType: wo.productType || '',
      machineModel: wo.machineModel || '',
      price: wo.price || 0,
      status: wo.status || '',
      expectedCompletionDate: wo.expectedCompletionDate || '',
    })
    setIsWoDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteQuoteId) return
    try {
      await deleteQuote(deleteQuoteId)
      toast({ title: 'Quote deleted successfully' })
      loadData()
    } catch (error) {
      toast({ title: 'Error deleting quote', variant: 'destructive' })
    } finally {
      setDeleteQuoteId(null)
    }
  }

  const uniqueSalespersons = useMemo(() => {
    return Array.from(new Set(quotes.map((q) => q.salesperson).filter(Boolean))) as string[]
  }, [quotes])

  const uniqueCustomers = useMemo(() => {
    return Array.from(new Set(quotes.map((q) => q.customer_name).filter(Boolean))) as string[]
  }, [quotes])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter
      const matchesSalesperson = salespersonFilter === 'all' || q.salesperson === salespersonFilter
      const matchesCustomer = customerFilter === 'all' || q.customer_name === customerFilter

      let matchesDate = true
      if (dateFrom || dateTo) {
        const qDate = new Date(q.created_at || '')
        if (dateFrom && new Date(dateFrom) > qDate) matchesDate = false
        if (dateTo && new Date(dateTo) < qDate) matchesDate = false
      }

      return matchesSearch && matchesStatus && matchesSalesperson && matchesCustomer && matchesDate
    })
  }, [quotes, searchQuery, statusFilter, salespersonFilter, customerFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const uniqueWoCustomers = useMemo(() => {
    return Array.from(new Set(workOrders.map((w) => w.customer).filter(Boolean))) as string[]
  }, [workOrders])

  const uniqueWoProductFamilies = useMemo(() => {
    return Array.from(new Set(workOrders.map((w) => w.productType).filter(Boolean))) as string[]
  }, [workOrders])

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesSearch =
        (wo.woNumber || '').toLowerCase().includes(searchWoQuery.toLowerCase()) ||
        wo.customer.toLowerCase().includes(searchWoQuery.toLowerCase())

      const matchesStatus = statusWoFilter === 'all' || wo.status === statusWoFilter
      const matchesCustomer = customerWoFilter === 'all' || wo.customer === customerWoFilter
      const matchesProduct =
        productFamilyWoFilter === 'all' || wo.productType === productFamilyWoFilter

      let matchesDate = true
      if (dateFromWo || dateToWo) {
        const woDate = new Date(wo.createdAt || '')
        if (dateFromWo && new Date(dateFromWo) > woDate) matchesDate = false
        if (dateToWo && new Date(dateToWo) < woDate) matchesDate = false
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesProduct && matchesDate
    })
  }, [
    workOrders,
    searchWoQuery,
    statusWoFilter,
    customerWoFilter,
    productFamilyWoFilter,
    dateFromWo,
    dateToWo,
  ])

  const totalWoPages = Math.ceil(filteredWorkOrders.length / itemsPerPage) || 1
  const paginatedWorkOrders = filteredWorkOrders.slice(
    (currentWoPage - 1) * itemsPerPage,
    currentWoPage * itemsPerPage,
  )

  useEffect(() => {
    setCurrentWoPage(1)
  }, [searchWoQuery, statusWoFilter, customerWoFilter, productFamilyWoFilter, dateFromWo, dateToWo])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, salespersonFilter, customerFilter, dateFrom, dateTo])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>
      case 'converted':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Converted</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'sent':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Sent</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {status}
          </Badge>
        )
    }
  }

  const getWoStatusBadge = (status: string) => {
    const lower = status.toLowerCase()
    if (lower.includes('pending')) return <Badge className="bg-slate-500">Pending</Badge>
    if (lower.includes('in progress')) return <Badge className="bg-blue-500">In Progress</Badge>
    if (lower.includes('engineering')) return <Badge className="bg-purple-500">Engineering</Badge>
    if (lower.includes('purchasing')) return <Badge className="bg-orange-500">Purchasing</Badge>
    if (lower.includes('production')) return <Badge className="bg-emerald-500">Production</Badge>
    if (lower.includes('quality')) return <Badge className="bg-yellow-500">Quality</Badge>
    if (lower.includes('completed')) return <Badge className="bg-green-700">Completed</Badge>
    if (lower.includes('on hold')) return <Badge className="bg-red-500">On Hold</Badge>
    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1600px] mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Module</h1>
        <p className="text-slate-500 text-sm mt-1">Manage quotes and track approved work orders.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-[600px] grid-cols-3 bg-slate-100">
          <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Quotes Registry</h2>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => openQuoteModal()}
              >
                <Plus className="w-4 h-4 mr-2" /> New Quote
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="xl:col-span-2">
                <Label className="text-xs text-slate-500 mb-1">Search</Label>
                <Input
                  placeholder="Quote ID or Customer Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Pending (Draft)</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Salesperson</Label>
                <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Salespeople" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salespeople</SelectItem>
                    {uniqueSalespersons.map((sp) => (
                      <SelectItem key={sp} value={sp}>
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Customer</Label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueCustomers.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Date From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Date To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quote_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quote Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Q-1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer State</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salesperson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salesperson</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="product_family"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Family</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select family" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Plumbing">Plumbing</SelectItem>
                              <SelectItem value="Municipal">Municipal</SelectItem>
                              <SelectItem value="Industrial">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="machine_model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Machine Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Model X" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quote_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profit_margin_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit Margin (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="special_custom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Custom</FormLabel>
                          <FormControl>
                            <Input placeholder="Details (Optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="truck_information"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Truck Information</FormLabel>
                          <FormControl>
                            <Input placeholder="Info" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="truck_supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Truck Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="Supplier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expected_completion_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Completion (Expected)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="actual_completion_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Completion (Actual)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {editingQuote?.status !== 'converted' && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-1/2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                        onClick={handleConvertClick}
                      >
                        Convert to WO
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={cn(
                        'w-full bg-indigo-600 hover:bg-indigo-700 text-white',
                        editingQuote?.status !== 'converted' ? 'sm:w-1/2' : '',
                      )}
                    >
                      {editingQuote ? 'Save Changes' : 'Create Quote'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Enter Work Order Number</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>WO Number</Label>
                  <Input
                    value={woNumber}
                    onChange={(e) => setWoNumber(e.target.value)}
                    placeholder="e.g. WO-2026"
                  />
                </div>
                <Button
                  onClick={executeConversion}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isConverting}
                >
                  {isConverting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Confirm Conversion
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!deleteQuoteId} onOpenChange={(open) => !open && setDeleteQuoteId(null)}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Quote</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500 my-4">
                Are you sure you want to delete this quote? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setDeleteQuoteId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Quote ID
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Salesperson
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Product Family
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Machine Model
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 whitespace-nowrap">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Date Created
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-500 h-24">
                        No quotes found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedQuotes.map((quote) => (
                      <TableRow key={quote.id} className="group hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">
                          {quote.quote_number}
                        </TableCell>
                        <TableCell className="text-slate-700">{quote.customer_name}</TableCell>
                        <TableCell className="text-slate-600">{quote.salesperson || '-'}</TableCell>
                        <TableCell className="text-slate-600">
                          {quote.product_family || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {quote.machine_model || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700">
                          ${Number(quote.quote_value || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {quote.created_at
                            ? format(new Date(quote.created_at), 'MM/dd/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openQuoteModal(quote)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {quote.status !== 'converted' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingQuote(quote)
                                    setWoNumber('')
                                    setIsConvertDialogOpen(true)
                                  }}
                                >
                                  <ArrowRight className="w-4 h-4 mr-2" /> Convert to WO
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => setDeleteQuoteId(quote.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredQuotes.length)} of{' '}
                  {filteredQuotes.length} quotes
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="work-orders" className="mt-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Work Orders List</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="xl:col-span-2">
                <Label className="text-xs text-slate-500 mb-1">Search</Label>
                <Input
                  placeholder="WO Number or Customer Name..."
                  value={searchWoQuery}
                  onChange={(e) => setSearchWoQuery(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Status</Label>
                <Select value={statusWoFilter} onValueChange={setStatusWoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {WO_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Customer</Label>
                <Select value={customerWoFilter} onValueChange={setCustomerWoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueWoCustomers.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Product Family</Label>
                <Select value={productFamilyWoFilter} onValueChange={setProductFamilyWoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Families" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Families</SelectItem>
                    {uniqueWoProductFamilies.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Date From (Created)</Label>
                <Input
                  type="date"
                  value={dateFromWo}
                  onChange={(e) => setDateFromWo(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1">Date To (Created)</Label>
                <Input type="date" value={dateToWo} onChange={(e) => setDateToWo(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      WO Number
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Product Family
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Machine Model
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 whitespace-nowrap">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Date Created
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">
                      Exp. Completion
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-500 h-24">
                        No work orders found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedWorkOrders.map((wo) => (
                      <TableRow key={wo.id} className="group hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">
                          {wo.woNumber || wo.id}
                        </TableCell>
                        <TableCell className="text-slate-700">{wo.customer}</TableCell>
                        <TableCell className="text-slate-600">{wo.productType || '-'}</TableCell>
                        <TableCell className="text-slate-600">{wo.machineModel || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-slate-700">
                          ${Number(wo.price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getWoStatusBadge(wo.status)}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {wo.createdAt ? format(new Date(wo.createdAt), 'MM/dd/yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {wo.expectedCompletionDate
                            ? format(new Date(wo.expectedCompletionDate), 'MM/dd/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/work-orders/${wo.id}`)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openWoModal(wo)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => setDeleteWoId(wo.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalWoPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-500">
                  Showing {(currentWoPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentWoPage * itemsPerPage, filteredWorkOrders.length)} of{' '}
                  {filteredWorkOrders.length} work orders
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWoPage((p) => Math.max(1, p - 1))}
                    disabled={currentWoPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentWoPage} of {totalWoPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWoPage((p) => Math.min(totalWoPages, p + 1))}
                    disabled={currentWoPage === totalWoPages}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <Dialog open={isWoDialogOpen} onOpenChange={setIsWoDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Work Order</DialogTitle>
            </DialogHeader>
            <Form {...woForm}>
              <form onSubmit={woForm.handleSubmit(onWoSubmit)} className="space-y-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={woForm.control}
                    name="woNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WO Number</FormLabel>
                        <FormControl>
                          <Input placeholder="WO-XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Family</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Family" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="machineModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Machine Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Model" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WO_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={woForm.control}
                    name="expectedCompletionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Completion Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteWoId} onOpenChange={(open) => !open && setDeleteWoId(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Work Order</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 my-4">
              Are you sure you want to delete this Work Order? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteWoId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleWoDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  )
}
