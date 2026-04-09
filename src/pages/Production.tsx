import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductionDashboard } from '@/components/production/ProductionDashboard'
import { ProductionTasks } from '@/components/production/ProductionTasks'

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
        <h1 className="text-3xl font-bold tracking-tight">Production</h1>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
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

        {currentTab !== 'dashboard' && (
          <TabsContent value={currentTab} className="mt-0">
            <ProductionTasks type={currentTab as any} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
