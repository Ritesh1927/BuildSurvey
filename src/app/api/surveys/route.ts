import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { SurveyType } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const SCOPED_ROLES = ['ENGINEER', 'SURVEYOR']

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
    const projectId = searchParams.get('projectId') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10) || 25, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (type) where.type = type
    if (projectId) where.projectId = projectId

    // Engineer/Surveyor only ever see surveys assigned to themselves.
    if (SCOPED_ROLES.includes(role)) {
      where.engineerId = userId
    }

    const [surveys, total] = await Promise.all([
      db.survey.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { name: true, code: true } },
          engineer: { select: { firstName: true, lastName: true } },
          _count: { select: { checklistItems: true, photos: true } },
        },
      }),
      db.survey.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: surveys.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        type: s.type,
        status: s.status,
        scheduledDate: s.scheduledDate,
        completedDate: s.completedDate,
        projectId: s.projectId,
        projectName: s.project?.name || '',
        projectCode: s.project?.code || '',
        engineerId: s.engineerId,
        engineerName: s.engineer
          ? `${s.engineer.firstName} ${s.engineer.lastName}`
          : 'Unassigned',
        weatherCondition: s.weatherCondition,
        siteCondition: s.siteCondition,
        notes: s.notes,
        checklistCount: s._count.checklistItems,
        photoCount: s._count.photos,
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch surveys:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch surveys' },
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
      projectId,
      title,
      description,
      type,
      scheduledDate,
      engineerId,
      weatherCondition,
      siteCondition,
      accessDetails,
      notes,
      gpsLatitude,
      gpsLongitude,
      checklistItems,
    } = body

    if (!projectId || !title) {
      return NextResponse.json(
        { success: false, error: 'Project and title are required' },
        { status: 400 }
      )
    }

    if (type && !Object.values(SurveyType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey type' },
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

    // Engineer/Surveyor creating a survey defaults to assigning it to
    // themselves; explicitly assigning it to someone else is an
    // Assign-tier action, so reject rather than silently overriding —
    // silently ignoring their choice would be worse than an error.
    if (SCOPED_ROLES.includes(role) && engineerId && engineerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only assign a survey to yourself' },
        { status: 403 }
      )
    }
    const resolvedEngineerId =
      SCOPED_ROLES.includes(role) ? userId : (engineerId || null)

    const survey = await db.survey.create({
      data: {
        projectId,
        title,
        description: description || null,
        type: type || 'INITIAL',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        engineerId: resolvedEngineerId,
        weatherCondition: weatherCondition || null,
        siteCondition: siteCondition || null,
        accessDetails: accessDetails || null,
        notes: notes || null,
        gpsLatitude: gpsLatitude !== undefined && gpsLatitude !== null && gpsLatitude !== '' ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude !== undefined && gpsLongitude !== null && gpsLongitude !== '' ? parseFloat(gpsLongitude) : null,
        createdBy: userId,
        checklistItems: checklistItems?.length
          ? {
              create: checklistItems.map((item: any) => ({
                category: item.category || 'General',
                item: item.item,
                isCompleted: false,
                notes: item.notes || null,
              })),
            }
          : undefined,
      },
      include: { _count: { select: { checklistItems: true } } },
    })

    return NextResponse.json({ success: true, data: survey }, { status: 201 })
  } catch (error) {
    console.error('Failed to create survey:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}
