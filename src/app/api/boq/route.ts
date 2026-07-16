import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'ACCOUNTANT', 'CLIENT'] as const
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] as const

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const projectId = searchParams.get('projectId') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10) || 10, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { description: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (projectId) where.projectId = projectId
    if (category) where.category = category

    // BOQ line items carry pricing — Engineer/Surveyor only see items
    // for projects they're actually attached to, same scoping as the
    // Projects module itself.
    if (role === 'ENGINEER') {
      where.project = { leadUserId: userId }
    } else if (role === 'SURVEYOR') {
      where.project = { surveys: { some: { engineerId: userId, isDeleted: false } } }
    } else if (role === 'CLIENT') {
      // Sharing the BOQ with the client it belongs to is standard
      // practice for most construction contracts — defaulting to allow,
      // flagged as a judgment call worth confirming.
      where.project = { clientId: session!.user!.clientId || '__no_client__' }
    }

    const [items, total] = await Promise.all([
      db.bOQItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { serialNumber: 'asc' },
        include: { project: { select: { id: true, name: true, code: true } } },
      }),
      db.bOQItem.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to fetch BOQ items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch BOQ items' },
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
    const userId = session!.user!.id

    const body = await request.json()
    const { projectId, serialNumber, description, category, unit, quantity, unitRate, notes } = body

    if (!projectId || !serialNumber || !description || !category || !unit || quantity === undefined || unitRate === undefined) {
      return NextResponse.json(
        { success: false, error: 'projectId, serialNumber, description, category, unit, quantity, and unitRate are required' },
        { status: 400 }
      )
    }

    const parsedQuantity = parseFloat(quantity)
    const parsedRate = parseFloat(unitRate)
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0 || Number.isNaN(parsedRate) || parsedRate < 0) {
      return NextResponse.json(
        { success: false, error: 'quantity and unitRate must be non-negative numbers' },
        { status: 400 }
      )
    }

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project || project.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 400 }
      )
    }

    const item = await db.bOQItem.create({
      data: {
        projectId,
        serialNumber: parseInt(serialNumber, 10),
        description,
        category,
        unit,
        quantity: parsedQuantity,
        unitRate: parsedRate,
        amount: parsedQuantity * parsedRate,
        notes: notes || null,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Failed to create BOQ item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create BOQ item' },
      { status: 500 }
    )
  }
}
