import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'ACCOUNTANT', 'CLIENT'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT'] as const
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id } = await params
    const item = await db.bOQItem.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true, name: true, code: true, leadUserId: true, clientId: true,
            surveys: { where: { isDeleted: false }, select: { engineerId: true } },
          },
        },
      },
    })

    if (!item || item.isDeleted) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    if (role === 'ENGINEER' && item.project.leadUserId !== userId) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }
    if (role === 'SURVEYOR' && !item.project.surveys.some((s: any) => s.engineerId === userId)) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }
    if (role === 'CLIENT' && item.project.clientId !== session!.user!.clientId) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('GET /api/boq/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json()
    const { serialNumber, description, category, unit, quantity, unitRate, notes } = body

    const existing = await db.bOQItem.findUnique({
      where: { id },
      include: { project: { select: { leadUserId: true } } },
    })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    if (role === 'ENGINEER' && existing.project.leadUserId !== userId) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    if (quantity !== undefined) {
      const parsed = parseFloat(quantity)
      if (Number.isNaN(parsed) || parsed < 0) {
        return NextResponse.json({ success: false, error: 'quantity must be a non-negative number' }, { status: 400 })
      }
    }
    if (unitRate !== undefined) {
      const parsed = parseFloat(unitRate)
      if (Number.isNaN(parsed) || parsed < 0) {
        return NextResponse.json({ success: false, error: 'unitRate must be a non-negative number' }, { status: 400 })
      }
    }

    const updateData: any = { updatedBy: userId }

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

    const updated = await db.bOQItem.update({
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
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...DELETE_ROLES])
  if (roleError) return roleError

  try {
    const { id } = await params

    const existing = await db.bOQItem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      return NextResponse.json({ success: true, message: 'BOQ item deleted successfully' })
    }

    await db.bOQItem.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'BOQ item deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/boq/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
