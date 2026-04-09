import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { EngineeringTable } from '@/components/engineering/EngineeringTable'
import { EngineeringDashboard } from '@/components/engineering/EngineeringDashboard'
import { DepartmentTasks } from '@/components/tasks/DepartmentTasks'

export default function Engineering() {
  const [woFilter, setWoFilter] = useState('')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engineering</h1>
          <p className="text-muted-foreground mt-1">
            Manage engineering tasks, layouts, BOMs, and documentation.
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-[850px] mb-4 h-auto lg:h-10">
          <TabsTrigger value="dashboard" className="py-2">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tasks" className="py-2">
            Tasks List
          </TabsTrigger>
          <TabsTrigger value="layouts" className="py-2">
            Layouts
          </TabsTrigger>
          <TabsTrigger value="boms" className="py-2">
            BOMs
          </TabsTrigger>
          <TabsTrigger value="travelers" className="py-2">
            Travelers
          </TabsTrigger>
          <TabsTrigger value="accessories" className="py-2">
            Accessories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <EngineeringDashboard />
        </TabsContent>
        <TabsContent value="tasks" className="mt-0 outline-none">
          <DepartmentTasks department="Engineering" />
        </TabsContent>
        <TabsContent value="layouts" className="mt-0 outline-none">
          <EngineeringTable type="layouts" woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="boms" className="mt-0 outline-none">
          <EngineeringTable type="boms" woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="travelers" className="mt-0 outline-none">
          <EngineeringTable type="travelers" woFilter={woFilter} />
        </TabsContent>
        <TabsContent value="accessories" className="mt-0 outline-none">
          <EngineeringTable type="accessories" woFilter={woFilter} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
