import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, hasPermission, userHasPermission } from '@/lib/api-auth'
import { LeadStatus, Priority } from '@/generated/prisma/enums'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('leads:read', 'leads:assignable')
  if (permError) return permError

  try {
    const session = await auth()
    const { id } = await params
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        client: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      },
    })

    if (!lead || lead.isDeleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (!hasPermission(session!.user!, 'leads:read') && lead.assignedToId !== session!.user!.id) {
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

  const permError = await requirePermission('leads:write')
  if (permError) return permError

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

    if (assignedToId) {
      // Only a role granted leads:assignable owns a lead through its
      // lifecycle - enforced here, not just hidden in the picker, so a
      // stray API call can't bypass it.
      const assignee = await db.user.findUnique({ where: { id: assignedToId } })
      if (!assignee || assignee.isDeleted || !(await userHasPermission(assignedToId, 'leads:assignable'))) {
        return NextResponse.json(
          { success: false, error: 'This lead can only be assigned to someone whose role allows it' },
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

  const permError = await requirePermission('leads:delete')
  if (permError) return permError

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
