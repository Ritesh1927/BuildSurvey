import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { LeadStatus, Priority } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const
const BACKFILL_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const assignedTo = searchParams.get('assignedTo') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10) || 10, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { company: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status

    if (role === 'ENGINEER') {
      // Engineers may only ever see leads assigned to themselves — the
      // client-supplied assignedTo filter is never honored for this role.
      where.assignedToId = session!.user!.id
    } else if (assignedTo) {
      where.assignedToId = assignedTo
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { firstName: true, lastName: true } },
          client: { select: { companyName: true } },
        },
      }),
      db.lead.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: leads.map((l: any) => ({
        ...l,
        assigneeName: l.assignedTo
          ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}`
          : 'Unassigned',
        clientName: l.client?.companyName || null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role

    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      priority,
      estimatedValue,
      notes,
      assignedToId,
    } = body
    // clientId and convertedAt are system-managed and are never accepted
    // from the request body, for any role — they are set exclusively by
    // the (separate) lead-conversion action.

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Lead name is required' },
        { status: 400 }
      )
    }

    if (status && !Object.values(LeadStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority value' },
        { status: 400 }
      )
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

    // Creation always defaults to NEW. A non-NEW initial status is only
    // honored for SUPER_ADMIN/ADMIN as an explicit backfill/migration
    // exception — Managers always create leads as NEW.
    const initialStatus =
      status && (BACKFILL_ROLES as readonly string[]).includes(role) ? status : 'NEW'

    const lead = await db.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source: source || null,
        status: initialStatus,
        priority: priority || 'MEDIUM',
        estimatedValue: estimatedValue !== undefined && estimatedValue !== null && estimatedValue !== '' ? parseFloat(estimatedValue) : null,
        notes: notes || null,
        assignedToId: assignedToId || null,
        createdBy: session!.user!.id,
      },
    })

    return NextResponse.json({ success: true, data: lead }, { status: 201 })
  } catch (error) {
    console.error('Failed to create lead:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
