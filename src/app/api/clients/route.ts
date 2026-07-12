import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)

    const where: any = { isDeleted: false }

    if (search) {
      const searchLower = search.toLowerCase()
      where.OR = [
        { companyName: { contains: searchLower, mode: 'insensitive' } },
        { contactPerson: { contains: searchLower, mode: 'insensitive' } },
        { email: { contains: searchLower, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

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

    return NextResponse.json({
      success: true,
      data: clients.map((c: any) => ({
        ...c,
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
  try {
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
      notes,
    } = body

    if (!companyName || !contactPerson || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Company name, contact person, email, and phone are required' },
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
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
