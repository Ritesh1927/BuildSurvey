import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await (db as any).bOQItem.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    if (!item) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('GET /api/boq/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { serialNumber, description, category, unit, quantity, unitRate, notes } = body

    const existing = await (db as any).bOQItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (serialNumber !== undefined) updateData.serialNumber = parseInt(serialNumber, 10)
    if (description) updateData.description = description
    if (category) updateData.category = category
    if (unit) updateData.unit = unit
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity)
    if (unitRate !== undefined) updateData.unitRate = parseFloat(unitRate)
    if (notes !== undefined) updateData.notes = notes

    if (updateData.quantity !== undefined || updateData.unitRate !== undefined) {
      const qty = updateData.quantity !== undefined ? updateData.quantity : existing.quantity
      const rate = updateData.unitRate !== undefined ? updateData.unitRate : existing.unitRate
      updateData.amount = qty * rate
    }

    const updated = await (db as any).bOQItem.update({
      where: { id },
      data: updateData,
      include: { project: { select: { id: true, name: true, code: true } } },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/boq/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await (db as any).bOQItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    await (db as any).bOQItem.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'BOQ item deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/boq/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
