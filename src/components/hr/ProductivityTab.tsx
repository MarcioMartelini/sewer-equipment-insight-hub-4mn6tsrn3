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
import { Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProductivityTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data: prodData, error } = await supabase
      .from('hr_productivity')
      .select('*, work_orders(wo_number)')
      .order('recorded_date', { ascending: false })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setData(prodData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const labourHours = Number(formData.get('labour_hours'))
    const prodValue = Number(formData.get('production_value'))
    const ratio = prodValue > 0 ? labourHours / (prodValue / 1000) : null

    const { error } = await supabase
      .from('hr_productivity')
      .update({
        labour_hours: labourHours,
        production_value: prodValue,
        productivity_ratio: ratio,
      })
      .eq('id', editingItem.id)

    if (error) {
      toast({ title: 'Error updating', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Data updated successfully.' })
      setEditingItem(null)
      fetchData()
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('T')[0].split('-')
    return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : dateStr
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity</CardTitle>
        <CardDescription>Tracking of hours worked and production value.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Produced Value</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.work_orders?.wo_number || item.wo_id || '-'}</TableCell>
                    <TableCell className="font-medium">{item.employee_name}</TableCell>
                    <TableCell>{formatDate(item.recorded_date)}</TableCell>
                    <TableCell>{item.labour_hours}h</TableCell>
                    <TableCell>
                      {item.production_value
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.production_value)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {item.productivity_ratio !== null ? (
                        <Badge variant="outline" className="font-mono">
                          {Number(item.productivity_ratio).toFixed(2)}
                        </Badge>
                      ) : (
                        '-'
                      )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Productivity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labour_hours">Hours Worked</Label>
              <Input
                id="labour_hours"
                name="labour_hours"
                type="number"
                step="0.01"
                defaultValue={editingItem?.labour_hours}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="production_value">Produced Value ($)</Label>
              <Input
                id="production_value"
                name="production_value"
                type="number"
                step="0.01"
                defaultValue={editingItem?.production_value}
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
