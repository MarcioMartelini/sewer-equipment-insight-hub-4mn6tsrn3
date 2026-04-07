import { useState, useMemo, useEffect } from 'react'
import { WorkOrderFilters } from '@/components/WorkOrderFilters'
import { WorkOrderTable } from '@/components/WorkOrderTable'
import { WorkOrderKanban } from '@/components/WorkOrderKanban'
import { Department, Status, PrazoFilter, WorkOrder } from '@/types/work-order'
import { fetchWorkOrders } from '@/services/work-orders'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Index() {
  const { signOut } = useAuth()
  const [data, setData] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([])
  const [prazo, setPrazo] = useState<PrazoFilter>('Todos')
  const [view, setView] = useState<'table' | 'kanban'>('table')

  useEffect(() => {
    fetchWorkOrders().then((wos) => {
      setData(wos)
      setLoading(false)
    })
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((wo) => {
      // 1. Text Search (WO ID or Customer)
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        wo.id.toLowerCase().includes(searchTerm) || wo.customer.toLowerCase().includes(searchTerm)

      // 2. Department Filter
      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(wo.department)

      // 3. Status Filter
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(wo.status)

      // 4. Prazo Filter
      let matchesPrazo = true
      if (prazo !== 'Todos') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(wo.dueDate)
        due.setHours(0, 0, 0, 0)

        // Simple mock logic for prazo comparison
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (prazo === 'Atrasado') {
          matchesPrazo = diffDays < 0
        } else if (prazo === 'Esta semana') {
          matchesPrazo = diffDays >= 0 && diffDays <= 7
        } else if (prazo === 'Próxima semana') {
          matchesPrazo = diffDays > 7 && diffDays <= 14
        } else if (prazo === 'Futuro') {
          matchesPrazo = diffDays > 14
        }
      }

      return matchesSearch && matchesDept && matchesStatus && matchesPrazo
    })
  }, [search, selectedDepts, selectedStatuses, prazo])

  return (
    <div className="flex flex-col w-full h-full max-w-[1600px] mx-auto">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight sm:hidden mb-4">
            Registro de Work Orders
          </h2>
          <p className="text-slate-500 mb-6 max-w-2xl text-sm">
            Gerencie o ciclo de vida das ordens de produção, identifique gargalos e monitore os
            prazos em tempo real.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-slate-500 hover:text-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      <WorkOrderFilters
        search={search}
        setSearch={setSearch}
        selectedDepts={selectedDepts}
        setSelectedDepts={setSelectedDepts}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        prazo={prazo}
        setPrazo={setPrazo}
        view={view}
        setView={setView}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          <p className="text-slate-500 animate-pulse">Carregando dados do banco...</p>
        </div>
      ) : (
        <div className="flex-1 mt-2">
          {view === 'table' ? (
            <WorkOrderTable data={filteredData} />
          ) : (
            <WorkOrderKanban data={filteredData} />
          )}
        </div>
      )}
    </div>
  )
}
