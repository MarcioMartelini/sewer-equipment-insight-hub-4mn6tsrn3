import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarrantyClaimsTable } from '@/components/quality/WarrantyClaimsTable'
import { LateCardPullsTable } from '@/components/quality/LateCardPullsTable'
import { QualityDashboard } from '@/components/quality/QualityDashboard'

export default function Quality() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quality</h2>
        <p className="text-slate-500">
          Executive Dashboard and Management of Warranties and Component Pulls
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="warranty">Warranty Claims</TabsTrigger>
          <TabsTrigger value="late_card">Late Card Pulls</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <QualityDashboard />
        </TabsContent>

        <TabsContent value="warranty" className="mt-6">
          <WarrantyClaimsTable />
        </TabsContent>

        <TabsContent value="late_card" className="mt-6">
          <LateCardPullsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
