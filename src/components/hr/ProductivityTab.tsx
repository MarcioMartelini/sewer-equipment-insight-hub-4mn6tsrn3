import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Clock, Target, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default function ProductivityTab() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('current_month')
  const [customDates, setCustomDates] = useState({ start: '', end: '' })

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

  const fetchDashboardData = async () => {
    setLoading(true)
    const now = new Date()
    let startDateStr = ''
    let endDateStr = ''

    if (dateRange === 'current_month') {
      startDateStr = format(startOfMonth(now), 'yyyy-MM-dd')
      endDateStr = format(endOfMonth(now), 'yyyy-MM-dd')
    } else if (dateRange === 'custom') {
      if (!customDates.start || !customDates.end) {
        setLoading(false)
        return
      }
      startDateStr = customDates.start
      endDateStr = customDates.end
    } else {
      const days = parseInt(dateRange)
      startDateStr = format(subDays(now, days), 'yyyy-MM-dd')
      endDateStr = format(now, 'yyyy-MM-dd')
    }

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
      .gte('updated_at', `${startDateStr}T00:00:00`)
      .lte('updated_at', `${endDateStr}T23:59:59`)

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
      .gte('recorded_date', startDateStr)
      .lte('recorded_date', endDateStr)

    const hoursWorked = prods?.reduce((sum, p) => sum + (Number(p.labour_hours) || 0), 0) || 0

    // 4. Fetch Unexcused Absences
    const { data: abs } = await supabase
      .from('hr_absences')
      .select('id')
      .eq('absence_type', 'unexcused')
      .gte('absence_date', startDateStr)
      .lte('absence_date', endDateStr)

    const unexcusedAbsences = abs?.length || 0

    // 5. Calculate Metrics
    const hoursPer1000 = producedValue > 0 ? hoursWorked / (producedValue / 1000) : 0
    const availableHours =
      currentSetts.monthly_contracted_hours - unexcusedAbsences * currentSetts.hours_per_day

    setMetrics({ producedValue, hoursWorked, hoursPer1000, availableHours, unexcusedAbsences })
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange, customDates])

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
    fetchDashboardData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Productivity Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track period metrics and configure availability.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates((p) => ({ ...p, start: e.target.value }))}
                className="w-auto h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates((p) => ({ ...p, end: e.target.value }))}
                className="w-auto h-9"
              />
            </div>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
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
              {loading
                ? '-'
                : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
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
            <div className="text-2xl font-bold">
              {loading ? '-' : `${metrics.hoursWorked.toFixed(1)}h`}
            </div>
            <p className="text-xs text-muted-foreground">Total logged in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours per $1000</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : `${metrics.hoursPer1000.toFixed(2)}h`}
            </div>
            <p className="text-xs text-muted-foreground">Needed to produce $1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Available Hours</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : `${metrics.availableHours.toFixed(1)}h`}
            </div>
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
    </div>
  )
}
