import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

export function useDashboardExport(
  dashboardRef: React.RefObject<HTMLDivElement | null>,
  title: string,
) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const startY = 15
      const maxImgHeight = pageHeight - startY - 10

      let imgWidth = pdfWidth - 20
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight
        imgWidth = (canvas.width * imgHeight) / canvas.height
      }

      const startX = (pdfWidth - imgWidth) / 2

      pdf.setFontSize(14)
      pdf.text(title, 10, 10)

      pdf.addImage(imgData, 'PNG', startX, startY, imgWidth, imgHeight)
      pdf.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)

      toast({ title: 'Dashboard exported successfully!' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Error exporting dashboard', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  return { isExporting, handleExportPDF }
}
