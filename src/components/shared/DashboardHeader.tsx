import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Download, CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  description: string
  dateRange: { from: Date | undefined; to?: Date | undefined }
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void
  onExport: () => void
  isExporting: boolean
  children?: React.ReactNode
}

export function DashboardHeader({
  title,
  description,
  dateRange,
  setDateRange,
  onExport,
  isExporting,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {children}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Dashboard to PDF
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[260px] justify-start text-left font-normal bg-white border-slate-200',
                !dateRange.from && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MM/dd/yyyy')} - {format(dateRange.to, 'MM/dd/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'MM/dd/yyyy')
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range) setDateRange({ from: range.from, to: range.to })
                else setDateRange({ from: undefined, to: undefined })
              }}
              numberOfMonths={2}
              locale={enUS}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
