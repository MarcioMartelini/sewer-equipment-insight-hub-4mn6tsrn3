import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Edit2, Plus, Eye, Trash2, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import logoUrl from '@/assets/design-sem-nome-70de8.png'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LateCardPullDialog } from './LateCardPullDialog'

export function LateCardPullsTable() {
  const [pulls, setPulls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogState, setDialogState] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedPull, setSelectedPull] = useState<any>(null)
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', pn: '', supervisor: '' })
  const [isExporting, setIsExporting] = useState(false)

  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    let q = supabase.from('late_card_pulls').select('*').order('created_at', { ascending: false })
    if (filters.dateFrom) q = q.gte('date', filters.dateFrom)
    if (filters.dateTo) q = q.lte('date', filters.dateTo)
    if (filters.pn) q = q.ilike('part_number', `%${filters.pn}%`)
    if (filters.supervisor) q = q.ilike('area_supervisor', `%${filters.supervisor}%`)

    const { data } = await q
    if (data) setPulls(data)
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(fetchData, 500)
    return () => clearTimeout(t)
  }, [filters])

  const openDialog = (type: 'create' | 'edit' | 'view', pull?: any) => {
    setSelectedPull(pull || null)
    setDialogState(type)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return
    const { error } = await supabase.from('late_card_pulls').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Excluído com sucesso' })
      fetchData()
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById('pdf-table-late-card')
      if (!element) return

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const margin = 40
      const headerHeight = 100
      const footerHeight = 40
      const usableHeight = pdfHeight - margin - headerHeight - footerHeight

      const innerWidth = pdfWidth - margin * 2
      const imgProps = pdf.getImageProperties(imgData)
      const ratio = imgProps.width / imgProps.height
      const scaledHeight = innerWidth / ratio

      let heightLeft = scaledHeight
      let position = margin + headerHeight
      let pageNumber = 1

      const img = new Image()
      img.src = logoUrl
      await new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })

      const addHeaderFooterWithLogo = (pageNum: number) => {
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, pdfWidth, margin + headerHeight, 'F')

        pdf.setFontSize(18)
        pdf.setTextColor(0, 0, 0)
        pdf.text('Late Card Pulls', margin, margin + 40)
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, margin + 60)

        try {
          pdf.addImage(img, 'PNG', pdfWidth - margin - 80, margin, 80, 80)
        } catch (e) {
          console.error('Failed to add logo to PDF', e)
        }

        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, pdfHeight - footerHeight, pdfWidth, footerHeight, 'F')

        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Page ${pageNum} - ${new Date().toLocaleDateString()}`, margin, pdfHeight - 20)
      }

      pdf.addImage(imgData, 'PNG', margin, position, innerWidth, scaledHeight)
      addHeaderFooterWithLogo(pageNumber)
      heightLeft -= usableHeight

      while (heightLeft > 0) {
        pdf.addPage()
        pageNumber++
        position -= usableHeight
        pdf.addImage(imgData, 'PNG', margin, position, innerWidth, scaledHeight)
        addHeaderFooterWithLogo(pageNumber)
        heightLeft -= usableHeight
      }

      const timestamp = new Date().toISOString().split('T')[0]
      pdf.save(`late_card_pulls_${timestamp}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl">Late Card Pulls</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export to PDF
          </Button>
          <Button
            className="bg-[#0013ff] hover:bg-[#0013ff]/90"
            onClick={() => openDialog('create')}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-slate-50 border rounded-lg p-4 mb-6 flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Data Inicial</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Data Final</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">PN</Label>
              <Input
                placeholder="Buscar PN..."
                value={filters.pn}
                onChange={(e) => setFilters({ ...filters, pn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Supervisor</Label>
              <Input
                placeholder="Buscar Supervisor..."
                value={filters.supervisor}
                onChange={(e) => setFilters({ ...filters, supervisor: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ dateFrom: '', dateTo: '', pn: '', supervisor: '' })}
              className="w-full xl:w-auto"
            >
              <X className="w-4 h-4 mr-2" /> Limpar Filtros
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>PN</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Ocorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : pulls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pulls.map((pull) => (
                  <TableRow key={pull.id}>
                    <TableCell>
                      {pull.date ? pull.date.split('-').reverse().join('/') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{pull.part_number || '-'}</TableCell>
                    <TableCell>{pull.area_supervisor || '-'}</TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={pull.occurrence_description}
                    >
                      {pull.occurrence_description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pull.status === 'resolved' ? 'default' : 'secondary'}>
                        {pull.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDialog('view', pull)}
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDialog('edit', pull)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(pull.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <LateCardPullDialog
          dialogState={dialogState}
          setDialogState={setDialogState}
          pull={selectedPull}
          onSaved={fetchData}
        />

        {/* Hidden table for PDF export */}
        <div className="fixed top-[200vh] left-[-9999px] z-[-1] pointer-events-none">
          <div id="pdf-table-late-card" className="w-[1000px] bg-white text-black p-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b-2 border-slate-800 p-2 text-left font-bold">Date</th>
                  <th className="border-b-2 border-slate-800 p-2 text-left font-bold">PN</th>
                  <th className="border-b-2 border-slate-800 p-2 text-left font-bold">
                    Area Supervisor
                  </th>
                  <th className="border-b-2 border-slate-800 p-2 text-left font-bold">
                    Occurrence
                  </th>
                </tr>
              </thead>
              <tbody>
                {pulls.map((pull) => (
                  <tr key={pull.id}>
                    <td className="border-b border-slate-200 p-2">
                      {pull.date ? pull.date.split('-').reverse().join('/') : '-'}
                    </td>
                    <td className="border-b border-slate-200 p-2">{pull.part_number || '-'}</td>
                    <td className="border-b border-slate-200 p-2">{pull.area_supervisor || '-'}</td>
                    <td className="border-b border-slate-200 p-2">
                      {pull.occurrence_description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
