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
import { fetchWorkOrders } from '@/services/work-orders'
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
      setWorkOrders(fetchedWOs.filter((wo) => wo.quoteId))
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Sales Work Orders</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700">WO ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">Quote Ref.</TableHead>
                  <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-700">Product</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 h-24">
                      No work orders originated from sales.
                    </TableCell>
                  </TableRow>
                ) : (
                  workOrders.map((wo) => (
                    <TableRow
                      key={wo.id}
                      className="group hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-medium text-slate-900">{wo.id}</TableCell>
                      <TableCell className="text-indigo-600 text-sm font-medium">
                        {wo.quoteNumber || '-'}
                      </TableCell>
                      <TableCell className="text-slate-700">{wo.customer}</TableCell>
                      <TableCell className="text-slate-600">{wo.productType}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 capitalize"
                        >
                          {wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {wo.dueDate ? format(new Date(wo.dueDate), 'MM/dd/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-500"
                              style={{ width: `${wo.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500 w-8">
                            {wo.progress}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
