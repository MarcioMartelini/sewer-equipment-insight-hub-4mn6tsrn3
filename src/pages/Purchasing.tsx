import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Search,
  LayoutDashboard,
  Zap,
  ListTodo,
  Kanban,
  TrendingUp,
  PackageSearch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ComponentsTab from '@/components/purchasing/ComponentsTab'
import ExpeditesTab from '@/components/purchasing/ExpeditesTab'
import PurchasingDashboard from '@/components/purchasing/PurchasingDashboard'
import PurchasingTasksTab from '@/components/purchasing/PurchasingTasksTab'
import PurchasingKanbanTab from '@/components/purchasing/PurchasingKanbanTab'
import PurchasingPerformanceTab from '@/components/purchasing/PurchasingPerformanceTab'

const MENU_ITEMS = [
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  { id: 'expedites', label: 'Expedites', icon: Zap },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'performance', label: 'Performance Report', icon: TrendingUp },
  { id: 'components', label: 'Components', icon: PackageSearch },
]

export default function Purchasing() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [woFilter, setWoFilter] = useState('')

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-8 pt-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Purchasing</h2>
        </div>
        <nav className="flex flex-col space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col space-y-4">
        {/* Top bar with filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">
            {MENU_ITEMS.find((i) => i.id === activeTab)?.label}
          </h3>
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

        <div className="flex-1 overflow-y-auto rounded-md">
          {activeTab === 'dashboard' && <PurchasingDashboard />}
          {activeTab === 'tasks' && <PurchasingTasksTab woFilter={woFilter} />}
          {activeTab === 'kanban' && <PurchasingKanbanTab woFilter={woFilter} />}
          {activeTab === 'components' && <ComponentsTab woFilter={woFilter} />}
          {activeTab === 'expedites' && <ExpeditesTab woFilter={woFilter} />}
          {activeTab === 'performance' && <PurchasingPerformanceTab woFilter={woFilter} />}
        </div>
      </main>
    </div>
  )
}
