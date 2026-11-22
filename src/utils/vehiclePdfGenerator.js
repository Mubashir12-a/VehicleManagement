import { formatDisplayDate } from './dateFormatter'

/**
 * Standalone client-side vector PDF generator for MKD Vehicle Reports.
 * Generates valid multi-page PDF 1.4 binary data and triggers immediate browser download.
 * Excludes all app settings / configuration data; focuses exclusively on vehicle records.
 */

function escapePdf(text) {
  if (text === null || text === undefined) return ''
  return String(text)
    .replace(/₹/g, 'Rs. ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ')
}

class PdfDocument {
  constructor() {
    this.pages = []
    this.currentPage = null
    this.currentY = 790
    this.addPage()
  }

  addPage() {
    this.currentPage = []
    this.pages.push(this.currentPage)
    this.currentY = 790
    // Dark canvas background
    this.currentPage.push('0.04 0.05 0.07 rg 0 0 595.28 841.89 re f')
  }

  checkSpace(neededHeight) {
    if (this.currentY - neededHeight < 55) {
      this.addPage()
    }
  }

  drawText(text, x, y, size = 9, bold = false, r = 1, g = 1, b = 1) {
    const font = bold ? '/F2' : '/F1'
    const clean = escapePdf(text)
    this.currentPage.push(`${r} ${g} ${b} rg`)
    this.currentPage.push(`BT ${font} ${size} Tf ${x} ${y} Td (${clean}) Tj ET`)
  }

  drawRect(x, y, w, h, fillRgb = null, strokeRgb = null, lineWidth = 0.75) {
    if (fillRgb) {
      this.currentPage.push(`${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg`)
      this.currentPage.push(`${x} ${y} ${w} ${h} re f`)
    }
    if (strokeRgb) {
      this.currentPage.push(`${lineWidth} w`)
      this.currentPage.push(`${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG`)
      this.currentPage.push(`${x} ${y} ${w} ${h} re s`)
    }
  }

  build() {
    const totalPages = this.pages.length

    // Add page numbering & footer
    for (let p = 0; p < totalPages; p++) {
      const page = this.pages[p]
      page.push('0.35 0.40 0.45 rg')
      page.push(`BT /F1 8 Tf 40 25 Td (MKD Vehicle Management Report - Page ${p + 1} of ${totalPages}) Tj ET`)
    }

    const objects = []
    const pageObjNums = []
    let currentObj = 5

    for (let i = 0; i < totalPages; i++) {
      const pageNum = currentObj++
      const streamNum = currentObj++
      pageObjNums.push({
        pageNum,
        streamNum,
        content: this.pages[i].join('\n'),
      })
    }

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
    objects[2] = `<< /Type /Pages /Kids [${pageObjNums.map((p) => `${p.pageNum} 0 R`).join(' ')}] /Count ${totalPages} >>`
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

    for (const p of pageObjNums) {
      objects[p.pageNum] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${p.streamNum} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`
      const byteLen = new TextEncoder().encode(p.content).length
      objects[p.streamNum] = `<< /Length ${byteLen} >>\nstream\n${p.content}\nendstream`
    }

    let output = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
    const offsets = []

    for (let i = 1; i < objects.length; i++) {
      offsets[i] = new TextEncoder().encode(output).length
      output += `${i} 0 obj\n${objects[i]}\nendobj\n`
    }

    const startxref = new TextEncoder().encode(output).length
    output += `xref\n0 ${objects.length}\n`
    output += '0000000000 65535 f \n'
    for (let i = 1; i < objects.length; i++) {
      output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }
    output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`

    return output
  }
}

export function downloadVehiclePdf({
  primaryVehicle,
  periodLabel,
  dateRangeText,
  kpiData,
  filteredRefills = [],
  filteredCompletedServices = [],
  filteredServiceLogs = [],
  filteredRepairs = [],
  filteredModifications = [],
  vehicleDocuments = [],
  reportId,
  generatedDate,
}) {
  const doc = new PdfDocument()

  // 1. Header Banner Box
  doc.drawRect(40, doc.currentY - 90, 515, 90, [0.07, 0.09, 0.12], [0.64, 0.90, 0.21], 1)
  
  // MKD Header Tag
  doc.drawText('MKD VEHICLE MANAGEMENT · OFFICIAL VEHICLE REPORT', 52, doc.currentY - 20, 8, true, 0.64, 0.90, 0.21)

  // Vehicle Model
  const modelText = String(primaryVehicle?.model || 'Vehicle Report').toUpperCase()
  doc.drawText(modelText, 52, doc.currentY - 42, 17, true, 1, 1, 1)

  // Brand and category
  const subText = `${primaryVehicle?.brand || ''} · ${primaryVehicle?.category || 'Two Wheeler'} ${primaryVehicle?.subType ? `(${primaryVehicle.subType})` : ''}`
  doc.drawText(subText, 52, doc.currentY - 58, 9, true, 0.7, 0.73, 0.78)

  // Date range info
  doc.drawText(`History Range: ${periodLabel} (${dateRangeText})`, 52, doc.currentY - 76, 8, false, 0.64, 0.90, 0.21)

  // Registration Plate Badge on top-right
  const plate = primaryVehicle?.plate || '—'
  doc.drawRect(420, doc.currentY - 48, 120, 24, [0.12, 0.16, 0.21], [0.64, 0.90, 0.21], 0.8)
  doc.drawText(plate, 435, doc.currentY - 33, 11, true, 0.64, 0.90, 0.21)
  doc.drawText(`Generated: ${generatedDate}`, 425, doc.currentY - 62, 8, false, 0.65, 0.68, 0.72)
  doc.drawText(`ID: ${reportId}`, 425, doc.currentY - 74, 7, false, 0.45, 0.48, 0.52)

  doc.currentY -= 105

  // 2. KPI Summary Boxes (4 tiles)
  const tileW = 122
  const tileH = 46
  const gap = 9
  const tileX0 = 40
  const tileY = doc.currentY - tileH

  // Tile 1: Spend
  doc.drawRect(tileX0, tileY, tileW, tileH, [0.07, 0.09, 0.12], [0.2, 0.25, 0.3], 0.5)
  doc.drawText('SPEND IN RANGE', tileX0 + 8, tileY + 32, 7, true, 0.6, 0.64, 0.7)
  doc.drawText(`Rs. ${Math.round(kpiData?.totalSpend || 0).toLocaleString('en-IN')}`, tileX0 + 8, tileY + 16, 12, true, 0.64, 0.90, 0.21)
  doc.drawText(`Fuel + Svc + Mods`, tileX0 + 8, tileY + 6, 6, false, 0.45, 0.5, 0.55)

  // Tile 2: Mileage
  const tileX1 = tileX0 + tileW + gap
  doc.drawRect(tileX1, tileY, tileW, tileH, [0.07, 0.09, 0.12], [0.2, 0.25, 0.3], 0.5)
  doc.drawText('FUEL MILEAGE', tileX1 + 8, tileY + 32, 7, true, 0.6, 0.64, 0.7)
  doc.drawText(kpiData?.latestMileage > 0 ? `${kpiData.latestMileage} km/L` : '—', tileX1 + 8, tileY + 16, 12, true, 1, 1, 1)
  doc.drawText('Tank-to-Tank calculated', tileX1 + 8, tileY + 6, 6, false, 0.45, 0.5, 0.55)

  // Tile 3: Fuel Consumed
  const tileX2 = tileX1 + tileW + gap
  doc.drawRect(tileX2, tileY, tileW, tileH, [0.07, 0.09, 0.12], [0.2, 0.25, 0.3], 0.5)
  doc.drawText('FUEL VOLUME', tileX2 + 8, tileY + 32, 7, true, 0.6, 0.64, 0.7)
  doc.drawText(`${Number(kpiData?.totalLiters || 0).toFixed(1)} Liters`, tileX2 + 8, tileY + 16, 12, true, 1, 1, 1)
  doc.drawText(`Avg Rs. ${Number(kpiData?.avgRate || 0).toFixed(1)}/L`, tileX2 + 8, tileY + 6, 6, false, 0.45, 0.5, 0.55)

  // Tile 4: Health
  const tileX3 = tileX2 + tileW + gap
  doc.drawRect(tileX3, tileY, tileW, tileH, [0.07, 0.09, 0.12], [0.2, 0.25, 0.3], 0.5)
  doc.drawText('COMPONENT WEAR', tileX3 + 8, tileY + 32, 7, true, 0.6, 0.64, 0.7)
  doc.drawText(`${kpiData?.healthyCount || 18}/${kpiData?.totalItems || 18} Optimal`, tileX3 + 8, tileY + 16, 11, true, 0.64, 0.90, 0.21)
  doc.drawText('All critical systems', tileX3 + 8, tileY + 6, 6, false, 0.45, 0.5, 0.55)

  doc.currentY -= (tileH + 18)

  // Helper: Section Title
  const drawSectionTitle = (title) => {
    doc.checkSpace(40)
    doc.drawRect(40, doc.currentY - 14, 3, 14, [0.64, 0.90, 0.21])
    doc.drawText(title.toUpperCase(), 48, doc.currentY - 11, 9, true, 0.64, 0.90, 0.21)
    doc.currentY -= 20
  }

  // 3. Vehicle Specifications Grid
  drawSectionTitle('Vehicle Specifications & Details')
  const specH = 46
  doc.drawRect(40, doc.currentY - specH, 515, specH, [0.06, 0.08, 0.11], [0.15, 0.18, 0.23], 0.5)
  
  const colW = 125
  const sRow1 = doc.currentY - 18
  const sRow2 = doc.currentY - 38

  // Col 1
  doc.drawText('MODEL', 52, sRow1 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(`${primaryVehicle?.brand || ''} ${primaryVehicle?.model || ''}`, 52, sRow1 - 5, 8, true, 1, 1, 1)
  doc.drawText('CURRENT ODOMETER', 52, sRow2 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(`${Number(primaryVehicle?.mileage || 0).toLocaleString('en-IN')} km`, 52, sRow2 - 5, 8, true, 1, 1, 1)

  // Col 2
  doc.drawText('REGISTRATION', 52 + colW, sRow1 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(primaryVehicle?.plate || '—', 52 + colW, sRow1 - 5, 8, true, 0.64, 0.90, 0.21)
  doc.drawText('PURCHASE DATE', 52 + colW, sRow2 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(formatDisplayDate(primaryVehicle?.purchaseDate), 52 + colW, sRow2 - 5, 8, false, 0.9, 0.9, 0.9)

  // Col 3
  doc.drawText('ENGINE & FUEL', 52 + colW * 2, sRow1 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(`${primaryVehicle?.engineCc || 0} CC · ${primaryVehicle?.fuelType || 'Petrol'}`, 52 + colW * 2, sRow1 - 5, 8, true, 1, 1, 1)
  doc.drawText('EX-SHOWROOM', 52 + colW * 2, sRow2 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(primaryVehicle?.exShowroomPrice ? `Rs. ${Number(primaryVehicle.exShowroomPrice).toLocaleString('en-IN')}` : '—', 52 + colW * 2, sRow2 - 5, 8, false, 0.9, 0.9, 0.9)

  // Col 4
  doc.drawText('CATEGORY', 52 + colW * 3, sRow1 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(`${primaryVehicle?.category || 'Two Wheeler'}`, 52 + colW * 3, sRow1 - 5, 8, true, 1, 1, 1)
  doc.drawText('STATUS', 52 + colW * 3, sRow2 + 5, 6, true, 0.5, 0.55, 0.6)
  doc.drawText(primaryVehicle?.status || 'Active', 52 + colW * 3, sRow2 - 5, 8, true, 0.64, 0.90, 0.21)

  doc.currentY -= (specH + 18)

  // 4. Fuel Refills Table
  drawSectionTitle(`Fuel Refills & History (${filteredRefills.length} logs in period)`)
  const drawTableHeader = (headers, widths) => {
    doc.drawRect(40, doc.currentY - 16, 515, 16, [0.09, 0.12, 0.16])
    let curX = 46
    headers.forEach((h, i) => {
      doc.drawText(h, curX, doc.currentY - 11, 7, true, 0.7, 0.75, 0.8)
      curX += widths[i]
    })
    doc.currentY -= 17
  }

  const fuelCols = [70, 135, 75, 55, 55, 60, 65]
  drawTableHeader(['DATE', 'STATION & CITY', 'ODOMETER', 'LITERS', 'RATE', 'FILL TYPE', 'AMOUNT'], fuelCols)

  if (filteredRefills.length === 0) {
    doc.drawText('No fuel refill entries recorded in this range.', 46, doc.currentY - 12, 8, false, 0.5, 0.55, 0.6)
    doc.currentY -= 20
  } else {
    filteredRefills.forEach((r, idx) => {
      doc.checkSpace(18)
      const isEven = idx % 2 === 0
      doc.drawRect(40, doc.currentY - 15, 515, 15, isEven ? [0.06, 0.08, 0.11] : [0.04, 0.05, 0.07])
      
      let curX = 46
      doc.drawText(formatDisplayDate(r.refillDate), curX, doc.currentY - 11, 7, false, 0.9, 0.9, 0.9)
      curX += fuelCols[0]
      doc.drawText(r.stationName ? `${r.stationName}${r.location ? ` (${r.location})` : ''}` : 'Station', curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += fuelCols[1]
      doc.drawText(`${Number(r.odometerKm || 0).toLocaleString('en-IN')} km`, curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += fuelCols[2]
      doc.drawText(`${Number(r.liters || 0).toFixed(2)} L`, curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += fuelCols[3]
      doc.drawText(`Rs. ${Number(r.pricePerLiter || 0).toFixed(2)}`, curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += fuelCols[4]
      doc.drawText(r.fuelFillType || 'Partial', curX, doc.currentY - 11, 7, false, r.fuelFillType === 'Full Tank' ? 0.64 : 0.9, r.fuelFillType === 'Full Tank' ? 0.9 : 0.8, r.fuelFillType === 'Full Tank' ? 0.21 : 0.3)
      curX += fuelCols[5]
      doc.drawText(`Rs. ${Number(r.amountSpent || 0).toLocaleString('en-IN')}`, curX, doc.currentY - 11, 7, true, 0.64, 0.90, 0.21)

      doc.currentY -= 16
    })
  }

  doc.currentY -= 12

  // 5. Periodic Services & Maintenance Done
  drawSectionTitle(`Periodic Services & Maintenance Done (${filteredCompletedServices.length + filteredServiceLogs.length} logs)`)
  const svcCols = [140, 75, 75, 120, 105]
  drawTableHeader(['SERVICE TITLE', 'DATE', 'ODOMETER', 'CENTER / WORKSHOP', 'AMOUNT PAID'], svcCols)

  const allServices = [
    ...filteredCompletedServices.map((s) => ({
      title: s.title,
      date: formatDisplayDate(s.completedDate),
      odo: s.completedOdometerKm,
      center: s.serviceCenter || 'Service Center',
      amount: s.amountPaid,
    })),
    ...filteredServiceLogs.map((l) => ({
      title: l.componentName,
      date: formatDisplayDate(l.serviceDate),
      odo: l.odometerKm,
      center: l.serviceCenter || 'Workshop',
      amount: l.cost,
    })),
  ]

  if (allServices.length === 0) {
    doc.drawText('No services or maintenance records in this range.', 46, doc.currentY - 12, 8, false, 0.5, 0.55, 0.6)
    doc.currentY -= 20
  } else {
    allServices.forEach((s, idx) => {
      doc.checkSpace(18)
      const isEven = idx % 2 === 0
      doc.drawRect(40, doc.currentY - 15, 515, 15, isEven ? [0.06, 0.08, 0.11] : [0.04, 0.05, 0.07])
      
      let curX = 46
      doc.drawText(s.title || 'Service', curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += svcCols[0]
      doc.drawText(s.date || '—', curX, doc.currentY - 11, 7, false, 0.9, 0.9, 0.9)
      curX += svcCols[1]
      doc.drawText(s.odo ? `${Number(s.odo).toLocaleString('en-IN')} km` : '—', curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += svcCols[2]
      doc.drawText(s.center || '—', curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += svcCols[3]
      doc.drawText(`Rs. ${Number(s.amount || 0).toLocaleString('en-IN')}`, curX, doc.currentY - 11, 7, true, 0.64, 0.90, 0.21)

      doc.currentY -= 16
    })
  }

  doc.currentY -= 12

  // 6. Additional Repairs
  if (filteredRepairs.length > 0) {
    drawSectionTitle(`Additional Repairs (${filteredRepairs.length})`)
    const repCols = [140, 75, 75, 120, 105]
    drawTableHeader(['REPAIR TITLE', 'DATE', 'ODOMETER', 'WORKSHOP', 'COST'], repCols)

    filteredRepairs.forEach((rep, idx) => {
      doc.checkSpace(18)
      const isEven = idx % 2 === 0
      doc.drawRect(40, doc.currentY - 15, 515, 15, isEven ? [0.06, 0.08, 0.11] : [0.04, 0.05, 0.07])

      let curX = 46
      doc.drawText(rep.title || 'Repair', curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += repCols[0]
      doc.drawText(formatDisplayDate(rep.repairDate), curX, doc.currentY - 11, 7, false, 0.9, 0.9, 0.9)
      curX += repCols[1]
      doc.drawText(rep.odometerKm ? `${Number(rep.odometerKm).toLocaleString('en-IN')} km` : '—', curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += repCols[2]
      doc.drawText(rep.workshopName || 'Workshop', curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += repCols[3]
      doc.drawText(`Rs. ${Number(rep.cost || 0).toLocaleString('en-IN')}`, curX, doc.currentY - 11, 7, true, 0.64, 0.90, 0.21)

      doc.currentY -= 16
    })
    doc.currentY -= 12
  }

  // 7. Accessories, Modifications & Riding Gear
  if (filteredModifications.length > 0) {
    drawSectionTitle(`Accessories, Gear & Modifications (${filteredModifications.length})`)
    const modCols = [140, 90, 80, 100, 105]
    drawTableHeader(['ITEM TITLE', 'CATEGORY', 'BRAND', 'INSTALLED DATE', 'COST'], modCols)

    filteredModifications.forEach((mod, idx) => {
      doc.checkSpace(18)
      const isEven = idx % 2 === 0
      doc.drawRect(40, doc.currentY - 15, 515, 15, isEven ? [0.06, 0.08, 0.11] : [0.04, 0.05, 0.07])

      let curX = 46
      doc.drawText(mod.title || 'Accessory', curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += modCols[0]
      doc.drawText(mod.category || 'Accessory', curX, doc.currentY - 11, 7, false, 0.7, 0.85, 1)
      curX += modCols[1]
      doc.drawText(mod.brand || '—', curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)
      curX += modCols[2]
      doc.drawText(formatDisplayDate(mod.installedDate), curX, doc.currentY - 11, 7, false, 0.9, 0.9, 0.9)
      curX += modCols[3]
      doc.drawText(`Rs. ${Number(mod.cost || 0).toLocaleString('en-IN')}`, curX, doc.currentY - 11, 7, true, 0.64, 0.90, 0.21)

      doc.currentY -= 16
    })
    doc.currentY -= 12
  }

  // 8. Vehicle Documents
  if (vehicleDocuments.length > 0) {
    drawSectionTitle('Vehicle Legal Compliance & Documents')
    const docCols = [180, 110, 115, 110]
    drawTableHeader(['DOCUMENT NAME', 'POLICY / ID #', 'EXPIRY DATE', 'ISSUER / STATUS'], docCols)

    vehicleDocuments.forEach((d, idx) => {
      doc.checkSpace(18)
      const isEven = idx % 2 === 0
      doc.drawRect(40, doc.currentY - 15, 515, 15, isEven ? [0.06, 0.08, 0.11] : [0.04, 0.05, 0.07])

      let curX = 46
      const docTitle = d.title || d.name || 'Vehicle Document'
      const docNum = d.docNumber || d.policyNumber || 'Active'
      const issuer = d.issuer || 'Valid / Registered'

      doc.drawText(docTitle, curX, doc.currentY - 11, 7, true, 1, 1, 1)
      curX += docCols[0]
      doc.drawText(docNum, curX, doc.currentY - 11, 7, false, 0.64, 0.90, 0.21)
      curX += docCols[1]
      doc.drawText(formatDisplayDate(d.expiryDate), curX, doc.currentY - 11, 7, false, 0.9, 0.9, 0.9)
      curX += docCols[2]
      doc.drawText(issuer, curX, doc.currentY - 11, 7, false, 0.8, 0.85, 0.9)

      doc.currentY -= 16
    })
    doc.currentY -= 12
  }

  // Build binary string & trigger immediate download
  const pdfOutput = doc.build()
  const bytes = new Uint8Array(pdfOutput.length)
  for (let i = 0; i < pdfOutput.length; i++) {
    bytes[i] = pdfOutput.charCodeAt(i) & 0xff
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const cleanPlate = String(primaryVehicle?.plate || 'vehicle').replace(/\s+/g, '_')
  const cleanDate = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `Vehicle_Report_${cleanPlate}_${cleanDate}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
