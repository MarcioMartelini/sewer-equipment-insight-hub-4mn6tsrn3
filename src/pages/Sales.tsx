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
import SalesDashboard from '@/components/sales/SalesDashboard'

const quoteSchema = z.object({
  quote_number: z.string().min(1, 'Obrigatório'),
  customer_name: z.string().min(1, 'Obrigatório'),
  customer_city: z.string().min(1, 'Obrigatório'),
  customer_state: z.string().min(1, 'Obrigatório'),
  salesperson: z.string().min(1, 'Obrigatório'),
  product_family: z.string().min(1, 'Obrigatório'),
  machine_model: z.string().min(1, 'Obrigatório'),
  quote_value: z.coerce.number().min(0, 'Deve ser positivo'),
  profit_margin_percentage: z.coerce.number().min(0, 'Deve ser positivo'),
  special_custom: z.string().min(1, 'Obrigatório'),
  truck_information: z.string().min(1, 'Obrigatório'),
  truck_supplier: z.string().min(1, 'Obrigatório'),
  wo_number_ref: z.string().min(1, 'Obrigatório'),
  expected_completion_date: z.string().min(1, 'Obrigatório'),
  actual_completion_date: z.string().min(1, 'Obrigatório'),
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
      wo_number_ref: '',
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
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
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
      toast({ title: 'Cotação criada com sucesso' })
      setIsDialogOpen(false)
      form.reset()
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao criar cotação', variant: 'destructive' })
    }
  }

  const handleApprove = async (quote: Quote) => {
    try {
      setApprovingId(quote.id)
      await approveQuote(quote)
      toast({ title: 'Cotação aprovada e Ordem de Trabalho criada' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao aprovar cotação', variant: 'destructive' })
    } finally {
      setApprovingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Aprovada</Badge>
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'sent':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Enviada</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>
      case 'expired':
        return <Badge variant="destructive">Expirada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Módulo de Vendas</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie cotações e acompanhe as ordens de trabalho aprovadas.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-[600px] grid-cols-3 bg-slate-100">
          <TabsTrigger value="dashboard">Dashboard Executivo</TabsTrigger>
          <TabsTrigger value="quotes">Cotações</TabsTrigger>
          <TabsTrigger value="work-orders">Ordens de Trabalho</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Registro de Cotações</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Nova Cotação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Cotação</DialogTitle>
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
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
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
                            <FormControl>
                              <Input placeholder="Industrial" {...field} />
                            </FormControl>
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
                        name="wo_number_ref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WO Number</FormLabel>
                            <FormControl>
                              <Input placeholder="WO-12345" {...field} />
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
                      Criar Cotação
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
                  <TableHead className="font-semibold text-slate-700">ID da Cotação</TableHead>
                  <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                  <TableHead className="font-semibold text-slate-700">Produto</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Data de Envio</TableHead>
                  <TableHead className="font-semibold text-slate-700">Aprovação</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 h-24">
                      Nenhuma cotação encontrada.
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
                        {quote.sent_date ? format(new Date(quote.sent_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {quote.approval_date
                          ? format(new Date(quote.approval_date), 'dd/MM/yyyy')
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
                            Aprovar
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
            <h2 className="text-lg font-semibold text-slate-800">Ordens de Trabalho de Vendas</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700">ID da WO</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ref. Cotação</TableHead>
                  <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                  <TableHead className="font-semibold text-slate-700">Produto</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Prazo</TableHead>
                  <TableHead className="font-semibold text-slate-700">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 h-24">
                      Nenhuma ordem de trabalho originada de vendas.
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
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          {wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {wo.dueDate ? format(new Date(wo.dueDate), 'dd/MM/yyyy') : '-'}
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
