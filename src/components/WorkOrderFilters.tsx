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
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react'
import { Department, Status, PrazoFilter } from '@/types/work-order'

interface WorkOrderFiltersProps {
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
}: WorkOrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between animate-fade-in-up">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por ID ou Cliente..."
            className="pl-9 bg-white border-slate-200 text-sm focus-visible:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="w-full sm:w-[160px]">
            <MultiSelect
              options={DEPARTMENTS}
              selected={selectedDepts}
              onChange={(val) => setSelectedDepts(val as Department[])}
              placeholder="Departamento"
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
                <SelectValue placeholder="Prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os prazos</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Esta semana">Esta semana</SelectItem>
                <SelectItem value="Próxima semana">Próxima semana</SelectItem>
                <SelectItem value="Futuro">Futuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
            Lista
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Quadro
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
