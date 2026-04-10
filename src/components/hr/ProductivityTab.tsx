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
import { Pencil, DollarSign, Clock, Target, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProductivityTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7))

  const [settings, setSettings] = useState({
    monthly_contracted_hours: 160,
    hours_per_day: 8,
    id: null,
  })
  const [metrics, setMetrics] = useState({
    producedValue: 0,
    hoursWorked: 0,
    hoursPer1000: 0,
    availableHours: 0,
    unexcusedAbsences: 0,
  })
  const { toast } = useToast()

  const fetchDashboardData = async (selectedPeriod: string) => {
    setLoading(true)
    const startDate = `${selectedPeriod}-01`
    const dateObj = new Date(selectedPeriod + '-01T00:00:00')
    const endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1)
      .toISOString()
      .split('T')[0]

    // 1. Fetch settings
    const { data: setts } = await supabase
      .from('hr_settings' as any)
      .select('*')
      .eq('department', 'HR')
      .single()
    const currentSetts = setts || { monthly_contracted_hours: 160, hours_per_day: 8, id: null }
    setSettings(currentSetts)

    // 2. Fetch Value Produced (Finished WOs)
    const { data: wos } = await supabase
      .from('work_orders')
      .select('price, status, progress, updated_at')
      .gte('updated_at', startDate)
      .lt('updated_at', endDate)

    const producedValue =
      wos
        ?.filter(
          (wo) =>
            wo.progress === 100 ||
            (wo.status && wo.status.toLowerCase().includes('conclu')) ||
            (wo.status && wo.status.toLowerCase().includes('finaliza')) ||
            (wo.status && wo.status.toLowerCase().includes('complet')),
        )
        .reduce((sum, wo) => sum + (Number(wo.price) || 0), 0) || 0

    // 3. Fetch Hours Worked
    const { data: prods } = await supabase
      .from('hr_productivity')
      .select('labour_hours')
      .gte('recorded_date', startDate)
      .lt('recorded_date', endDate)

    const hoursWorked = prods?.reduce((sum, p) => sum + (Number(p.labour_hours) || 0), 0) || 0

    // 4. Fetch Unexcused Absences
    const { data: abs } = await supabase
      .from('hr_absences')
      .select('id')
      .eq('absence_type', 'unexcused')
      .gte('absence_date', startDate)
      .lt('absence_date', endDate)

    const unexcusedAbsences = abs?.length || 0

    // 5. Calculate Metrics
    const hoursPer1000 = producedValue > 0 ? hoursWorked / (producedValue / 1000) : 0
    const availableHours =
      currentSetts.monthly_contracted_hours - unexcusedAbsences * currentSetts.hours_per_day

    setMetrics({ producedValue, hoursWorked, hoursPer1000, availableHours, unexcusedAbsences })

    // 6. Fetch Productivity Table Data
    const { data: prodData, error } = await supabase
      .from('hr_productivity')
      .select('*, work_orders(wo_number)')
      .gte('recorded_date', startDate)
      .lt('recorded_date', endDate)
      .order('recorded_date', { ascending: false })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setData(prodData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData(period)
  }, [period])

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const monthly = Number(formData.get('monthly'))
    const daily = Number(formData.get('daily'))

    if (settings.id) {
      await supabase
        .from('hr_settings' as any)
        .update({ monthly_contracted_hours: monthly, hours_per_day: daily })
        .eq('id', settings.id)
    } else {
      await supabase
        .from('hr_settings' as any)
        .insert({ department: 'HR', monthly_contracted_hours: monthly, hours_per_day: daily })
    }

    toast({ title: 'Success', description: 'Settings updated successfully.' })
    fetchDashboardData(period)
  }

  const handleSaveProductivity = async (e: React.FormEvent<HTMLFormElement>) => {
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
      fetchDashboardData(period)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('T')[0].split('-')
    return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : dateStr
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productivity Dashboard</h2>
          <p className="text-muted-foreground">Track period metrics and configure availability.</p>
        </div>
        <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
          <Label htmlFor="period" className="whitespace-nowrap">
            Period:
          </Label>
          <Input
            id="period"
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border-0 p-0 h-auto focus-visible:ring-0 w-[130px]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produced Value ($)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                metrics.producedValue,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Finished WOs in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hoursWorked.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Total logged in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours per $1000</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hoursPer1000.toFixed(2)}h</div>
            <p className="text-xs text-muted-foreground">Needed to produce $1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Available Hours</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.availableHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Contracted minus {metrics.unexcusedAbsences} unexcused absences
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Schedule Settings</CardTitle>
          <CardDescription>Set the baseline for availability calculations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-auto">
              <Label htmlFor="monthly">Monthly Contracted Hours</Label>
              <Input
                id="monthly"
                name="monthly"
                type="number"
                step="0.1"
                defaultValue={settings.monthly_contracted_hours}
                required
              />
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <Label htmlFor="daily">Hours Worked per Day</Label>
              <Input
                id="daily"
                name="daily"
                type="number"
                step="0.1"
                defaultValue={settings.hours_per_day}
                required
              />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-[#0500ff]">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productivity Logs</CardTitle>
          <CardDescription>
            Tracking of hours worked and production value per entry.
          </CardDescription>
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
                      No records found for this period.
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
            <form onSubmit={handleSaveProductivity} className="space-y-4">
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
    </div>
  )
}
