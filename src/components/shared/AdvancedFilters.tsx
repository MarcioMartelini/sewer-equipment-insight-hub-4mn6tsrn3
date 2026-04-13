import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface AdvancedFiltersProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onReset: () => void
  children: React.ReactNode
}

export function AdvancedFilters({ isOpen, setIsOpen, onReset, children }: AdvancedFiltersProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Advanced Filters</h3>
        </div>
        <div className="flex items-center gap-4">
          {isOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-slate-500 hover:text-slate-700"
            >
              Reset Filters
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-9 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle Filters</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="mt-4 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
