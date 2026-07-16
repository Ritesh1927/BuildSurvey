import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT'] as const
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

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
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10) || 25, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const searchLower = search.toLowerCase()
      where.OR = [
        { companyName: { contains: searchLower, mode: 'insensitive' } },
        { contactPerson: { contains: searchLower, mode: 'insensitive' } },
        { email: { contains: searchLower, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.projects = { some: { type } }
    }

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { projects: true, leads: true } } },
      }),
      db.client.count({ where }),
    ])

    // Tax registration numbers are not shown to Engineer — no business
    // reason for field staff to see a client's GST/PAN.
    const redactTax = role === 'ENGINEER'

    return NextResponse.json({
      success: true,
      data: clients.map((c: any) => ({
        ...c,
        gstNumber: redactTax ? undefined : c.gstNumber,
        panNumber: redactTax ? undefined : c.panNumber,
        totalProjects: c._count.projects,
        totalLeads: c._count.leads,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...CREATE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()

    const body = await request.json()
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      gstNumber,
      panNumber,
      website,
      clientType,
      notes,
    } = body

    if (!companyName || !contactPerson || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Company name, contact person, email, and phone are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const existing = await db.client.findFirst({ where: { email, isDeleted: false } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A client with this email already exists' },
        { status: 409 }
      )
    }

    const client = await db.client.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || 'India',
        gstNumber: gstNumber || null,
        panNumber: panNumber || null,
        website: website || null,
        clientType: clientType || null,
        notes: notes || null,
        createdBy: session!.user!.id,
      },
    })

    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A client with this email already exists' },
        { status: 409 }
      )
    }
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
