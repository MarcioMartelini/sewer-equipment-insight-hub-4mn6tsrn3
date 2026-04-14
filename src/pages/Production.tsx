import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductionDashboard } from '@/components/production/ProductionDashboard'
import { ProductionTasks } from '@/components/production/ProductionTasks'
import { ProductionKanban } from '@/components/production/ProductionKanban'

export default function Production() {
  const { subDepartment } = useParams()
  const navigate = useNavigate()

  const currentTab = subDepartment || 'dashboard'

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/production')
    } else {
      navigate(`/production/${value}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Production
        </h1>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Task Lists</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="weld_shop">Weld Shop</TabsTrigger>
          <TabsTrigger value="paint">Paint</TabsTrigger>
          <TabsTrigger value="sub_assembly">Sub Assembly</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="final_assembly">Final Assembly</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <ProductionDashboard />
        </TabsContent>

        {currentTab === 'kanban' && (
          <TabsContent value="kanban" className="mt-0">
            <ProductionKanban />
          </TabsContent>
        )}

        {currentTab !== 'dashboard' && currentTab !== 'kanban' && (
          <TabsContent value={currentTab} className="mt-0">
            <ProductionTasks type={currentTab === 'tasks' ? 'all' : (currentTab as any)} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
