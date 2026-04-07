import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Database, Download, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const backups = [
  { id: '1', date: '2026-04-06 23:00', size: '24.5 MB', type: 'Automatic' },
  { id: '2', date: '2026-04-05 23:00', size: '24.2 MB', type: 'Automatic' },
  { id: '3', date: '2026-04-04 15:30', size: '23.8 MB', type: 'Manual' },
]

export function BackupTab() {
  const handleBackup = () => {
    toast.success('Backup started successfully. You will be notified when complete.')
  }

  const handleRestore = (id: string) => {
    toast.info('Restore request sent. Please check your email to confirm.')
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Database Backup
          </CardTitle>
          <CardDescription className="text-blue-700/80 dark:text-blue-300/80">
            Create an instant manual backup of your entire database (PostgreSQL in Supabase).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Generate Backup Now
          </Button>
        </CardContent>
      </Card>

      <div>
        <h4 className="text-sm font-medium mb-3 text-slate-800 dark:text-slate-200">
          Backup History
        </h4>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-slate-600">{b.date}</TableCell>
                  <TableCell>{b.size}</TableCell>
                  <TableCell>{b.type}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(b.id)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Starting download...')}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
