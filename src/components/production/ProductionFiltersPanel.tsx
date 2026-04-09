import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Filter, ChevronDown, RotateCcw } from 'lucide-react'
import { ProductionFilters } from '@/services/production-dashboard'

interface Props {
  filters: ProductionFilters
  updateFilter: (key: keyof ProductionFilters, value: any) => void
  resetFilters: () => void
}

export function ProductionFiltersPanel({ filters, updateFilter, resetFilters }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const hasActiveFilters = Object.values(filters).some(
    (v) => v === true || (typeof v === 'string' && v !== '' && v !== '30d'),
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full bg-white rounded-lg border border-slate-200 shadow-sm transition-all mb-6"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700">Advanced Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 bg-indigo-100 text-indigo-700">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-slate-500">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-t border-slate-100 mt-2">
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Period</Label>
            <Select value={filters.period} onValueChange={(v) => updateFilter('period', v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom (All time)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Operator</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter by operator..."
              value={filters.operator}
              onChange={(e) => updateFilter('operator', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Product Division</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter division..."
              value={filters.productDivision}
              onChange={(e) => updateFilter('productDivision', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Customer</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter customer..."
              value={filters.customer}
              onChange={(e) => updateFilter('customer', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Machine Family</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter family..."
              value={filters.machineFamily}
              onChange={(e) => updateFilter('machineFamily', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Machine Model</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter model..."
              value={filters.machineModel}
              onChange={(e) => updateFilter('machineModel', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">WO Number</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Filter WO..."
              value={filters.woNumber}
              onChange={(e) => updateFilter('woNumber', e.target.value)}
            />
          </div>

          <div className="col-span-full pt-2 flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="f-completed"
                checked={filters.tasksCompleted}
                onCheckedChange={(c) => updateFilter('tasksCompleted', c === true)}
              />
              <Label htmlFor="f-completed" className="text-sm cursor-pointer">
                Tasks Completed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="f-risk"
                checked={filters.tasksAtRisk}
                onCheckedChange={(c) => updateFilter('tasksAtRisk', c === true)}
              />
              <Label htmlFor="f-risk" className="text-sm cursor-pointer">
                Tasks At Risk
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="f-delayed"
                checked={filters.tasksDelayed}
                onCheckedChange={(c) => updateFilter('tasksDelayed', c === true)}
              />
              <Label htmlFor="f-delayed" className="text-sm cursor-pointer">
                Tasks Delayed
              </Label>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
