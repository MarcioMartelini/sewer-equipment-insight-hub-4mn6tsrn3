import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { format, parseISO, isSameDay, subDays } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface PurchasingChartsProps {
  components: any[]
  loading: boolean
}

export default function PurchasingCharts({ components, loading }: PurchasingChartsProps) {
  const progressData = useMemo(() => {
    const types = [
      'Engine',
      'Hydraulics',
      'Water Pump',
      'Water Tank',
      'Debris Box',
      'Blower',
      'Van Air',
      'Sewer Hose',
      'Shroud',
    ]
    return types.map((type) => {
      const typeComps = components.filter((c) => c.component_type === type)
      const total = typeComps.length
      const delivered = typeComps.filter(
        (c) => c.status?.toLowerCase() === 'delivered' || c.status?.toLowerCase() === 'entregue',
      ).length
      return {
        type,
        percentage: total > 0 ? Math.round((delivered / total) * 100) : 0,
        total,
        delivered,
      }
    })
  }, [components])

  const trendData = useMemo(() => {
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const deliveredOnDate = components.filter((c) => {
        if (
          (c.status?.toLowerCase() === 'delivered' || c.status?.toLowerCase() === 'entregue') &&
          c.actual_delivery_date
        ) {
          try {
            return isSameDay(parseISO(c.actual_delivery_date), date)
          } catch (e) {
            return false
          }
        }
        return false
      }).length
      data.push({
        date: format(date, 'MMM dd'),
        delivered: deliveredOnDate,
      })
    }
    return data
  }, [components])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="h-[350px] p-6">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="h-[350px] p-6">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Progress by Component Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ percentage: { label: 'Delivery %', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickMargin={10}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="percentage" fill="var(--color-percentage)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ delivered: { label: 'Delivered', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="var(--color-delivered)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
