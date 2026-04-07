import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchCustomers, type Customer } from '@/services/customers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  History,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomerFormDialog from './CustomerFormDialog'
import CustomerDeleteDialog from './CustomerDeleteDialog'

export default function CustomersList() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [lastWoFrom, setLastWoFrom] = useState('')
  const [lastWoTo, setLastWoTo] = useState('')

  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | undefined>()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
    } catch (error) {
      toast({ title: 'Error loading customers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const uniqueCountries = useMemo(
    () => Array.from(new Set(customers.map((c) => c.country).filter(Boolean))),
    [customers],
  )
  const uniqueStates = useMemo(
    () => Array.from(new Set(customers.map((c) => c.state).filter(Boolean))),
    [customers],
  )

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        (c.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesCountry = countryFilter === 'all' || c.country === countryFilter
      const matchesState = stateFilter === 'all' || c.state === stateFilter

      let matchesDate = true
      if (lastWoFrom || lastWoTo) {
        if (!c.last_wo_date) {
          matchesDate = false
        } else {
          const d = new Date(c.last_wo_date)
          if (lastWoFrom && new Date(lastWoFrom) > d) matchesDate = false
          if (lastWoTo && new Date(lastWoTo) < d) matchesDate = false
        }
      }

      return matchesSearch && matchesStatus && matchesCountry && matchesState && matchesDate
    })
  }, [customers, search, statusFilter, countryFilter, stateFilter, lastWoFrom, lastWoTo])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, countryFilter, stateFilter, lastWoFrom, lastWoTo])

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
      </div>
    )

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Customers Registry</h2>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            setEditingCustomer(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="lg:col-span-2">
          <label className="text-xs text-slate-500 mb-1 block">Search</label>
          <Input
            placeholder="Name, Email, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Country</label>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueCountries.map((c) => (
                <SelectItem key={c as string} value={c as string}>
                  {c as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Last WO From</label>
          <Input type="date" value={lastWoFrom} onChange={(e) => setLastWoFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Last WO To</label>
          <Input type="date" value={lastWoTo} onChange={(e) => setLastWoTo(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Total WOs</TableHead>
                <TableHead>Last WO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{c.customer_id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{c.customer_name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-700">{c.contact_person || '-'}</div>
                      <div className="text-xs text-slate-500">{c.phone || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-700">
                        {c.city}
                        {c.city && c.state ? ', ' : ''}
                        {c.state}
                      </div>
                      <div className="text-xs text-slate-500">{c.country || '-'}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{c.total_wos}</TableCell>
                    <TableCell className="text-slate-500">
                      {c.last_wo_date ? format(new Date(c.last_wo_date), 'MM/dd/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === 'Active' ? 'default' : 'secondary'}
                        className={
                          c.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingCustomer(c)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast({
                                title: 'Customer Details',
                                description: 'Feature coming soon.',
                              })
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast({ title: 'WO History', description: 'Feature coming soon.' })
                            }
                          >
                            <History className="w-4 h-4 mr-2" /> WO History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingId(c.id)
                              setDeleteOpen(true)
                            }}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <div className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        onSuccess={loadData}
      />
      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customerId={deletingId}
        onSuccess={loadData}
      />
    </div>
  )
}
