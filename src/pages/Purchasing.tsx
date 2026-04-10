import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import ComponentsTab from '@/components/purchasing/ComponentsTab'
import ExpeditesTab from '@/components/purchasing/ExpeditesTab'
import PurchasingDashboard from '@/components/purchasing/PurchasingDashboard'
import PurchasingTasksTab from '@/components/purchasing/PurchasingTasksTab'
import PurchasingKanbanTab from '@/components/purchasing/PurchasingKanbanTab'
import PurchasingPerformanceTab from '@/components/purchasing/PurchasingPerformanceTab'

export default function Purchasing() {
  const [woFilter, setWoFilter] = useState('')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchasing</h1>
          <p className="text-muted-foreground mt-1">
            Manage purchasing tasks, components, expedites, and performance.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by WO Number..."
            value={woFilter}
            onChange={(e) => setWoFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:w-[850px] mb-4 h-auto lg:h-10">
          <TabsTrigger value="dashboard" className="py-2">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tasks" className="py-2">
            Task Lists
          </TabsTrigger>
          <TabsTrigger value="kanban" className="py-2">
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="components" className="py-2">
            Components
          </TabsTrigger>
          <TabsTrigger value="expedites" className="py-2">
            Expedites
          </TabsTrigger>
          <TabsTrigger value="performance" className="py-2">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <PurchasingDashboard />
        </TabsContent>
        <TabsContent value="tasks" className="mt-0 outline-none">
          <PurchasingTasksTab woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="kanban" className="mt-0 outline-none">
          <PurchasingKanbanTab woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="components" className="mt-0 outline-none">
          <ComponentsTab woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="expedites" className="mt-0 outline-none">
          <ExpeditesTab woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="performance" className="mt-0 outline-none">
          <PurchasingPerformanceTab woFilter={woFilter} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
