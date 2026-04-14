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
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Appearance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize the system appearance. Choose between light, dark, or system preference.
        </p>
      </div>
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-200">Theme</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Select your preferred interface theme.
          </CardDescription>
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
              <span className="font-medium text-slate-700 dark:text-slate-300">Light</span>
            </Label>
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 peer-data-[state=checked]:border-indigo-500 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Moon className="mb-3 h-6 w-6 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Dark</span>
            </Label>
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-800 bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 peer-data-[state=checked]:border-indigo-500 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
            >
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Monitor className="mb-3 h-6 w-6 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">System</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
