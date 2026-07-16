import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { PaymentStatus, QuotationStatus } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT', 'CLIENT'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] as const
const APPROVE_ROLES = ['SUPER_ADMIN', 'ACCOUNTANT']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role

    const { id } = await params
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        items: { where: { isDeleted: false } },
        project: {
          select: {
            id: true, name: true, code: true, clientId: true,
            client: { select: { companyName: true, contactPerson: true } },
          },
        },
      },
    })

    if (!quotation || quotation.isDeleted) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    if (role === 'CLIENT' && quotation.project.clientId !== session!.user!.clientId) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quotation })
  } catch (error) {
    console.error('GET /api/quotations/[id] error:', error)
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
    const { title, status, quotationStatus, validUntil, terms, notes, discountAmount } = body

    const existing = await db.quotation.findUnique({ where: { id } })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    if (status) {
      if (!Object.values(PaymentStatus).includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 })
      }
      if (!APPROVE_ROLES.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Only a Super Admin or Accountant can change payment status' },
          { status: 403 }
        )
      }
    }

    if (quotationStatus && !Object.values(QuotationStatus).includes(quotationStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid quotationStatus value' }, { status: 400 })
    }

    const updateData: any = { updatedBy: userId }

    if (title) updateData.title = title
    if (status) updateData.status = status
    if (quotationStatus) updateData.quotationStatus = quotationStatus
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null
    if (terms !== undefined) updateData.terms = terms
    if (notes !== undefined) updateData.notes = notes
    if (discountAmount !== undefined) {
      const parsedDiscount = parseFloat(discountAmount)
      const preDiscountTotal = existing.totalAmount + existing.taxAmount
      if (Number.isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > preDiscountTotal) {
        return NextResponse.json(
          { success: false, error: `discountAmount must be a number between 0 and ${preDiscountTotal}` },
          { status: 400 }
        )
      }
      updateData.discountAmount = parsedDiscount
      updateData.grandTotal = preDiscountTotal - parsedDiscount
    }

    const updated = await db.quotation.update({
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
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...DELETE_ROLES])
  if (roleError) return roleError

  try {
    const { id } = await params

    const existing = await db.quotation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      return NextResponse.json({ success: true, message: 'Quotation deleted successfully' })
    }

    await db.quotation.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/quotations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
