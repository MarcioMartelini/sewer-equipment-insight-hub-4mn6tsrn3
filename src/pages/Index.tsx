import { LayoutDashboard } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SalesDashboard from '@/components/sales/SalesDashboard'
import { EngineeringDashboard } from '@/components/engineering/EngineeringDashboard'
import GeneralMetricsDashboard from '@/components/general/GeneralMetricsDashboard'

export default function Index() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Company Dashboard</h2>
            <p className="text-sm text-slate-500">Cross-department performance overview</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="general">General Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-0 focus-visible:outline-none">
          <SalesDashboard />
        </TabsContent>
        <TabsContent value="engineering" className="mt-0 focus-visible:outline-none">
          <EngineeringDashboard />
        </TabsContent>
        <TabsContent value="general" className="mt-0 focus-visible:outline-none">
          <GeneralMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
