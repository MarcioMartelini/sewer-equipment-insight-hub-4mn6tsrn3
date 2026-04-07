import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProductionDashboard } from '@/components/production-dashboard'
import { ProductionSubDepartmentDashboard } from '@/components/production-sub-department-dashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Production() {
  const { subDepartment } = useParams()
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [selectedWoId, setSelectedWoId] = useState<string>('all')

  const tabMapping: Record<string, string> = {
    'weld-shop': 'weld_shop',
    paint: 'paint',
    'sub-assembly': 'sub_assembly',
    warehouse: 'warehouse',
    'final-assembly': 'final_assembly',
    tests: 'tests',
  }

  const reverseMapping: Record<string, string> = {
    weld_shop: 'weld-shop',
    paint: 'paint',
    sub_assembly: 'sub-assembly',
    warehouse: 'warehouse',
    final_assembly: 'final-assembly',
    tests: 'tests',
  }

  const activeTab = subDepartment ? tabMapping[subDepartment] || 'dashboard' : 'dashboard'

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/production')
    } else {
      navigate(`/production/${reverseMapping[value]}`)
    }
  }

  useEffect(() => {
    supabase
      .from('work_orders')
      .select('id, wo_number')
      .order('wo_number')
      .then(({ data }) => {
        if (data) setWorkOrders(data)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produção</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o status das tarefas em cada estágio.
          </p>
        </div>
        {activeTab !== 'dashboard' && (
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2 p-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="weld_shop">Soldagem (Weld Shop)</TabsTrigger>
          <TabsTrigger value="paint">Pintura (Paint)</TabsTrigger>
          <TabsTrigger value="sub_assembly">Sub-montagem (Sub Assembly)</TabsTrigger>
          <TabsTrigger value="warehouse">Acessórios (Warehouse)</TabsTrigger>
          <TabsTrigger value="final_assembly">Montagem Final (Final Assembly)</TabsTrigger>
          <TabsTrigger value="tests">Testes (Tests)</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0">
          <ProductionDashboard />
        </TabsContent>

        <TabsContent value="weld_shop" className="m-0">
          <ProductionSubDepartmentDashboard
            department="weld_shop"
            tableName="production_weld_shop"
            title="Soldagem (Weld Shop)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>

        <TabsContent value="paint" className="m-0">
          <ProductionSubDepartmentDashboard
            department="paint"
            tableName="production_paint"
            title="Pintura (Paint)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>

        <TabsContent value="sub_assembly" className="m-0">
          <ProductionSubDepartmentDashboard
            department="sub_assembly"
            tableName="production_sub_assembly"
            title="Sub-montagem (Sub Assembly)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>

        <TabsContent value="warehouse" className="m-0">
          <ProductionSubDepartmentDashboard
            department="warehouse"
            tableName="production_warehouse"
            title="Acessórios (Warehouse)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>

        <TabsContent value="final_assembly" className="m-0">
          <ProductionSubDepartmentDashboard
            department="final_assembly"
            tableName="production_final_assembly"
            title="Montagem Final (Final Assembly)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>

        <TabsContent value="tests" className="m-0">
          <ProductionSubDepartmentDashboard
            department="tests"
            tableName="production_tests"
            title="Testes (Tests)"
            selectedWoId={selectedWoId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
