import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Edit,
  Factory,
  History,
  Info,
  Tag,
  Calendar,
  DollarSign,
  Truck,
  ClipboardList,
  Trash2,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useDashboardExport } from '@/hooks/use-dashboard-export'

import {
  fetchQuoteById,
  fetchQuoteHistory,
  fetchQuoteVersions,
  updateQuote,
  restoreQuoteVersion,
  convertToWorkOrder,
  softDeleteQuote,
  Quote,
} from '@/services/quotes'

const quoteSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  salesperson: z.string().optional(),
  product_family: z.string().optional(),
  machine_model: z.string().optional(),
  quote_value: z.coerce.number().optional(),
  profit_margin_percentage: z.coerce.number().optional(),
  special_custom: z.string().optional(),
  truck_information: z.string().optional(),
  truck_supplier: z.string().optional(),
  wo_number_ref: z.string().optional(),
  status: z.string().optional(),
  expected_completion_date: z.string().optional(),
  actual_completion_date: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [convertWoNumber, setConvertWoNumber] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<any>(null)

  const exportRef = useRef<HTMLDivElement>(null)
  const { isExporting, handleExportPDF } = useDashboardExport(
    exportRef,
    quote ? `Quote_${quote.quote_number}` : 'Quote Detail',
  )

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customer_name: '',
      salesperson: '',
      product_family: '',
      machine_model: '',
      quote_value: 0,
      profit_margin_percentage: 0,
      special_custom: '',
      truck_information: '',
      truck_supplier: '',
      wo_number_ref: '',
      status: '',
      expected_completion_date: '',
      actual_completion_date: '',
    },
  })

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [quoteData, historyData, versionsData] = await Promise.all([
        fetchQuoteById(id),
        fetchQuoteHistory(id),
        fetchQuoteVersions(id),
      ])
      setQuote(quoteData)
      setHistory(historyData)
      setVersions(versionsData)
      form.reset({
        customer_name: quoteData.customer_name || '',
        salesperson: quoteData.salesperson || '',
        product_family: quoteData.product_family || '',
        machine_model: quoteData.machine_model || '',
        quote_value: quoteData.quote_value || 0,
        profit_margin_percentage: quoteData.profit_margin_percentage || 0,
        special_custom: quoteData.special_custom || '',
        truck_information: quoteData.truck_information || '',
        truck_supplier: quoteData.truck_supplier || '',
        wo_number_ref: quoteData.wo_number_ref || '',
        status: quoteData.status || '',
        expected_completion_date: quoteData.expected_completion_date || '',
        actual_completion_date: quoteData.actual_completion_date || '',
      })
    } catch (error: any) {
      toast({ title: 'Error fetching quote', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id, form, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmitEdit = async (data: QuoteFormValues) => {
    if (!id) return
    try {
      const payload = {
        ...data,
        expected_completion_date: data.expected_completion_date || null,
        actual_completion_date: data.actual_completion_date || null,
      }
      await updateQuote(id, payload)
      toast({ title: 'Success', description: 'Quote updated successfully' })
      setIsEditModalOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const onDeleteConfirm = async () => {
    if (!id) return
    try {
      await softDeleteQuote(id)
      toast({ title: 'Success', description: 'Quote deleted successfully' })
      setIsDeleteModalOpen(false)
      navigate('/sales')
    } catch (error: any) {
      toast({ title: 'Error deleting quote', description: error.message, variant: 'destructive' })
    }
  }

  const onConvert = async () => {
    if (!id || !convertWoNumber) {
      toast({
        title: 'Validation Error',
        description: 'WO Number is required',
        variant: 'destructive',
      })
      return
    }
    try {
      await convertToWorkOrder(id, convertWoNumber)
      toast({ title: 'Success', description: 'Quote converted to Work Order' })
      setIsConvertModalOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: 'Error converting to WO', description: error.message, variant: 'destructive' })
    }
  }

  const onRestoreConfirm = async () => {
    if (!id || !selectedVersion) return
    try {
      await restoreQuoteVersion(id, selectedVersion.quote_data)
      toast({
        title: 'Success',
        description: `Quote restored to version ${selectedVersion.version_number}`,
      })
      setIsRestoreModalOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: 'Error restoring quote', description: error.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Quote not found</h2>
        <Button onClick={() => navigate('/sales')}>Back to Sales</Button>
      </div>
    )
  }

  const formatCurrency = (val: number | null | undefined) =>
    val != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
      : '-'

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'converted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" ref={exportRef}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/sales')}
            data-html2canvas-ignore
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {quote.quote_number}
              <Badge className={getStatusColor(quote.status)} variant="outline">
                {quote.status.toUpperCase()}
              </Badge>
            </h2>
            <p className="text-muted-foreground">{quote.customer_name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-html2canvas-ignore>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </Button>
          <Button
            onClick={() => setIsConvertModalOpen(true)}
            disabled={quote.status === 'converted'}
          >
            <Factory className="mr-2 h-4 w-4" />
            Convert to WO
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Quote
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Info</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quote.customer_name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Salesperson: {quote.salesperson || 'Unassigned'}
                </p>
                {(quote.customer_city || quote.customer_state) && (
                  <p className="text-xs text-muted-foreground">
                    Location: {quote.customer_city} {quote.customer_state}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financials</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(quote.quote_value)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Profit Margin:{' '}
                  {quote.profit_margin_percentage ? `${quote.profit_margin_percentage}%` : '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Details</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{quote.product_family || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Model: {quote.machine_model || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" /> Detailed Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Special Custom</span>
                    <span className="text-sm font-medium">{quote.special_custom || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">WO Number Ref</span>
                    <span className="text-sm font-medium">{quote.wo_number_ref || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5" /> Truck Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Supplier</span>
                    <span className="text-sm font-medium">{quote.truck_supplier || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Details</span>
                    <span className="text-sm font-medium">{quote.truck_information || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" /> Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Date Created</span>
                    <span className="text-sm font-medium">
                      {quote.created_at ? format(new Date(quote.created_at), 'PPP') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Date Order</span>
                    <span className="text-sm font-medium">
                      {quote.date_order ? format(new Date(quote.date_order), 'PPP') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">
                      Expected Completion
                    </span>
                    <span className="text-sm font-medium">
                      {quote.expected_completion_date
                        ? format(new Date(quote.expected_completion_date), 'PPP')
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">
                      Actual Completion
                    </span>
                    <span className="text-sm font-medium">
                      {quote.actual_completion_date
                        ? format(new Date(quote.actual_completion_date), 'PPP')
                        : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Update History
              </CardTitle>
              <CardDescription>All tracked changes made to this quote.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Field Changed</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.changed_at ? format(new Date(record.changed_at), 'PPP p') : '-'}
                        </TableCell>
                        <TableCell>{record.user?.full_name || 'System'}</TableCell>
                        <TableCell>
                          {record.action ? <Badge variant="outline">{record.action}</Badge> : '-'}
                        </TableCell>
                        <TableCell className="font-medium capitalize">
                          {record.field_changed ? record.field_changed.replace(/_/g, ' ') : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.old_value || '-'}
                        </TableCell>
                        <TableCell>{record.new_value || '-'}</TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[200px] truncate"
                          title={record.notes}
                        >
                          {record.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  No history records found for this quote.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Version History
              </CardTitle>
              <CardDescription>View and restore previous versions of this quote.</CardDescription>
            </CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Saved By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((v, index) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            v{v.version_number} {index === 0 && '(Current)'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {v.created_at ? format(new Date(v.created_at), 'PPP p') : '-'}
                        </TableCell>
                        <TableCell>{v.user?.full_name || 'System'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(v.quote_data.status)}>
                            {v.quote_data.status?.toUpperCase() || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(v.quote_data.quote_value)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => {
                              setSelectedVersion(v)
                              setIsRestoreModalOpen(true)
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  No versions found for this quote.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
            <DialogDescription>Update the details of the quote here.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Expected Completion Date</FormLabel>
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
                      <FormLabel>Actual Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="special_custom"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Special Custom</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="truck_information"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Truck Information</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Convert to Work Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to convert this quote to a work order? Provide a WO Number
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="woNumber" className="text-right">
                WO Number
              </FormLabel>
              <Input
                id="woNumber"
                value={convertWoNumber}
                onChange={(e) => setConvertWoNumber(e.target.value)}
                className="col-span-3"
                placeholder="e.g. WO-12345"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConvert}>Convert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteConfirm}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this quote to version{' '}
              {selectedVersion?.version_number}? This will overwrite the current data with the data
              from{' '}
              {selectedVersion?.created_at
                ? format(new Date(selectedVersion.created_at), 'PPP p')
                : ''}
              . A new version will be created to preserve the current state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onRestoreConfirm}>Confirm Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
