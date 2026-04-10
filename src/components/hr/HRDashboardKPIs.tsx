import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, AlertTriangle, Activity, XOctagon } from 'lucide-react'

export default function HRDashboardKPIs({ data }: { data: any }) {
  const { prod, abs, inj } = data

  const totalHours = prod.reduce((acc: number, curr: any) => acc + (curr.labour_hours || 0), 0)
  const validRatios = prod.filter((p: any) => p.productivity_ratio !== null)
  const avgProd = validRatios.length
    ? validRatios.reduce((acc: number, curr: any) => acc + curr.productivity_ratio, 0) /
      validRatios.length
    : 0

  const totalAbsences = abs.length
  const unexcusedAbsences = abs.filter((a: any) => a.absence_type === 'unexcused').length
  const totalPossibleHours = totalHours + totalAbsences * 8
  const absenteeismRate =
    totalPossibleHours > 0 ? ((totalAbsences * 8) / totalPossibleHours) * 100 : 0

  const totalInjuries = inj.length

  const injByDept = inj.reduce((acc: any, curr: any) => {
    const dept = curr.department || 'Não informado'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 print:grid-cols-5">
        <Card className="print:shadow-none print:border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Produtividade Média</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProd.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Taxa de Absenteísmo</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absenteeismRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Faltas Não Justificadas</CardTitle>
            <XOctagon className="w-4 h-4 text-destructive print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unexcusedAbsences}</div>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lesões Registradas</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500 print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInjuries}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
        <Card className="col-span-1 print:shadow-none print:border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Lesões por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(injByDept).map(([dept, count]) => (
                <div
                  key={dept}
                  className="flex justify-between items-center bg-muted/50 p-2 rounded-md"
                >
                  <span className="text-sm text-muted-foreground">{dept}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
              {Object.keys(injByDept).length === 0 && (
                <span className="text-sm text-muted-foreground">Nenhuma lesão no período.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
