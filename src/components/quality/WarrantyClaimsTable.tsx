import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

type ModalMode = 'create' | 'edit' | 'view' | null

const DEFAULT_FORM = {
  date: '',
  customer_name: '',
  product_family: '',
  machine_model: '',
  serial_number: '',
  occurrence_description: '',
  status: 'pending',
}

export function WarrantyClaimsTable() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    customer: '',
    family: '',
    model: '',
    start: '',
    end: '',
  })

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const [customers, setCustomers] = useState<string[]>([])
  const [productFamilies, setProductFamilies] = useState<string[]>([])
  const [machineModels, setMachineModels] = useState<string[]>([])

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchDropdownData = async () => {
    const { data: custData } = await supabase
      .from('customers')
      .select('customer_name')
      .order('customer_name')
    if (custData)
      setCustomers(Array.from(new Set(custData.map((c) => c.customer_name).filter(Boolean))))

    const { data: quotesData } = await supabase
      .from('quotes')
      .select('product_family, machine_model')
    if (quotesData) {
      setProductFamilies(
        Array.from(new Set(quotesData.map((q) => q.product_family).filter(Boolean))),
      )
      setMachineModels(Array.from(new Set(quotesData.map((q) => q.machine_model).filter(Boolean))))
    }
  }

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('warranty_claims')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.customer) query = query.ilike('customer_name', `%${filters.customer}%`)
    if (filters.family) query = query.ilike('product_family', `%${filters.family}%`)
    if (filters.model) query = query.ilike('machine_model', `%${filters.model}%`)
    if (filters.start) query = query.gte('date', filters.start)
    if (filters.end) query = query.lte('date', filters.end)

    const { data, error } = await query
    if (error) toast({ title: 'Error fetching data', variant: 'destructive' })
    else setClaims(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    fetchDropdownData()
  }, [])

  const handleOpenModal = (mode: ModalMode, claim?: any) => {
    setModalMode(mode)
    setFormData(claim ? { ...claim } : DEFAULT_FORM)
  }

  const handleSave = async () => {
    if (
      !formData.date ||
      !formData.customer_name ||
      !formData.product_family ||
      !formData.machine_model ||
      !formData.occurrence_description
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in all required fields (Date, Customer, Product Family, Machine Model, Occurrence Description).',
        variant: 'destructive',
      })
      return
    }

    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('warranty_claims')
          .insert({ ...formData, created_by: user?.id })
        if (error) throw error
      } else if (modalMode === 'edit' && formData.id) {
        const { id, created_at, updated_at, created_by, ...updateData } = formData as any
        const { error } = await supabase.from('warranty_claims').update(updateData).eq('id', id)
        if (error) throw error
      }

      toast({
        title: modalMode === 'create' ? 'Claim created successfully' : 'Claim updated successfully',
      })
      setModalMode(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error saving claim',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    const { error } = await supabase.from('warranty_claims').delete().eq('id', itemToDelete.id)
    if (error) {
      toast({ title: 'Error deleting claim', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Claim deleted successfully' })
      fetchData()
    }
    setItemToDelete(null)
  }

  const clearFilters = () => {
    setFilters({ customer: '', family: '', model: '', start: '', end: '' })
    setTimeout(fetchData, 100)
  }

  const formatDate = (d: string) => {
    if (!d) return '-'
    const [y, m, day] = d.split('T')[0].split('-')
    return `${day}/${m}/${y}`
  }

  const isReadOnly = modalMode === 'view'

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl">Warranty Claims Registry</CardTitle>
        <Button
          className="bg-[#1511f2] hover:bg-[#1511f2]/90"
          onClick={() => handleOpenModal('create')}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Warranty Claim
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Filters */}
        <div className="bg-slate-50 border rounded-lg p-4 mb-6 flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Customer</Label>
              <Input
                placeholder="Search customer..."
                value={filters.customer}
                onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Product Family</Label>
              <Input
                placeholder="Search family..."
                value={filters.family}
                onChange={(e) => setFilters({ ...filters, family: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Machine Model</Label>
              <Input
                placeholder="Search model..."
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Date Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filters.start}
                  onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                />
                <span className="text-slate-400">-</span>
                <Input
                  type="date"
                  value={filters.end}
                  onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} className="w-full xl:w-auto">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
            <Button variant="outline" onClick={clearFilters} className="w-full xl:w-auto">
              <X className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>S/N</TableHead>
                <TableHead>Occurrence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{formatDate(c.date)}</TableCell>
                    <TableCell className="font-medium">{c.customer_name || '-'}</TableCell>
                    <TableCell>{c.product_family || '-'}</TableCell>
                    <TableCell>{c.machine_model || '-'}</TableCell>
                    <TableCell>{c.serial_number || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={c.occurrence_description}>
                      {c.occurrence_description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'resolved' ? 'default' : 'secondary'}>
                        {c.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal('view', c)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal('edit', c)}
                          title="Edit claim"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItemToDelete(c)}
                          title="Delete claim"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modals */}
        <Dialog open={!!modalMode} onOpenChange={(o) => !o && setModalMode(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'create'
                  ? 'New Warranty Claim'
                  : modalMode === 'edit'
                    ? 'Edit Warranty Claim'
                    : 'Warranty Claim Details'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Date</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Customer
                </Label>
                <Select
                  disabled={isReadOnly}
                  value={formData.customer_name || ''}
                  onValueChange={(v) => setFormData({ ...formData, customer_name: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    {formData.customer_name && !customers.includes(formData.customer_name) && (
                      <SelectItem value={formData.customer_name}>
                        {formData.customer_name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Product Family
                </Label>
                <Select
                  disabled={isReadOnly}
                  value={formData.product_family || ''}
                  onValueChange={(v) => setFormData({ ...formData, product_family: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family" />
                  </SelectTrigger>
                  <SelectContent>
                    {productFamilies.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                    {formData.product_family &&
                      !productFamilies.includes(formData.product_family) && (
                        <SelectItem value={formData.product_family}>
                          {formData.product_family}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Machine Model
                </Label>
                <Select
                  disabled={isReadOnly}
                  value={formData.machine_model || ''}
                  onValueChange={(v) => setFormData({ ...formData, machine_model: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                    {formData.machine_model && !machineModels.includes(formData.machine_model) && (
                      <SelectItem value={formData.machine_model}>
                        {formData.machine_model}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serial Number (S/N)</Label>
                <Input
                  value={formData.serial_number || ''}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  disabled={isReadOnly}
                  value={formData.status || 'pending'}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Occurrence Description
                </Label>
                <Textarea
                  value={formData.occurrence_description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, occurrence_description: e.target.value })
                  }
                  disabled={isReadOnly}
                  rows={4}
                  placeholder="Describe the occurrence..."
                />
              </div>
            </div>
            {!isReadOnly && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalMode(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-[#1511f2]">
                  Save Claim
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!itemToDelete} onOpenChange={(o) => !o && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the warranty claim from
                the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
