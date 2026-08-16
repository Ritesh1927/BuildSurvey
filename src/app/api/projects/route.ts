import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, hasPermission, userHasPermission } from '@/lib/api-auth'
import { ProjectType } from '@/generated/prisma/enums'

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  // Full read, or - even without it - can at least see their own assigned
  // projects (Manager/Lead Engineer assignability, or a Surveyor's own
  // assigned surveys' projects).
  const permError = await requirePermission(
    'projects:read:all', 'projects:read:own',
    'projects:assignable:manager', 'projects:assignable:engineer', 'surveys:assignable'
  )
  if (permError) return permError

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
    const andConditions: any[] = []

    if (search) {
      const s = search.toLowerCase()
      andConditions.push({
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { code: { contains: s, mode: 'insensitive' } },
          { address: { contains: s, mode: 'insensitive' } },
          { city: { contains: s, mode: 'insensitive' } },
        ],
      })
    }

    if (status) where.status = status
    if (type) where.type = type
    if (clientId) where.clientId = clientId

    // Whoever's assigned as Manager sees those projects; whoever's
    // assignable as Lead Engineer sees those they lead; whoever's
    // assignable to surveys sees projects they have an assigned survey
    // on - a dual-capability user sees the union of all that apply.
    // Client only their own company's projects. None of these can be
    // widened by query params. Driven by permission, not a hardcoded
    // role list, so a custom role granted any of these is scoped the
    // same way.
    if (!hasPermission(session!.user!, 'projects:read:all')) {
      if (role === 'CLIENT') {
        where.clientId = session!.user!.clientId || '__no_client__'
      } else {
        const scopeConditions: any[] = []
        if (hasPermission(session!.user!, 'projects:assignable:manager')) scopeConditions.push({ managerId: userId })
        if (hasPermission(session!.user!, 'projects:assignable:engineer')) scopeConditions.push({ leadUserId: userId })
        if (hasPermission(session!.user!, 'surveys:assignable')) scopeConditions.push({ surveys: { some: { engineerId: userId, isDeleted: false } } })
        if (scopeConditions.length === 1) {
          Object.assign(where, scopeConditions[0])
        } else if (scopeConditions.length > 1) {
          andConditions.push({ OR: scopeConditions })
        } else {
          // Holds read:own but isn't a recognized own-scoping identity
          // (Client, or one of the assignable permissions above) - fail
          // closed to no results rather than falling through unscoped,
          // which would grant de facto read:all.
          where.id = '__none__'
        }
      }
    }

    if (andConditions.length > 0) where.AND = andConditions

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { companyName: true, contactPerson: true } },
          manager: { select: { firstName: true, lastName: true } },
          _count: {
            select: {
              surveys: { where: { isDeleted: false } },
              boqItems: { where: { isDeleted: false } },
            },
          },
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

  const permError = await requirePermission('projects:create')
  if (permError) return permError

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
      leadUserId,
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

    if (managerId && !(await userHasPermission(managerId, 'projects:assignable:manager'))) {
      return NextResponse.json(
        { success: false, error: 'This project can only be managed by someone whose role allows it' },
        { status: 400 }
      )
    }
    if (leadUserId && !(await userHasPermission(leadUserId, 'projects:assignable:engineer'))) {
      return NextResponse.json(
        { success: false, error: 'This project can only be led by someone whose role allows it' },
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
        leadUserId: leadUserId || null,
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
