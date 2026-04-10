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

export default function PurchasingTopSuppliers({
  tasks,
  loading,
}: {
  tasks: any[]
  loading: boolean
}) {
  const topSuppliers = useMemo(() => {
    const stats: Record<string, { totalValue: number; taskCount: number }> = {}

    tasks.forEach((t) => {
      if (!t.supplier) return
      if (!stats[t.supplier]) stats[t.supplier] = { totalValue: 0, taskCount: 0 }
      stats[t.supplier].taskCount += 1
      stats[t.supplier].totalValue += t.total_price || 0
    })

    return Object.entries(stats)
      .map(([supplier, stat]) => ({
        supplier,
        ...stat,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
  }, [tasks])

  if (loading) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Suppliers by Total Value</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                  No supplier data available
                </TableCell>
              </TableRow>
            ) : (
              topSuppliers.map((s, i) => (
                <TableRow key={s.supplier}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-4">{i + 1}.</span>
                      {s.supplier}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{s.taskCount}</TableCell>
                  <TableCell className="text-right">
                    $
                    {s.totalValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
