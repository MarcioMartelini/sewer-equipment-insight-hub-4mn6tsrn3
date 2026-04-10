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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function InjuriesTab() {
  const [data, setData] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data: injData, error } = await supabase
      .from('hr_injuries')
      .select('*')
      .order('injury_date', { ascending: false })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setData(injData || [])
    }
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

    const payload = {
      employee_id: employeeId,
      employee_name: employee.full_name,
      injury_date: formData.get('injury_date') as string,
      injury_description: formData.get('injury_description') as string,
      injury_type: formData.get('injury_type') as string,
      severity_level: formData.get('severity_level') as string,
      department: formData.get('department') as string,
      supervisor: formData.get('supervisor') as string,
    }

    if (editingItem) {
      const { error } = await supabase.from('hr_injuries').update(payload).eq('id', editingItem.id)
      if (error)
        toast({ title: 'Error updating', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'Success', description: 'Injury updated.' })
        setEditingItem(null)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('hr_injuries').insert(payload)
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'Success', description: 'Injury recorded.' })
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
          <CardTitle>Workplace Safety</CardTitle>
          <CardDescription>Record of incidents and injuries.</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Injury
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Injury</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee</Label>
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
                <Label htmlFor="injury_date">Injury Date</Label>
                <Input id="injury_date" name="injury_date" type="date" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="injury_type">Injury Type</Label>
                  <Select name="injury_type" required defaultValue="non-recordable">
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recordable">Recordable</SelectItem>
                      <SelectItem value="non-recordable">Non-recordable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity_level">Severity Level</Label>
                  <Select name="severity_level" required defaultValue="Low">
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="injury_description">Description</Label>
                <Textarea id="injury_description" name="injury_description" required />
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
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
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
                    <TableCell>{formatDate(item.injury_date)}</TableCell>
                    <TableCell>{item.department || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.injury_type === 'recordable' ? 'destructive' : 'secondary'}
                      >
                        {item.injury_type === 'recordable' ? 'Recordable' : 'Non-recordable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{item.severity_level}</span>
                    </TableCell>
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
            <DialogTitle>Edit Injury</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
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
              <Label htmlFor="injury_date">Injury Date</Label>
              <Input
                id="injury_date"
                name="injury_date"
                type="date"
                defaultValue={editingItem?.injury_date}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="injury_type">Injury Type</Label>
                <Select name="injury_type" defaultValue={editingItem?.injury_type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recordable">Recordable</SelectItem>
                    <SelectItem value="non-recordable">Non-recordable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity_level">Severity Level</Label>
                <Select name="severity_level" defaultValue={editingItem?.severity_level} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="injury_description">Description</Label>
              <Textarea
                id="injury_description"
                name="injury_description"
                defaultValue={editingItem?.injury_description}
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-[#0030ff]" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
