import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const getTaskName = (item: any, tab: string) => {
  if (tab === 'final_assembly') return item.station_name
  if (tab === 'tests') return item.test_name
  return item.task_name
}

const formatDate = (date: string | null) =>
  date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-'

const getStatusBadge = (status: string | null) => {
  const map: Record<string, string> = {
    complete: 'border-green-500 text-green-700 bg-green-50',
    'on track': 'border-blue-500 text-blue-700 bg-blue-50',
    'at risk': 'border-yellow-500 text-yellow-700 bg-yellow-50',
    delayed: 'border-red-500 text-red-700 bg-red-50',
    parked: 'border-slate-500 text-slate-700 bg-slate-50',
  }
  return map[status?.toLowerCase() || ''] || 'border-slate-300 text-slate-700 bg-slate-50'
}

function EditStatusDialog({
  item,
  activeTab,
  onUpdate,
}: {
  item: any
  activeTab: string
  onUpdate: (i: any, s: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(item.status || 'not started')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status</DialogTitle>
          <DialogDescription>
            Alterar o status da tarefa {getTaskName(item, activeTab)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="parked">Parked</SelectItem>
              <SelectItem value="on track">On Track</SelectItem>
              <SelectItem value="at risk">At Risk</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onUpdate(item, status)
              setOpen(false)
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Production() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('weld_shop')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [selectedWoId, setSelectedWoId] = useState<string>('all')

  useEffect(() => {
    supabase
      .from('work_orders')
      .select('id, wo_number')
      .order('wo_number')
      .then(({ data }) => {
        if (data) setWorkOrders(data)
      })
  }, [])

  const fetchTab = async (tab: string, woId: string) => {
    setLoading(true)
    let query = supabase.from(`production_${tab}`).select('*, work_orders(wo_number)')
    if (woId !== 'all') query = query.eq('wo_id', woId)

    const { data: res } = await query
    if (res) setData(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchTab(activeTab, selectedWoId)
  }, [activeTab, selectedWoId])

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    const { error } = await supabase
      .from(`production_${activeTab}`)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
      fetchTab(activeTab, selectedWoId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produção</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o status das tarefas em cada estágio.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedWoId} onValueChange={setSelectedWoId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Work Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas WOs</SelectItem>
              {workOrders.map((wo) => (
                <SelectItem key={wo.id} value={wo.id}>
                  {wo.wo_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <CardTitle className="capitalize">{activeTab.replace('_', ' ')}</CardTitle>
            <CardDescription>
              Acompanhamento de tarefas e status da etapa de {activeTab.replace('_', ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Carregando dados...</p>
            ) : data.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50">
                <p className="text-sm text-slate-500">Nenhum registro encontrado.</p>
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
                      <TableHead>Criado Em</TableHead>
                      <TableHead>Atualizado Em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.work_orders?.wo_number || item.wo_id}
                        </TableCell>
                        <TableCell>{getTaskName(item, activeTab)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(item.status)}>
                            {item.status || 'not started'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <EditStatusDialog
                            item={item}
                            activeTab={activeTab}
                            onUpdate={handleUpdateStatus}
                          />
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
