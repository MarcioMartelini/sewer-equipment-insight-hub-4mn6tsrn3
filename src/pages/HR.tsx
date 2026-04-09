import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductivityTab from '@/components/hr/ProductivityTab'
import AbsencesTab from '@/components/hr/AbsencesTab'
import InjuriesTab from '@/components/hr/InjuriesTab'
import DashboardTab from '@/components/hr/DashboardTab'
import { DepartmentTasksList } from '@/components/tasks/DepartmentTasksList'

export default function HR() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Human Resources (HR)</h1>
          <p className="text-muted-foreground mt-2">
            Manage productivity, absences, and workplace safety.
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 md:w-[700px]">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks List</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="absences">Absences</TabsTrigger>
          <TabsTrigger value="injuries">Injuries</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="tasks">
          <DepartmentTasksList department="HR" />
        </TabsContent>
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
