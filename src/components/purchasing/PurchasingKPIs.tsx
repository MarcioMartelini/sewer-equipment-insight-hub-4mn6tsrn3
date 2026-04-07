import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface PurchasingKPIsProps {
  components: any[]
  expedites: any[]
  loading: boolean
}

export default function PurchasingKPIs({ components, expedites, loading }: PurchasingKPIsProps) {
  const totalOrdered = components.length

  const delivered = components.filter(
    (c) => c.status?.toLowerCase() === 'delivered' || c.status?.toLowerCase() === 'entregue',
  )
  const totalDelivered = delivered.length

  const onTime = delivered.filter((c) => {
    if (!c.expected_delivery_date || !c.actual_delivery_date) return false
    return new Date(c.actual_delivery_date) <= new Date(c.expected_delivery_date)
  }).length

  const onTimeRate = totalDelivered > 0 ? Math.round((onTime / totalDelivered) * 100) : 0
  const totalExpedites = expedites.length

  const delayed = components.filter((c) => {
    const isDelivered =
      c.status?.toLowerCase() === 'delivered' || c.status?.toLowerCase() === 'entregue'
    if (isDelivered) {
      if (c.actual_delivery_date && c.expected_delivery_date) {
        return new Date(c.actual_delivery_date) > new Date(c.expected_delivery_date)
      }
      return false
    } else {
      if (c.expected_delivery_date) {
        return new Date(c.expected_delivery_date) < new Date()
      }
      return false
    }
  }).length

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ordered</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrdered}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDelivered}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onTimeRate}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expedites</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalExpedites}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delayed</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{delayed}</div>
        </CardContent>
      </Card>
    </div>
  )
}
