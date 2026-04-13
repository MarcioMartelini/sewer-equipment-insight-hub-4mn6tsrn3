import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

interface Props {
  filters: any
  updateFilter: (key: string, value: any) => void
  resetFilters: () => void
}

export function ProductionFiltersPanel({ filters, updateFilter, resetFilters }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const hasActiveFilters = filters
    ? Object.entries(filters).some(
        ([k, v]) => v !== '' && v !== 'all' && v !== false && k !== 'period',
      )
    : false

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-all mb-6"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Advanced Filters
          </h3>
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
            >
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-slate-500">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset Filters
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
        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 mt-2">
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Salesperson</Label>
            <Select
              value={filters?.salesperson || 'all'}
              onValueChange={(v) => updateFilter('salesperson', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Salespersons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespersons</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Division</Label>
            <Select
              value={filters?.division || 'all'}
              onValueChange={(v) => updateFilter('division', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Area/Region</Label>
            <Select
              value={filters?.region || 'all'}
              onValueChange={(v) => updateFilter('region', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="south">South</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Customer</Label>
            <Select
              value={filters?.customer || 'all'}
              onValueChange={(v) => updateFilter('customer', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="city">City Municipal</SelectItem>
                <SelectItem value="county">County Works</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Machine Family</Label>
            <Select
              value={filters?.machineFamily || 'all'}
              onValueChange={(v) => updateFilter('machineFamily', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Families" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Families</SelectItem>
                <SelectItem value="sewer">Sewer Cleaners</SelectItem>
                <SelectItem value="vacuum">Vacuum Excavators</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Machine Model</Label>
            <Select
              value={filters?.machineModel || 'all'}
              onValueChange={(v) => updateFilter('machineModel', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="model_a">Model A</SelectItem>
                <SelectItem value="model_b">Model B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Quote Number</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Search Quote..."
              value={filters?.quoteNumber || ''}
              onChange={(e) => updateFilter('quoteNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">WO Number</Label>
            <Input
              className="h-8 text-sm"
              placeholder="Search WO..."
              value={filters?.woNumber || ''}
              onChange={(e) => updateFilter('woNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-500">Métrica (Metric)</Label>
            <Select
              value={filters?.metric || 'all'}
              onValueChange={(v) => updateFilter('metric', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="completion">Completion Rate</SelectItem>
                <SelectItem value="delay">Delay Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
