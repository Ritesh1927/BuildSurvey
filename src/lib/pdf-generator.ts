import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes } from 'pdf-lib'

export interface SurveyReportData {
  projectName: string
  projectCode: string
  clientName: string
  clientAddress: string
  surveyDate: string
  surveyType: string
  surveyId: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  measurements: Array<{
    item: string
    value: string
    unit: string
    remarks?: string
  }>
  checklist: Array<{
    item: string
    status: 'pass' | 'fail' | 'na'
    notes?: string
  }>
  photos: Array<{
    title: string
    description: string
  }>
  risks: Array<{
    severity: 'high' | 'medium' | 'low'
    description: string
    mitigation: string
  }>
  remarks: string
  preparedBy: string
  approvedBy: string
}

const COLORS = {
  primary: rgb(0.15, 0.31, 0.55),
  secondary: rgb(0.23, 0.51, 0.82),
  success: rgb(0.06, 0.73, 0.51),
  danger: rgb(0.86, 0.15, 0.17),
  warning: rgb(0.96, 0.62, 0.04),
  dark: rgb(0.13, 0.13, 0.13),
  gray: rgb(0.55, 0.55, 0.55),
  lightGray: rgb(0.85, 0.85, 0.85),
  white: rgb(1, 1, 1),
  bgColor: rgb(0.96, 0.96, 0.96),
}

function drawHeader(pdfDoc: PDFDocument, page: PDFPage, font: PDFFont, boldFont: PDFFont) {
  const { width } = page.getSize()

  page.drawRectangle({
    x: 0,
    y: page.getSize().height - 80,
    width,
    height: 80,
    color: COLORS.primary,
  })

  page.drawText('BuildSurvey Pro', {
    x: 50,
    y: page.getSize().height - 35,
    size: 24,
    font: boldFont,
    color: COLORS.white,
  })

  page.drawText('Construction Site Survey Platform', {
    x: 50,
    y: page.getSize().height - 55,
    size: 10,
    font,
    color: rgb(0.7, 0.8, 1),
  })

  page.drawText('www.buildsurveypro.in', {
    x: width - 180,
    y: page.getSize().height - 35,
    size: 9,
    font,
    color: rgb(0.7, 0.8, 1),
  })

  page.drawText('+91 98765 43210', {
    x: width - 180,
    y: page.getSize().height - 50,
    size: 9,
    font,
    color: rgb(0.7, 0.8, 1),
  })

  page.drawText('info@buildsurveypro.in', {
    x: width - 180,
    y: page.getSize().height - 65,
    size: 9,
    font,
    color: rgb(0.7, 0.8, 1),
  })
}

function drawFooter(pdfDoc: PDFDocument, page: PDFPage, font: PDFFont, pageNum: number, totalPages: number) {
  const { width } = page.getSize()

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 35,
    color: COLORS.bgColor,
  })

  page.drawLine({
    start: { x: 50, y: 35 },
    end: { x: width - 50, y: 35 },
    thickness: 0.5,
    color: COLORS.lightGray,
  })

  page.drawText('BuildSurvey Pro — Confidential', {
    x: 50,
    y: 15,
    size: 8,
    font,
    color: COLORS.gray,
  })

  page.drawText(`Page ${pageNum} of ${totalPages}`, {
    x: width - 120,
    y: 15,
    size: 8,
    font,
    color: COLORS.gray,
  })
}

function drawSectionTitle(page: PDFPage, title: string, y: number, font: PDFFont) {
  page.drawText(title, {
    x: 50,
    y,
    size: 13,
    font,
    color: COLORS.primary,
  })

  page.drawLine({
    start: { x: 50, y: y - 5 },
    end: { x: 500, y: y - 5 },
    thickness: 1,
    color: COLORS.secondary,
  })

  return y - 25
}

function drawFieldLabel(page: PDFPage, label: string, value: string, x: number, y: number, font: PDFFont, boldFont: PDFFont) {
  page.drawText(label, {
    x,
    y,
    size: 9,
    font,
    color: COLORS.gray,
  })
  page.drawText(value, {
    x,
    y: y - 15,
    size: 10,
    font: boldFont,
    color: COLORS.dark,
  })
  return y - 30
}

export async function generateSurveyReport(data: SurveyReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  let pageNum = 0

  // Page 1 - Cover & Project Details
  const page1 = pdfDoc.addPage(PageSizes.A4)
  pageNum++

  drawHeader(pdfDoc, page1, helvetica, helveticaBold)
  drawFooter(pdfDoc, page1, helvetica, pageNum, 4)

  let y = page1.getSize().height - 110

  page1.drawText('SURVEY REPORT', {
    x: 50,
    y,
    size: 18,
    font: helveticaBold,
    color: COLORS.primary,
  })

  page1.drawText(`Report ID: ${data.surveyId}`, {
    x: 50,
    y: y - 20,
    size: 10,
    font: helvetica,
    color: COLORS.gray,
  })

  page1.drawText(`Date: ${data.surveyDate}`, {
    x: 350,
    y: y - 20,
    size: 10,
    font: helvetica,
    color: COLORS.gray,
  })

  y -= 50

  y = drawSectionTitle(page1, 'PROJECT DETAILS', y, helveticaBold)

  y = drawFieldLabel(page1, 'Project Name', data.projectName, 50, y, helvetica, helveticaBold)
  y = drawFieldLabel(page1, 'Project Code', data.projectCode, 300, y + 30, helvetica, helveticaBold)

  y = drawFieldLabel(page1, 'Client Name', data.clientName, 50, y, helvetica, helveticaBold)
  y = drawFieldLabel(page1, 'Client Address', data.clientAddress, 300, y + 30, helvetica, helveticaBold)

  y = drawFieldLabel(page1, 'Survey Type', data.surveyType, 50, y, helvetica, helveticaBold)
  y = drawFieldLabel(page1, 'Survey Date', data.surveyDate, 300, y + 30, helvetica, helveticaBold)

  y -= 20

  y = drawSectionTitle(page1, 'GPS LOCATION', y, helveticaBold)

  y = drawFieldLabel(page1, 'Latitude', data.location.latitude.toString(), 50, y, helvetica, helveticaBold)
  y = drawFieldLabel(page1, 'Longitude', data.location.longitude.toString(), 200, y + 30, helvetica, helveticaBold)

  y = drawFieldLabel(page1, 'Address', data.location.address, 50, y, helvetica, helveticaBold)

  y -= 20

  // GPS Coordinates Box
  page1.drawRectangle({
    x: 50,
    y: y - 40,
    width: 495,
    height: 40,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    color: COLORS.bgColor,
  })

  page1.drawText(`📍  ${data.location.latitude}, ${data.location.longitude}`, {
    x: 65,
    y: y - 25,
    size: 10,
    font: helvetica,
    color: COLORS.dark,
  })

  page1.drawText(data.location.address, {
    x: 65,
    y: y - 40,
    size: 8,
    font: helveticaOblique,
    color: COLORS.gray,
  })

  // Page 2 - Measurements Table
  const page2 = pdfDoc.addPage(PageSizes.A4)
  pageNum++

  drawHeader(pdfDoc, page2, helvetica, helveticaBold)
  drawFooter(pdfDoc, page2, helvetica, pageNum, 4)

  y = page2.getSize().height - 110

  y = drawSectionTitle(page2, 'MEASUREMENTS', y, helveticaBold)

  // Table Header
  page2.drawRectangle({
    x: 50,
    y: y - 5,
    width: 495,
    height: 22,
    color: COLORS.primary,
  })

  const colX = [55, 200, 350, 420]
  const headers = ['Item', 'Value', 'Unit', 'Remarks']
  headers.forEach((header, i) => {
    page2.drawText(header, {
      x: colX[i],
      y: y,
      size: 9,
      font: helveticaBold,
      color: COLORS.white,
    })
  })

  y -= 30

  // Table Rows
  data.measurements.forEach((m, index) => {
    if (index % 2 === 0) {
      page2.drawRectangle({
        x: 50,
        y: y - 8,
        width: 495,
        height: 20,
        color: COLORS.bgColor,
      })
    }

    page2.drawText(m.item, { x: colX[0], y, size: 9, font: helvetica, color: COLORS.dark })
    page2.drawText(m.value, { x: colX[1], y, size: 9, font: helveticaBold, color: COLORS.dark })
    page2.drawText(m.unit, { x: colX[2], y, size: 9, font: helvetica, color: COLORS.dark })
    page2.drawText(m.remarks || '-', { x: colX[3], y, size: 9, font: helvetica, color: COLORS.gray })

    y -= 20
  })

  page2.drawRectangle({
    x: 50,
    y: y - 5,
    width: 495,
    height: 1,
    color: COLORS.lightGray,
  })

  y -= 30

  // Page 3 - Checklist & Photos
  const page3 = pdfDoc.addPage(PageSizes.A4)
  pageNum++

  drawHeader(pdfDoc, page3, helvetica, helveticaBold)
  drawFooter(pdfDoc, page3, helvetica, pageNum, 4)

  y = page3.getSize().height - 110

  y = drawSectionTitle(page3, 'CHECKLIST SUMMARY', y, helveticaBold)

  data.checklist.forEach((item) => {
    const statusIcon = item.status === 'pass' ? '✓' : item.status === 'fail' ? '✗' : '—'
    const statusColor = item.status === 'pass' ? COLORS.success : item.status === 'fail' ? COLORS.danger : COLORS.gray

    page3.drawRectangle({
      x: 50,
      y: y - 5,
      width: 495,
      height: 20,
      borderColor: COLORS.lightGray,
      borderWidth: 0.5,
    })

    page3.drawText(statusIcon, {
      x: 55,
      y,
      size: 10,
      font: helveticaBold,
      color: statusColor,
    })

    page3.drawText(item.item, {
      x: 75,
      y,
      size: 9,
      font: helvetica,
      color: COLORS.dark,
    })

    if (item.notes) {
      page3.drawText(item.notes, {
        x: 350,
        y,
        size: 8,
        font: helveticaOblique,
        color: COLORS.gray,
      })
    }

    y -= 20
  })

  y -= 20

  y = drawSectionTitle(page3, 'PHOTOS', y, helveticaBold)

  // Photo placeholders
  const photoCols = 3
  const photoW = 150
  const photoH = 100
  const gap = 15
  let photoY = y
  let photoX = 50

  data.photos.slice(0, 6).forEach((photo, index) => {
    if (index > 0 && index % photoCols === 0) {
      photoY -= photoH + 30
      photoX = 50
    }

    page3.drawRectangle({
      x: photoX,
      y: photoY - photoH,
      width: photoW,
      height: photoH,
      borderColor: COLORS.lightGray,
      borderWidth: 1,
      color: COLORS.bgColor,
    })

    page3.drawText('📷', {
      x: photoX + photoW / 2 - 10,
      y: photoY - photoH / 2,
      size: 16,
      font: helvetica,
      color: COLORS.gray,
    })

    page3.drawText(photo.title, {
      x: photoX,
      y: photoY - photoH - 12,
      size: 8,
      font: helveticaBold,
      color: COLORS.dark,
    })

    photoX += photoW + gap
  })

  // Page 4 - Risk Assessment, Remarks, Signatures
  const page4 = pdfDoc.addPage(PageSizes.A4)
  pageNum++

  drawHeader(pdfDoc, page4, helvetica, helveticaBold)
  drawFooter(pdfDoc, page4, helvetica, pageNum, 4)

  y = page4.getSize().height - 110

  y = drawSectionTitle(page4, 'RISK ASSESSMENT', y, helveticaBold)

  data.risks.forEach((risk) => {
    const severityColor = risk.severity === 'high' ? COLORS.danger : risk.severity === 'medium' ? COLORS.warning : COLORS.success

    page4.drawRectangle({
      x: 50,
      y: y - 5,
      width: 495,
      height: 45,
      borderColor: severityColor,
      borderWidth: 1,
    })

    page4.drawRectangle({
      x: 50,
      y: y - 5,
      width: 5,
      height: 45,
      color: severityColor,
    })

    page4.drawText(`[${risk.severity.toUpperCase()}]`, {
      x: 65,
      y: y + 8,
      size: 9,
      font: helveticaBold,
      color: severityColor,
    })

    page4.drawText(risk.description, {
      x: 65,
      y: y - 5,
      size: 9,
      font: helvetica,
      color: COLORS.dark,
    })

    page4.drawText(`Mitigation: ${risk.mitigation}`, {
      x: 65,
      y: y - 18,
      size: 8,
      font: helveticaOblique,
      color: COLORS.gray,
    })

    y -= 55
  })

  y -= 15

  y = drawSectionTitle(page4, 'REMARKS', y, helveticaBold)

  // Wrap remarks text
  const remarkLines = data.remarks.match(/.{1,80}/g) || [data.remarks]
  remarkLines.forEach((line) => {
    page4.drawText(line, {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: COLORS.dark,
    })
    y -= 15
  })

  y -= 30

  y = drawSectionTitle(page4, 'SIGNATURES', y, helveticaBold)

  // Prepared By
  page4.drawText('Prepared By:', {
    x: 50,
    y,
    size: 9,
    font: helvetica,
    color: COLORS.gray,
  })

  page4.drawLine({
    start: { x: 50, y: y - 25 },
    end: { x: 250, y: y - 25 },
    thickness: 0.5,
    color: COLORS.lightGray,
  })

  page4.drawText(data.preparedBy, {
    x: 50,
    y: y - 40,
    size: 10,
    font: helveticaBold,
    color: COLORS.dark,
  })

  page4.drawText(`Date: ${data.surveyDate}`, {
    x: 50,
    y: y - 55,
    size: 8,
    font: helvetica,
    color: COLORS.gray,
  })

  // Approved By
  page4.drawText('Approved By:', {
    x: 300,
    y,
    size: 9,
    font: helvetica,
    color: COLORS.gray,
  })

  page4.drawLine({
    start: { x: 300, y: y - 25 },
    end: { x: 500, y: y - 25 },
    thickness: 0.5,
    color: COLORS.lightGray,
  })

  page4.drawText(data.approvedBy, {
    x: 300,
    y: y - 40,
    size: 10,
    font: helveticaBold,
    color: COLORS.dark,
  })

  page4.drawText(`Date: ${data.surveyDate}`, {
    x: 300,
    y: y - 55,
    size: 8,
    font: helvetica,
    color: COLORS.gray,
  })

  y -= 80

  // QR Code Placeholder
  page4.drawRectangle({
    x: 230,
    y: y - 60,
    width: 60,
    height: 60,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    color: COLORS.white,
  })

  page4.drawText('QR', {
    x: 250,
    y: y - 38,
    size: 12,
    font: helveticaBold,
    color: COLORS.gray,
  })

  page4.drawText('Scan to verify', {
    x: 220,
    y: y - 75,
    size: 8,
    font: helveticaOblique,
    color: COLORS.gray,
  })

  return pdfDoc.save()
}

export interface InvoicePdfItem {
  description: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
}

export interface InvoicePdfData {
  invoiceNumber: string
  title: string
  date: string
  validUntil?: string | null
  clientName: string
  clientContact?: string
  projectName: string
  items: InvoicePdfItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  terms?: string | null
}

// pdf-lib's standard fonts use WinAnsi encoding, which has no ₹ glyph —
// drawText() throws if it hits one, so invoices spell the amount out instead.
function formatInr(amount: number): string {
  return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}...` : text
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pages: PDFPage[] = []
  const tableLeft = 50
  const tableRight = 545
  const colX = { sno: 55, desc: 85, unit: 265, qty: 305, rate: 345, amount: 450 }

  let page!: PDFPage
  let y = 0

  const addPage = () => {
    page = pdfDoc.addPage(PageSizes.A4)
    pages.push(page)
    drawHeader(pdfDoc, page, helvetica, helveticaBold)
    y = page.getSize().height - 110
  }

  const drawTableHeaderRow = () => {
    page.drawRectangle({ x: tableLeft, y: y - 5, width: tableRight - tableLeft, height: 22, color: COLORS.primary })
    page.drawText('#', { x: colX.sno, y, size: 9, font: helveticaBold, color: COLORS.white })
    page.drawText('Description', { x: colX.desc, y, size: 9, font: helveticaBold, color: COLORS.white })
    page.drawText('Unit', { x: colX.unit, y, size: 9, font: helveticaBold, color: COLORS.white })
    page.drawText('Qty', { x: colX.qty, y, size: 9, font: helveticaBold, color: COLORS.white })
    page.drawText('Rate', { x: colX.rate, y, size: 9, font: helveticaBold, color: COLORS.white })
    page.drawText('Amount', { x: colX.amount, y, size: 9, font: helveticaBold, color: COLORS.white })
    y -= 28
  }

  addPage()

  page.drawText('INVOICE', { x: 50, y, size: 20, font: helveticaBold, color: COLORS.primary })
  page.drawText(data.invoiceNumber, { x: tableRight - 130, y, size: 12, font: helveticaBold, color: COLORS.dark })
  page.drawText(`Date: ${data.date}`, { x: tableRight - 130, y: y - 16, size: 9, font: helvetica, color: COLORS.gray })
  if (data.validUntil) {
    page.drawText(`Valid Until: ${data.validUntil}`, { x: tableRight - 130, y: y - 30, size: 9, font: helvetica, color: COLORS.gray })
  }
  y -= 55

  page.drawText('Bill To', { x: 50, y, size: 9, font: helvetica, color: COLORS.gray })
  page.drawText(data.clientName, { x: 50, y: y - 15, size: 11, font: helveticaBold, color: COLORS.dark })
  if (data.clientContact) {
    page.drawText(data.clientContact, { x: 50, y: y - 30, size: 9, font: helvetica, color: COLORS.gray })
  }

  page.drawText('Project', { x: 300, y, size: 9, font: helvetica, color: COLORS.gray })
  page.drawText(truncate(data.projectName, 40), { x: 300, y: y - 15, size: 11, font: helveticaBold, color: COLORS.dark })
  y -= 50

  page.drawText(`Subject: ${truncate(data.title, 70)}`, { x: 50, y, size: 10, font: helveticaBold, color: COLORS.dark })
  y -= 30

  drawTableHeaderRow()

  data.items.forEach((item, index) => {
    if (y < 110) {
      addPage()
      drawTableHeaderRow()
    }
    if (index % 2 === 0) {
      page.drawRectangle({ x: tableLeft, y: y - 6, width: tableRight - tableLeft, height: 18, color: COLORS.bgColor })
    }
    page.drawText(String(index + 1), { x: colX.sno, y, size: 9, font: helvetica, color: COLORS.dark })
    page.drawText(truncate(item.description, 32), { x: colX.desc, y, size: 9, font: helvetica, color: COLORS.dark })
    page.drawText(item.unit, { x: colX.unit, y, size: 9, font: helvetica, color: COLORS.dark })
    page.drawText(String(item.quantity), { x: colX.qty, y, size: 9, font: helvetica, color: COLORS.dark })
    page.drawText(formatInr(item.unitRate), { x: colX.rate, y, size: 8, font: helvetica, color: COLORS.dark })
    page.drawText(formatInr(item.amount), { x: colX.amount, y, size: 8, font: helveticaBold, color: COLORS.dark })
    y -= 20
  })

  y -= 8
  page.drawLine({ start: { x: tableLeft, y }, end: { x: tableRight, y }, thickness: 1, color: COLORS.lightGray })
  y -= 22

  if (y < 140) {
    addPage()
  }

  const totalsLabelX = 380
  const totalsValueX = 470
  const drawTotalRow = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: totalsLabelX, y, size: 10, font: bold ? helveticaBold : helvetica, color: bold ? COLORS.dark : COLORS.gray })
    page.drawText(value, { x: totalsValueX, y, size: 10, font: bold ? helveticaBold : helvetica, color: COLORS.dark })
    y -= 18
  }

  drawTotalRow('Subtotal', formatInr(data.subtotal))
  if (data.discountAmount > 0) {
    drawTotalRow('Discount', `- ${formatInr(data.discountAmount)}`)
  }
  drawTotalRow('Tax', formatInr(data.taxAmount))
  page.drawLine({ start: { x: totalsLabelX, y: y + 12 }, end: { x: tableRight, y: y + 12 }, thickness: 1, color: COLORS.primary })
  drawTotalRow('Grand Total', formatInr(data.grandTotal), true)

  if (data.terms) {
    y -= 20
    if (y < 100) addPage()
    page.drawText('Terms & Conditions', { x: 50, y, size: 10, font: helveticaBold, color: COLORS.primary })
    y -= 18
    for (const rawLine of data.terms.split('\n')) {
      const wrapped = rawLine.match(/.{1,95}/g) || ['']
      for (const line of wrapped) {
        if (y < 60) {
          addPage()
        }
        page.drawText(line, { x: 50, y, size: 8, font: helvetica, color: COLORS.gray })
        y -= 12
      }
    }
  }

  const totalPages = pages.length
  pages.forEach((p, i) => drawFooter(pdfDoc, p, helvetica, i + 1, totalPages))

  return pdfDoc.save()
}

export function downloadPdf(data: Uint8Array, filename: string) {
  const bytes = data.slice().buffer as ArrayBuffer
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
