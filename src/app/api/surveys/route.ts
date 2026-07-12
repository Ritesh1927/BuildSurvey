import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const projectId = searchParams.get('projectId') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)

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
  try {
    const body = await request.json()
    const {
      projectId,
      title,
      description,
      type,
      scheduledDate,
      engineerId,
      priority,
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

    const survey = await db.survey.create({
      data: {
        projectId,
        title,
        description: description || null,
        type: type || 'INITIAL',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        engineerId: engineerId || null,
        weatherCondition: weatherCondition || null,
        siteCondition: siteCondition || null,
        accessDetails: accessDetails || null,
        notes: notes || null,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
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
