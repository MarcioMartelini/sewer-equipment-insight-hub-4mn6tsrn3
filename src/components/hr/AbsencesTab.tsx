import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AbsencesTab() {
  const [data, setData] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data: absData, error } = await supabase
      .from('hr_absences')
      .select('*')
      .order('absence_date', { ascending: false })

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
    else setData(absData || [])
    setLoading(false)
  }

  const fetchDependencies = async () => {
    const { data: uData } = await supabase.from('users').select('id, full_name').order('full_name')
    if (uData) setUsers(uData)

    const { data: dData } = await supabase.from('departments').select('name').order('name')
    if (dData) setDepartments(dData)
  }

  useEffect(() => {
    fetchData()
    fetchDependencies()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const employeeId = formData.get('employee_id') as string
    const employee = users.find((u) => u.id === employeeId)

    if (!employeeId || !employee) {
      return toast({ title: 'Error', description: 'Select an employee.', variant: 'destructive' })
    }

    const isExcused = formData.get('is_excused') === 'on'
    const absenceType = isExcused ? 'excused' : 'unexcused'

    const payload = {
      employee_id: employeeId,
      employee_name: employee.full_name,
      absence_date: formData.get('absence_date') as string,
      absence_type: absenceType,
      reason: formData.get('reason') as string,
      department: formData.get('department') as string,
      supervisor: formData.get('supervisor') as string,
    }

    if (editingItem) {
      const { error } = await supabase.from('hr_absences').update(payload).eq('id', editingItem.id)
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'Success', description: 'Absence updated.' })
        setEditingItem(null)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('hr_absences').insert(payload)
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'Success', description: 'Absence recorded.' })
        setIsAddOpen(false)
        fetchData()
      }
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('T')[0].split('-')
    return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : dateStr
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Absence Control</CardTitle>
          <CardDescription>Record of excused and unexcused absences.</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Absence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Absence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee Name</Label>
                <Select name="employee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select name="department">
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Select name="supervisor">
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.full_name}>
                          {u.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="absence_date">Absence Date</Label>
                <Input id="absence_date" name="absence_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason / Motivo</Label>
                <Input id="reason" name="reason" required />
              </div>
              <div className="flex items-center space-x-2 pt-2 pb-4">
                <Checkbox id="is_excused" name="is_excused" defaultChecked={false} />
                <Label htmlFor="is_excused" className="font-normal cursor-pointer">
                  Justifiable / Excused Absence
                </Label>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Dept / Supervisor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employee_name}</TableCell>
                    <TableCell>{formatDate(item.absence_date)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{item.department || '-'}</div>
                      <div className="text-xs text-muted-foreground">{item.supervisor || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.absence_type === 'excused' ? 'default' : 'destructive'}>
                        {item.absence_type === 'excused' ? 'Excused' : 'Unexcused'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Absence</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee Name</Label>
              <Select name="employee_id" defaultValue={editingItem?.employee_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select name="department" defaultValue={editingItem?.department}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select name="supervisor" defaultValue={editingItem?.supervisor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.full_name}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="absence_date">Absence Date</Label>
              <Input
                id="absence_date"
                name="absence_date"
                type="date"
                defaultValue={editingItem?.absence_date}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Motivo</Label>
              <Input id="reason" name="reason" defaultValue={editingItem?.reason} required />
            </div>
            <div className="flex items-center space-x-2 pt-2 pb-4">
              <Checkbox
                id="edit_is_excused"
                name="is_excused"
                defaultChecked={editingItem?.absence_type === 'excused'}
              />
              <Label htmlFor="edit_is_excused" className="font-normal cursor-pointer">
                Justifiable / Excused Absence
              </Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-[#000aff]" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
