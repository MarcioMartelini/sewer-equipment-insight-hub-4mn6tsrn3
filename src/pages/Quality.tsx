import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarrantyClaimsTable } from '@/components/quality/WarrantyClaimsTable'
import { LateCardPullsTable } from '@/components/quality/LateCardPullsTable'

export default function Quality() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Qualidade</h2>
        <p className="text-slate-500">
          Gestão de Garantias e Retiradas de Componentes (Late Card Pulls)
        </p>
      </div>

      <Tabs defaultValue="warranty" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="warranty">Warranty Claims</TabsTrigger>
          <TabsTrigger value="late_card">Late Card Pulls</TabsTrigger>
        </TabsList>

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
