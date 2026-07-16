import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { RiskLevel } from '@/generated/prisma/enums'

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
    const surveyId = searchParams.get('surveyId') || ''
    const level = searchParams.get('level') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10) || 10, 100)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (surveyId) where.surveyId = surveyId
    if (level) where.level = level

    if (SCOPED_ROLES.includes(role)) {
      where.identifiedById = userId
    }

    const [risks, total] = await Promise.all([
      db.riskAssessment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          survey: { select: { id: true, title: true, projectId: true } },
          identifiedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      db.riskAssessment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: risks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to fetch risk assessments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk assessments' },
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
    const { title, description, surveyId, identifiedById, level, mitigation } = body

    if (!title || !description || !surveyId) {
      return NextResponse.json(
        { success: false, error: 'title, description, and surveyId are required' },
        { status: 400 }
      )
    }

    if (level && !Object.values(RiskLevel).includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid risk level' },
        { status: 400 }
      )
    }

    const survey = await db.survey.findUnique({ where: { id: surveyId } })
    if (!survey || survey.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Survey not found' },
        { status: 400 }
      )
    }

    // Engineer/Surveyor always identify the risk themselves; only the
    // Assign tier can attribute a risk to someone else — reject an
    // explicit mismatch rather than silently overriding it.
    if (SCOPED_ROLES.includes(role) && identifiedById && identifiedById !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only identify a risk as yourself' },
        { status: 403 }
      )
    }
    const resolvedIdentifiedById =
      SCOPED_ROLES.includes(role) ? userId : (identifiedById || userId)

    const risk = await db.riskAssessment.create({
      data: {
        title,
        description,
        surveyId,
        identifiedById: resolvedIdentifiedById,
        level: level || 'MEDIUM',
        mitigation: mitigation || null,
        createdBy: userId,
      },
      include: {
        survey: { select: { id: true, title: true, projectId: true } },
        identifiedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: risk }, { status: 201 })
  } catch (error) {
    console.error('Failed to create risk assessment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create risk assessment' },
      { status: 500 }
    )
  }
}
