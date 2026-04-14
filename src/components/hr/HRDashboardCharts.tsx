import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

export default function HRDashboardCharts({ data }: { data: any }) {
  const { prod, abs, inj } = data

  const prodByDate = prod.reduce((acc: any, curr: any) => {
    if (!curr.recorded_date || curr.productivity_ratio === null) return acc
    if (!acc[curr.recorded_date])
      acc[curr.recorded_date] = { date: curr.recorded_date, sum: 0, count: 0 }
    acc[curr.recorded_date].sum += curr.productivity_ratio
    acc[curr.recorded_date].count += 1
    return acc
  }, {})

  const prodTrend = Object.values(prodByDate)
    .map((d: any) => ({ date: d.date, value: d.sum / d.count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const excused = abs.filter((a: any) => a.absence_type === 'excused').length
  const unexcused = abs.filter((a: any) => a.absence_type === 'unexcused').length
  const absDist = [
    { name: 'Excused', value: excused, fill: 'hsl(var(--primary))' },
    { name: 'Unexcused', value: unexcused, fill: 'hsl(var(--destructive))' },
  ].filter((d) => d.value > 0)

  const recordable = inj.filter((i: any) => i.injury_type === 'recordable').length
  const nonRecordable = inj.filter((i: any) => i.injury_type === 'non-recordable').length
  const injDist = [
    { name: 'Recordable', value: recordable, fill: 'hsl(var(--destructive))' },
    { name: 'Non-recordable', value: nonRecordable, fill: 'hsl(var(--muted-foreground))' },
  ].filter((d) => d.value > 0)

  const chartConfig = {
    value: {
      label: 'Productivity',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {prodTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full min-h-[300px]">
                <LineChart data={prodTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const p = v.split('-')
                      return p.length === 3 ? `${p[2]}/${p[1]}` : v
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data for the selected period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Absence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px]">
              {absDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={absDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                    >
                      {absDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Injury Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px]">
              {injDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={injDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                    >
                      {injDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
