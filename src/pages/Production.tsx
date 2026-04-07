import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Production() {
  const [activeTab, setActiveTab] = useState('weld_shop')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTab = async (tab: string) => {
    setLoading(true)
    const tableName = `production_${tab}`
    const { data: res } = await supabase.from(tableName as any).select('*, work_orders(wo_number)')
    if (res) setData(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchTab(activeTab)
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Produção</h2>
        <p className="text-muted-foreground">
          Gerencie e acompanhe o status das tarefas em cada estágio da produção.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2 p-1">
          <TabsTrigger value="weld_shop">Soldagem (Weld Shop)</TabsTrigger>
          <TabsTrigger value="paint">Pintura (Paint)</TabsTrigger>
          <TabsTrigger value="sub_assembly">Sub-montagem (Sub Assembly)</TabsTrigger>
          <TabsTrigger value="warehouse">Acessórios (Warehouse)</TabsTrigger>
          <TabsTrigger value="final_assembly">Montagem Final (Final Assembly)</TabsTrigger>
          <TabsTrigger value="tests">Testes (Tests)</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize">{activeTab.replace('_', ' ')}</CardTitle>
                <CardDescription>
                  Acompanhamento de tarefas e status da etapa de {activeTab.replace('_', ' ')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Carregando dados...</p>
            ) : data.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50">
                <p className="text-sm text-slate-500">
                  Nenhum registro encontrado para esta etapa.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WO Number</TableHead>
                      <TableHead>
                        {activeTab === 'final_assembly'
                          ? 'Estação'
                          : activeTab === 'tests'
                            ? 'Teste'
                            : 'Tarefa'}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.work_orders?.wo_number || item.wo_id}
                        </TableCell>
                        <TableCell>
                          {activeTab === 'final_assembly'
                            ? item.station_name
                            : activeTab === 'tests'
                              ? item.test_name
                              : item.task_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.status === 'completed'
                                ? 'border-green-500 text-green-700 bg-green-50'
                                : item.status === 'in_progress'
                                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                                  : 'border-slate-300 text-slate-700 bg-slate-50'
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Atualizar Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
