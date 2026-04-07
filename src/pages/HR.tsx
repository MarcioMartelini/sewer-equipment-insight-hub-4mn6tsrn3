import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductivityTab from '@/components/hr/ProductivityTab'
import AbsencesTab from '@/components/hr/AbsencesTab'
import InjuriesTab from '@/components/hr/InjuriesTab'

export default function HR() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos (HR)</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie produtividade, ausências e segurança do trabalho.
          </p>
        </div>
      </div>

      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="absences">Ausências</TabsTrigger>
          <TabsTrigger value="injuries">Lesões</TabsTrigger>
        </TabsList>
        <TabsContent value="productivity">
          <ProductivityTab />
        </TabsContent>
        <TabsContent value="absences">
          <AbsencesTab />
        </TabsContent>
        <TabsContent value="injuries">
          <InjuriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
