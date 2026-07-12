import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quotation = await (db as any).quotation.findUnique({
      where: { id },
      include: {
        items: { where: { isDeleted: false } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quotation })
  } catch (error) {
    console.error('GET /api/quotations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, status, validUntil, terms, notes, discountAmount } = body

    const existing = await (db as any).quotation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (title) updateData.title = title
    if (status) updateData.status = status
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
    if (terms !== undefined) updateData.terms = terms
    if (notes !== undefined) updateData.notes = notes
    if (discountAmount !== undefined) {
      updateData.discountAmount = parseFloat(discountAmount)
      updateData.grandTotal = existing.totalAmount + existing.taxAmount - parseFloat(discountAmount)
    }

    const updated = await (db as any).quotation.update({
      where: { id },
      data: updateData,
      include: {
        items: { where: { isDeleted: false } },
        project: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/quotations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await (db as any).quotation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    await (db as any).quotation.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/quotations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
