import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ProductionDashboard } from '@/components/production/ProductionDashboard'
import { ProductionTable } from '@/components/production/ProductionTable'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ProductionType } from '@/services/production'

export default function Production() {
  const { subDepartment } = useParams()
  const navigate = useNavigate()
  const [woFilter, setWoFilter] = useState('')

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Production</h2>
          <p className="text-muted-foreground">Manage production tasks, assembly, and tracking.</p>
        </div>
        <div className="w-full sm:w-64 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Filter by WO Number..."
            className="pl-9"
            value={woFilter}
            onChange={(e) => setWoFilter(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 p-1 bg-slate-100/50">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="weld_shop" className="data-[state=active]:bg-white">
            Weld Shop
          </TabsTrigger>
          <TabsTrigger value="paint" className="data-[state=active]:bg-white">
            Paint
          </TabsTrigger>
          <TabsTrigger value="sub_assembly" className="data-[state=active]:bg-white">
            Sub Assembly
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="data-[state=active]:bg-white">
            Warehouse
          </TabsTrigger>
          <TabsTrigger value="final_assembly" className="data-[state=active]:bg-white">
            Final Assembly
          </TabsTrigger>
          <TabsTrigger value="tests" className="data-[state=active]:bg-white">
            Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0">
          <ProductionDashboard />
        </TabsContent>

        {['weld_shop', 'paint', 'sub_assembly', 'warehouse', 'final_assembly', 'tests'].map(
          (tab) => (
            <TabsContent key={tab} value={tab} className="m-0">
              <ProductionTable
                type={tab as ProductionType}
                woFilter={woFilter}
                onClearFilters={() => setWoFilter('')}
              />
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  )
}
