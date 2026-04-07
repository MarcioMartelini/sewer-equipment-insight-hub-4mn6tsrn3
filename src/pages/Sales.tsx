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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, Loader2 } from 'lucide-react'

const quoteSchema = z.object({
  customer_name: z.string().min(1, 'Required'),
  product_type: z.string().min(1, 'Required'),
  quote_value: z.coerce.number().min(0),
  profit_margin_percentage: z.coerce.number().min(0),
  expiration_date: z.string().min(1, 'Required'),
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
      customer_name: '',
      product_type: '',
      quote_value: 0,
      profit_margin_percentage: 0,
      expiration_date: '',
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
        expiration_date: new Date(data.expiration_date).toISOString(),
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
        return <Badge className="bg-green-500">Approved</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'sent':
        return <Badge className="bg-blue-500">Sent</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Module</h1>
        <p className="text-muted-foreground">Manage quotes and sales work orders.</p>
      </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quotes Registry</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> New Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Quote</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="product_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Widget A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quote_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value ($)</FormLabel>
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
                            <FormLabel>Margin (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="expiration_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Create Quote
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.quote_number}</TableCell>
                      <TableCell>{quote.customer_name}</TableCell>
                      <TableCell>{quote.product_type}</TableCell>
                      <TableCell className="text-right">
                        ${Number(quote.quote_value || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>
                        {quote.sent_date ? format(new Date(quote.sent_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {quote.approval_date
                          ? format(new Date(quote.approval_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {quote.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
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
            <h2 className="text-xl font-semibold">Sales Work Orders</h2>
          </div>
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WO ID</TableHead>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                      No work orders created from quotes yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  workOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.id}</TableCell>
                      <TableCell>{wo.quoteNumber || 'N/A'}</TableCell>
                      <TableCell>{wo.customer}</TableCell>
                      <TableCell>{wo.productType}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{wo.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {wo.dueDate ? format(new Date(wo.dueDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${wo.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{wo.progress}%</span>
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
