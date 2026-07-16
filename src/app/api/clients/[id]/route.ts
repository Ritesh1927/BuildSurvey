import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT', 'CLIENT'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const
const DELETE_ROLES = ['SUPER_ADMIN'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role

    const { id } = await params

    // A client login only ever sees their own company record — leads are
    // excluded from what they can see even for themselves (pre-relationship
    // sales data: internal notes, priority, source), same reasoning as the
    // Leads module's own CLIENT denial.
    if (role === 'CLIENT' && id !== session!.user!.clientId) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    const client = await db.client.findUnique({
      where: { id },
      include: {
        projects: { where: { isDeleted: false }, select: { id: true, name: true, code: true, status: true } },
        ...(role === 'CLIENT' ? {} : { leads: { where: { isDeleted: false }, select: { id: true, name: true, status: true, createdAt: true } } }),
      },
    })

    if (!client || client.isDeleted) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    const data: any = { ...client }
    if (role === 'ENGINEER') {
      data.gstNumber = undefined
      data.panNumber = undefined
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)
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
      companyName, contactPerson, email, phone, address, city, state,
      zipCode, country, gstNumber, panNumber, website, clientType, notes,
    } = body

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
      }
      if (email !== existing.email) {
        const dup = await db.client.findFirst({ where: { email, isDeleted: false } })
        if (dup) {
          return NextResponse.json({ success: false, error: 'A client with this email already exists' }, { status: 409 })
        }
      }
    }

    const updateData: any = { updatedBy: session!.user!.id }

    if (companyName) updateData.companyName = companyName
    if (contactPerson) updateData.contactPerson = contactPerson
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (country !== undefined) updateData.country = country
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber
    if (panNumber !== undefined) updateData.panNumber = panNumber
    if (website !== undefined) updateData.website = website
    if (clientType !== undefined) updateData.clientType = clientType
    if (notes !== undefined) updateData.notes = notes

    const updated = await db.client.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A client with this email already exists' },
        { status: 409 }
      )
    }
    console.error('PATCH /api/clients/[id] error:', error)
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

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      return NextResponse.json({ success: true, message: 'Client deleted successfully' })
    }

    await db.client.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Client deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
