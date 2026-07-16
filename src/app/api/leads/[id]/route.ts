import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { LeadStatus, Priority } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const
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
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        client: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      },
    })

    // Soft-deleted leads and ownership-denied Engineer requests are both
    // treated as not-found, to avoid revealing a record's existence to
    // someone not entitled to see it.
    if (!lead || lead.isDeleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (role === 'ENGINEER' && lead.assignedToId !== session!.user!.id) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error)
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

    const { id } = await params
    const body = await req.json()
    const {
      name, email, phone, company, source, status, priority,
      estimatedValue, notes, assignedToId,
    } = body
    // clientId and convertedAt are system-managed: never accepted here,
    // for any role — they change only through the lead-conversion action.

    const existing = await db.lead.findUnique({ where: { id } })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (status && !Object.values(LeadStatus).includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 })
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      return NextResponse.json({ success: false, error: 'Invalid priority value' }, { status: 400 })
    }

    if (estimatedValue !== undefined && estimatedValue !== null && estimatedValue !== '') {
      const parsed = parseFloat(estimatedValue)
      if (Number.isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { success: false, error: 'estimatedValue must be a non-negative number' },
          { status: 400 }
        )
      }
    }

    const updateData: any = { updatedBy: session!.user!.id }

    if (name) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (company !== undefined) updateData.company = company
    if (source !== undefined) updateData.source = source
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue !== null && estimatedValue !== '' ? parseFloat(estimatedValue) : null
    if (notes !== undefined) updateData.notes = notes
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId

    const updated = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, companyName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/leads/[id] error:', error)
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

    const existing = await db.lead.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      // Already deleted — safe no-op rather than an error.
      return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
    }

    await db.lead.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
