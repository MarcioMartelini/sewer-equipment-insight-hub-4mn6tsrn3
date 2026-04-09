import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/MultiSelect'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, LayoutGrid, List as ListIcon, X } from 'lucide-react'
import { Department, Status, PrazoFilter } from '@/types/work-order'
import { Button } from '@/components/ui/button'

export interface WorkOrderFiltersProps {
  search: string
  setSearch: (val: string) => void
  selectedDepts: Department[]
  setSelectedDepts: (val: Department[]) => void
  selectedStatuses: Status[]
  setSelectedStatuses: (val: Status[]) => void
  prazo: PrazoFilter
  setPrazo: (val: PrazoFilter) => void
  view: 'table' | 'kanban'
  setView: (val: 'table' | 'kanban') => void
  totalCount?: number
  filteredCount?: number
  onClearFilters?: () => void
  salesperson?: string
  setSalesperson?: (val: string) => void
}

const DEPARTMENTS: Department[] = [
  'Sales',
  'Engineering',
  'Purchasing',
  'Production',
  'Quality',
  'Delivery',
  'Warranty',
  'High Management',
]
const STATUSES: Status[] = ['Not started', 'Parked', 'On track', 'At risk', 'Delayed', 'Complete']

export function WorkOrderFilters({
  search,
  setSearch,
  selectedDepts,
  setSelectedDepts,
  selectedStatuses,
  setSelectedStatuses,
  prazo,
  setPrazo,
  view,
  setView,
  totalCount,
  filteredCount,
  onClearFilters,
  salesperson,
  setSalesperson,
}: WorkOrderFiltersProps) {
  const hasActiveFilters =
    search !== '' ||
    selectedDepts.length > 0 ||
    selectedStatuses.length > 0 ||
    prazo !== 'Todos' ||
    (salesperson && salesperson !== '')

  const handleClearAll = () => {
    setSearch('')
    setSelectedDepts([])
    setSelectedStatuses([])
    setPrazo('Todos')
    if (setSalesperson) setSalesperson('')
    if (onClearFilters) onClearFilters()
  }

  return (
    <div className="flex flex-col gap-4 mb-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center w-full">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by ID or Customer..."
              className="pl-9 bg-white border-slate-200 text-sm focus-visible:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="w-full sm:w-[160px]">
              <MultiSelect
                options={DEPARTMENTS}
                selected={selectedDepts}
                onChange={(val) => setSelectedDepts(val as Department[])}
                placeholder="Department"
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <MultiSelect
                options={STATUSES}
                selected={selectedStatuses}
                onChange={(val) => setSelectedStatuses(val as Status[])}
                placeholder="Status"
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <Select value={prazo} onValueChange={(v) => setPrazo(v as PrazoFilter)}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-600">
                  <SelectValue placeholder="Due Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">All due dates</SelectItem>
                  <SelectItem value="Atrasado">Delayed</SelectItem>
                  <SelectItem value="Esta semana">This week</SelectItem>
                  <SelectItem value="Próxima semana">Next week</SelectItem>
                  <SelectItem value="Futuro">Future</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[160px]">
              <Input
                type="text"
                placeholder="Salesperson..."
                className="bg-white border-slate-200 text-sm focus-visible:ring-indigo-500"
                value={salesperson || ''}
                onChange={(e) => setSalesperson?.(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full mt-2">
        <div className="flex items-center gap-4">
          {totalCount !== undefined && filteredCount !== undefined && (
            <div className="text-sm font-medium text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredCount}</span> of{' '}
              <span className="font-bold text-slate-700">{totalCount}</span> tasks
            </div>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-slate-700 h-8"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'table' | 'kanban')}
          className="w-full md:w-auto self-end md:self-auto"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1">
            <TabsTrigger
              value="table"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <ListIcon className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
