import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [localSelected, setLocalSelected] = React.useState<string[]>(selected)

  React.useEffect(() => {
    if (open) {
      setLocalSelected(selected)
    }
  }, [open, selected])

  const handleSelect = (option: string) => {
    if (localSelected.includes(option)) {
      setLocalSelected(localSelected.filter((item) => item !== option))
    } else {
      setLocalSelected([...localSelected, option])
    }
  }

  const handleApply = () => {
    onChange(localSelected)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-white dark:bg-slate-950 text-sm font-normal text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
        align="start"
      >
        <div className="max-h-[300px] overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={localSelected.includes(option)}
              onCheckedChange={() => handleSelect(option)}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer dark:hover:bg-slate-800 dark:focus:bg-slate-800"
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        <DropdownMenuSeparator className="dark:border-slate-800" />
        <div className="p-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleApply}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
