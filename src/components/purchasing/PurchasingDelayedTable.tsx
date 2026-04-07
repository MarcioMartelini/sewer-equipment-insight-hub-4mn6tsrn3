import { useMemo } from 'react'
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
import { format, differenceInDays } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface PurchasingDelayedTableProps {
  components: any[]
  loading: boolean
}

export default function PurchasingDelayedTable({
  components,
  loading,
}: PurchasingDelayedTableProps) {
  const delayedComponents = useMemo(() => {
    const delayed = components
      .filter((c) => {
        const isDelivered =
          c.status?.toLowerCase() === 'delivered' || c.status?.toLowerCase() === 'entregue'
        if (isDelivered) return false
        if (!c.expected_delivery_date) return false
        return new Date(c.expected_delivery_date) < new Date()
      })
      .map((c) => {
        const daysDelayed = differenceInDays(new Date(), new Date(c.expected_delivery_date))
        return { ...c, daysDelayed }
      })

    return delayed.sort((a, b) => b.daysDelayed - a.daysDelayed).slice(0, 10)
  }, [components])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Delayed Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Delayed Components</CardTitle>
      </CardHeader>
      <CardContent>
        {delayedComponents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No delayed components found.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>WO Number</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Days Delayed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayedComponents.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.component_name}</TableCell>
                    <TableCell>{c.component_type}</TableCell>
                    <TableCell>{c.work_orders?.wo_number || 'N/A'}</TableCell>
                    <TableCell>
                      {c.expected_delivery_date
                        ? format(new Date(c.expected_delivery_date), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{c.daysDelayed} days</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{c.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
