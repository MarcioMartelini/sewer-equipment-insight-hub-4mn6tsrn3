import { useTheme } from '@/components/theme-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Moon, Sun, Monitor } from 'lucide-react'

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aparência</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalize a aparência do sistema. Escolha entre o tema claro, escuro ou siga a
          preferência do sistema.
        </p>
      </div>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-200">Tema</CardTitle>
          <CardDescription>Selecione o tema de sua preferência para a interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={theme}
            onValueChange={(val) => setTheme(val as 'light' | 'dark' | 'system')}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 peer-data-[state=checked]:border-indigo-500 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Sun className="mb-3 h-6 w-6 text-slate-600 dark:text-slate-400" />
              <span className="font-medium">Claro</span>
            </Label>
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 peer-data-[state=checked]:border-indigo-500 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Moon className="mb-3 h-6 w-6 text-slate-600 dark:text-slate-400" />
              <span className="font-medium">Escuro</span>
            </Label>
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 peer-data-[state=checked]:border-indigo-500 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
            >
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Monitor className="mb-3 h-6 w-6 text-slate-600 dark:text-slate-400" />
              <span className="font-medium">Sistema</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
