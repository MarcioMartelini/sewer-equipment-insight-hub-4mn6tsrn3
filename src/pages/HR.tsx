import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductivityTab from '@/components/hr/ProductivityTab'
import AbsencesTab from '@/components/hr/AbsencesTab'
import InjuriesTab from '@/components/hr/InjuriesTab'
import DashboardTab from '@/components/hr/DashboardTab'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export default function HR() {
  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="container mx-auto p-6 space-y-6 print:p-0 print:m-0 print:max-w-none">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Human Resources (HR)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage productivity, absences, and workplace safety.
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          variant="outline"
          className="shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white border-0"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">HR Report</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4 print:space-y-0">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[600px] print:hidden bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="absences">Absences</TabsTrigger>
          <TabsTrigger value="injuries">Injuries</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="productivity">
          <ProductivityTab />
        </TabsContent>
        <TabsContent value="absences">
          <AbsencesTab />
        </TabsContent>
        <TabsContent value="injuries">
          <InjuriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
