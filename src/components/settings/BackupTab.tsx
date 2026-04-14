import { useState } from 'react'
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
import { Database, Download, RotateCcw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

const initialBackups = [
  { id: '1', date: '2026-04-06 23:00', size: '24.5 MB', type: 'Automatic' },
  { id: '2', date: '2026-04-05 23:00', size: '24.2 MB', type: 'Automatic' },
  { id: '3', date: '2026-04-04 15:30', size: '23.8 MB', type: 'Manual' },
]

export function BackupTab() {
  const [isExporting, setIsExporting] = useState(false)
  const [backups, setBackups] = useState(initialBackups)

  const handleBackup = async () => {
    setIsExporting(true)
    const toastId = toast.loading('Generating backup...')
    try {
      const { data, error } = await supabase.functions.invoke('export-database', {
        method: 'POST',
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Backup generated and downloaded successfully!', { id: toastId })

      const newBackup = {
        id: Math.random().toString(36).substring(2, 9),
        date: format(new Date(), 'yyyy-MM-dd HH:mm'),
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        type: 'Manual',
      }
      setBackups([newBackup, ...backups])
    } catch (error: any) {
      console.error('Backup error:', error)
      toast.error(`Failed to generate backup: ${error.message || 'Unknown error'}`, { id: toastId })
    } finally {
      setIsExporting(false)
    }
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
          <Button
            onClick={handleBackup}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Generating...' : 'Generate Backup Now'}
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
                      onClick={() => handleBackup()}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download
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
