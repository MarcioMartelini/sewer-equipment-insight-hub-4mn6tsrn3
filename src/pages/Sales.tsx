import { useState, useEffect, useCallback } from 'react'
import { fetchQuotes, createQuote, approveQuote, type Quote } from '@/services/quotes'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, Loader2 } from 'lucide-react'
import SalesDashboard from '@/components/sales/SalesDashboard'

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
  actual_completion_date: z.string().min(1, 'Required'),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

export default function Sales() {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

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

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      await createQuote({
        ...data,
      })
      toast({ title: 'Quote created successfully' })
      setIsDialogOpen(false)
      form.reset()
      loadData()
    } catch (error) {
      toast({ title: 'Error creating quote', variant: 'destructive' })
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>
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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-[600px] grid-cols-3 bg-slate-100">
          <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Quotes Registry</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> New Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Quote</DialogTitle>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <Input placeholder="Details" {...field} />
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
                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                    >
                      Create Quote
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700">Quote ID</TableHead>
                  <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-700">Product</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Value</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Sent Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Approval</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 h-24">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
                    <TableRow key={quote.id} className="group hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {quote.quote_number}
                      </TableCell>
                      <TableCell className="text-slate-700">{quote.customer_name}</TableCell>
                      <TableCell className="text-slate-600">
                        {quote.product_family || quote.product_type}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700">
                        ${Number(quote.quote_value || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {quote.sent_date ? format(new Date(quote.sent_date), 'MM/dd/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {quote.approval_date
                          ? format(new Date(quote.approval_date), 'MM/dd/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {quote.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => handleApprove(quote)}
                            disabled={approvingId === quote.id}
                          >
                            {approvingId === quote.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
                    <TableRow key={wo.id} className="group hover:bg-slate-50/50">
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
