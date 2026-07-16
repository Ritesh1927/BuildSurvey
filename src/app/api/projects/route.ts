import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { ProjectType } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'ACCOUNTANT', 'CLIENT'] as const
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const

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
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const clientId = searchParams.get('clientId') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10) || 25, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { code: { contains: s, mode: 'insensitive' } },
        { address: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (type) where.type = type
    if (clientId) where.clientId = clientId

    // Engineer sees only projects they lead; Surveyor only projects they
    // have an assigned survey on; Client only their own company's
    // projects. None of these can be widened by query params.
    if (role === 'ENGINEER') {
      where.leadUserId = userId
    } else if (role === 'SURVEYOR') {
      where.surveys = { some: { engineerId: userId, isDeleted: false } }
    } else if (role === 'CLIENT') {
      where.clientId = session!.user!.clientId || '__no_client__'
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { companyName: true, contactPerson: true } },
          manager: { select: { firstName: true, lastName: true } },
          _count: { select: { surveys: true, boqItems: true } },
        },
      }),
      db.project.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: projects.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        type: p.type,
        status: p.status,
        budget: p.budget,
        actualCost: p.actualCost,
        startDate: p.startDate,
        endDate: p.endDate,
        address: p.address,
        city: p.city,
        state: p.state,
        clientId: p.clientId,
        clientName: p.client?.companyName || '',
        managerId: p.managerId,
        managerName: p.manager
          ? `${p.manager.firstName} ${p.manager.lastName}`
          : 'Unassigned',
        progress:
          p.status === 'COMPLETED'
            ? 100
            : p.status === 'PLANNING'
              ? 5
              : Math.min(90, Math.round(((p.actualCost || 0) / (p.budget || 1)) * 100)),
        surveyCount: p._count.surveys,
        boqCount: p._count.boqItems,
        createdAt: p.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
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
    const role = session!.user!.role
    const userId = session!.user!.id

    const body = await request.json()
    const {
      name,
      code,
      description,
      type,
      clientId,
      managerId,
      startDate,
      endDate,
      budget,
      address,
      city,
      state,
      latitude,
      longitude,
      area,
      floors,
    } = body

    if (!name || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Project name and client are required' },
        { status: 400 }
      )
    }

    if (type && !Object.values(ProjectType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project type' },
        { status: 400 }
      )
    }

    const client = await db.client.findUnique({ where: { id: clientId } })
    if (!client || client.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 400 }
      )
    }

    // Manager creating a project defaults to leading it themselves unless
    // they explicitly hand it to someone else.
    const resolvedManagerId = managerId || (role === 'MANAGER' ? userId : null)

    const projectCode = code || `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`

    const project = await db.project.create({
      data: {
        name,
        code: projectCode,
        description: description || null,
        type: type || 'RESIDENTIAL',
        clientId,
        managerId: resolvedManagerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget !== undefined && budget !== null && budget !== '' ? parseFloat(budget) : null,
        address: address || null,
        city: city || null,
        state: state || null,
        latitude: latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null,
        area: area ? parseFloat(area) : null,
        floors: floors ? parseInt(floors) : null,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Project code already exists, please retry' },
        { status: 409 }
      )
    }
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
