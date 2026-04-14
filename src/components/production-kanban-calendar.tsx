import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfDay,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ProductionKanbanCalendarProps {
  tasks: any[]
}

export function ProductionKanbanCalendar({ tasks }: ProductionKanbanCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth)),
      }),
    [currentMonth],
  )

  const getTasksForDay = (day: Date) => {
    return tasks.filter((t) => {
      if (!t.start_date) return false
      const start = parseISO(t.start_date)
      const finish = t.finish_date ? parseISO(t.finish_date) : start

      const normDay = startOfDay(day).getTime()
      const normStart = startOfDay(start).getTime()
      const normFinish = startOfDay(finish).getTime()

      return normDay >= normStart && normDay <= normFinish
    })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg text-slate-800 capitalize">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px overflow-y-auto">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={idx}
              className={cn(
                'bg-white min-h-[120px] p-1.5 flex flex-col gap-1 transition-colors',
                !isCurrentMonth && 'bg-slate-50/80 opacity-60',
                isToday && 'bg-blue-50/30',
              )}
            >
              <div
                className={cn(
                  'text-xs font-medium text-right mb-1 px-1',
                  isToday ? 'text-primary font-bold' : 'text-slate-500',
                )}
              >
                {format(day, 'd')}
              </div>
              <ScrollArea className="flex-1 -mx-1 px-1">
                <div className="flex flex-col gap-1 pb-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id + t.task_name}
                      className={cn(
                        'text-[10px] px-1.5 py-1 rounded shadow-sm truncate border leading-tight transition-transform hover:-translate-y-px',
                        t.status === 'Completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : t.status === 'In Progress'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700',
                      )}
                      title={`${t.wo_number} - ${t.task_name}`}
                    >
                      <span className="font-semibold opacity-80">{t.wo_number}</span> {t.task_name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>
    </div>
  )
}
