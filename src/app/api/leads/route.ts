import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const assignedTo = searchParams.get('assignedTo') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

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
    if (assignedTo) where.assignedToId = assignedTo

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
  try {
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
      clientId,
      followUpDate,
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Lead name is required' },
        { status: 400 }
      )
    }

    const lead = await db.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source: source || null,
        status: status || 'NEW',
        priority: priority || 'MEDIUM',
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        notes: notes || null,
        assignedToId: assignedToId || null,
        clientId: clientId || null,
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
