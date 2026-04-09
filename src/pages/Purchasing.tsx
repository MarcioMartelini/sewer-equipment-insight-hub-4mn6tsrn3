import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, LayoutDashboard, PackageSearch, AlertCircle, ListTodo } from 'lucide-react'
import ComponentsTab from '@/components/purchasing/ComponentsTab'
import ExpeditesTab from '@/components/purchasing/ExpeditesTab'
import PurchasingDashboard from '@/components/purchasing/PurchasingDashboard'
import { DepartmentTasks } from '@/components/tasks/DepartmentTasks'

export default function Purchasing() {
  const [woFilter, setWoFilter] = useState('')

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Purchasing</h2>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks List</span>
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4" />
                <span className="hidden sm:inline">Components</span>
              </TabsTrigger>
              <TabsTrigger value="expedites" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Expedites</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter by WO Number..."
                className="pl-8"
                value={woFilter}
                onChange={(e) => setWoFilter(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="dashboard" className="mt-0">
            <PurchasingDashboard />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <DepartmentTasks department="Purchasing" />
          </TabsContent>

          <TabsContent value="components" className="mt-0">
            <ComponentsTab woFilter={woFilter} />
          </TabsContent>

          <TabsContent value="expedites" className="mt-0">
            <ExpeditesTab woFilter={woFilter} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
