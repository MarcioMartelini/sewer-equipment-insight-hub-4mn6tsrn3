import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function drawBarChart(
  doc: any,
  data: any[],
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
) {
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(title, x, y - 5)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(x, y, x, y + height) // Y axis
  doc.line(x, y + height, x + width, y + height) // X axis

  if (!data || data.length === 0) {
    doc.setFontSize(8)
    doc.text('No data', x + width / 2, y + height / 2, { align: 'center' })
    return
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const barWidth = (width - 10) / data.length

  data.forEach((d, i) => {
    const barHeight = (d.value / maxVal) * (height - 15)
    const barX = x + 5 + i * barWidth
    const barY = y + height - barHeight

    doc.setFillColor(79, 70, 229)
    doc.rect(barX + 2, barY, barWidth - 4, barHeight, 'F')

    doc.setFontSize(6)
    doc.setTextColor(100, 100, 100)
    const label = (d.label || '').substring(0, 8)
    doc.text(label, barX + barWidth / 2, y + height + 5, { align: 'center' })

    // value
    let valStr = d.value.toString()
    if (d.value > 1000) valStr = (d.value / 1000).toFixed(1) + 'k'
    doc.text(valStr, barX + barWidth / 2, barY - 2, { align: 'center' })
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { header, kpis, charts, topSalespersons } = payload

    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('Sales Dashboard Report', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated on: ${header.date}`, 14, 28)
    doc.text(`Period: ${header.period}`, 14, 33)

    const filtersStr = []
    if (header.filters.salesperson !== 'all')
      filtersStr.push(`Salesperson: ${header.filters.salesperson}`)
    if (header.filters.division !== 'all') filtersStr.push(`Division: ${header.filters.division}`)
    if (header.filters.area !== 'all') filtersStr.push(`Area: ${header.filters.area}`)
    if (header.filters.customer !== 'all') filtersStr.push(`Customer: ${header.filters.customer}`)
    if (filtersStr.length > 0) {
      doc.text(`Filters: ${filtersStr.join(', ')}`, 14, 38)
    }

    // KPIs
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Executive Summary', 14, 50)

    const formatMoney = (val: number) =>
      `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const kpiData = [
      [
        'Gross Revenue',
        formatMoney(kpis.grossRevenue),
        'Total Quotes',
        (kpis.totalQuotes || 0).toString(),
      ],
      [
        'Total WOs',
        (kpis.totalWOs || 0).toString(),
        'Conversion Rate',
        `${(kpis.conversionRate || 0).toFixed(1)}%`,
      ],
      [
        'Avg Profit Margin',
        `${(kpis.avgProfitMargin || 0).toFixed(1)}%`,
        'Avg Sales Cycle',
        `${(kpis.avgSalesCycle || 0).toFixed(1)} days`,
      ],
      [
        'Customer LTV',
        formatMoney(kpis.clv),
        'Avg Purchase Value',
        formatMoney(kpis.avgPurchaseValue),
      ],
      ['Total Purchases', (kpis.numberOfPurchases || 0).toString(), '', ''],
    ]

    autoTable(doc, {
      startY: 55,
      body: kpiData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        2: { fontStyle: 'bold', fillColor: [248, 250, 252] },
      },
    })

    let currentY = (doc as any).lastAutoTable.finalY + 15

    // Charts
    doc.setFontSize(14)
    doc.text('Performance Charts', 14, currentY)
    currentY += 10

    drawBarChart(doc, charts.revenueTrend || [], 14, currentY, 85, 50, 'Revenue Over Time')
    drawBarChart(doc, charts.wosBySp || [], 110, currentY, 85, 50, 'WOs by Salesperson')

    currentY += 70

    drawBarChart(doc, charts.familyDist || [], 14, currentY, 85, 50, 'Machine Family Dist.')
    drawBarChart(doc, charts.marginTrend || [], 110, currentY, 85, 50, 'Profit Margin Trend')

    currentY += 70

    // Top 10 Salespersons
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(14)
    doc.text('Top 10 Salespersons', 14, currentY)
    currentY += 5

    const spTableData = (topSalespersons || []).map((sp: any, i: number) => [
      `#${i + 1}`,
      sp.name,
      sp.department || '-',
      sp.region || '-',
      formatMoney(sp.revenue),
      sp.wos || 0,
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Salesperson', 'Division', 'Area', 'Revenue', 'WOs']],
      body: spTableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text('CONFIDENTIAL: This report contains sensitive commercial information.', 14, 290)
      doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' })
    }

    const pdfBytes = doc.output('arraybuffer')

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="sales-report.pdf"',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
