import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import logoUrl from '@/assets/design-sem-nome-1bffa.png'

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
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Load logo
      const img = new Image()
      img.src = logoUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const logoRatio = img.width / img.height
      const logoWidth = 35 // mm
      const logoHeight = logoWidth / logoRatio
      const logoX = pdfWidth - logoWidth - 10
      const logoY = 10

      // Add Logo top right
      pdf.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight)

      pdf.setFontSize(14)
      pdf.text(title, 10, 15)

      const startY = Math.max(20, logoY + logoHeight + 10)
      const maxImgHeight = pageHeight - startY - 10

      let imgWidth = pdfWidth - 20
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight > maxImgHeight) {
        let remainingHeight = imgHeight
        let position = 0
        let pageNum = 1

        while (remainingHeight > 0) {
          if (pageNum > 1) {
            pdf.addPage()
          }

          const currentPageMaxHeight = pageNum === 1 ? maxImgHeight : pageHeight - 20
          const drawHeight = Math.min(remainingHeight, currentPageMaxHeight)
          const pStartY = pageNum === 1 ? startY : 10

          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = canvas.width

          const sY = position * (canvas.height / imgHeight)
          const sHeight = drawHeight * (canvas.height / imgHeight)

          tempCanvas.height = sHeight

          const ctx = tempCanvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              sY,
              canvas.width,
              sHeight,
              0,
              0,
              tempCanvas.width,
              tempCanvas.height,
            )
            const tempImgData = tempCanvas.toDataURL('image/png')
            pdf.addImage(tempImgData, 'PNG', 10, pStartY, imgWidth, drawHeight)
          }

          remainingHeight -= currentPageMaxHeight
          position += currentPageMaxHeight
          pageNum++
        }
      } else {
        const startX = (pdfWidth - imgWidth) / 2
        pdf.addImage(imgData, 'PNG', startX, startY, imgWidth, imgHeight)
      }

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
