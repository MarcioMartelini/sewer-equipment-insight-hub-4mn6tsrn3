import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchSalespersons,
  createSalesperson,
  updateSalesperson,
  deleteSalesperson,
  type Salesperson,
} from '@/services/salespersons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import SalespersonFormModal from './SalespersonFormModal'

export default function SalespersonsList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [data, setData] = useState<Salesperson[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selected, setSelected] = useState<Salesperson | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchSalespersons())
    } catch (error) {
      toast({ title: 'Error loading salespersons', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const regions = useMemo(
    () => Array.from(new Set(data.map((d) => d.region).filter(Boolean))) as string[],
    [data],
  )
  const depts = useMemo(
    () => Array.from(new Set(data.map((d) => d.department).filter(Boolean))) as string[],
    [data],
  )

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchRegion = regionFilter === 'all' || s.region === regionFilter
      const matchDept = deptFilter === 'all' || s.department === deptFilter

      let matchDate = true
      if (dateFrom || dateTo) {
        const d = new Date(s.created_at)
        if (dateFrom && d < new Date(dateFrom)) matchDate = false
        if (dateTo && d > new Date(dateTo)) matchDate = false
      }
      return matchSearch && matchStatus && matchRegion && matchDept && matchDate
    })
  }, [data, search, statusFilter, regionFilter, deptFilter, dateFrom, dateTo])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, regionFilter, deptFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      if (selected) await updateSalesperson(selected.id, formData)
      else await createSalesperson(formData)
      toast({ title: `Salesperson ${selected ? 'updated' : 'created'} successfully` })
      setIsFormOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Error saving salesperson', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      await deleteSalesperson(selected.id)
      toast({ title: 'Salesperson deleted successfully' })
      setIsDeleteOpen(false)
      loadData()
    } catch (error) {
      toast({ title: 'Error deleting salesperson', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-slate-800">Sales Team</h2>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => {
            setSelected(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Salesperson
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="lg:col-span-2">
          <Label className="text-xs text-slate-500 mb-1">Search</Label>
          <Input
            placeholder="Name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1">Region</Label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
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

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dept & Region</TableHead>
              <TableHead className="text-right">Total WOs</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 h-24">
                  No salespersons found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((sp) => (
                <TableRow key={sp.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{sp.salesperson_id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{sp.name}</p>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <p>{sp.email || '-'}</p>
                    <p>{sp.phone || '-'}</p>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <p>{sp.department || '-'}</p>
                    <p className="text-slate-400">{sp.region || '-'}</p>
                  </TableCell>
                  <TableCell className="text-right font-medium">{sp.total_wos}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(sp.total_revenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sp.status === 'Active' ? 'default' : 'secondary'}
                      className={sp.status === 'Active' ? 'bg-emerald-500' : ''}
                    >
                      {sp.status}
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
                        <DropdownMenuItem onClick={() => navigate(`/sales/salespersons/${sp.id}`)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/sales/salespersons/${sp.id}?tab=wos`)}
                        >
                          <History className="w-4 h-4 mr-2" /> WO History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelected(sp)
                            setIsFormOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelected(sp)
                            setIsDeleteOpen(true)
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <span className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SalespersonFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        salesperson={selected}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Salesperson</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 my-4">
            Are you sure you want to delete this salesperson? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
