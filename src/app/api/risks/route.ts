import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const surveyId = searchParams.get('surveyId') || ''
    const level = searchParams.get('level') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

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

    const [risks, total] = await Promise.all([
      (db as any).riskAssessment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          survey: { select: { id: true, title: true, projectId: true } },
          identifiedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      (db as any).riskAssessment.count({ where }),
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
  try {
    const body = await request.json()
    const { title, description, surveyId, identifiedById, level, mitigation } = body

    if (!title || !description || !surveyId || !identifiedById) {
      return NextResponse.json(
        { success: false, error: 'title, description, surveyId, and identifiedById are required' },
        { status: 400 }
      )
    }

    const risk = await (db as any).riskAssessment.create({
      data: {
        title,
        description,
        surveyId,
        identifiedById,
        level: level || 'MEDIUM',
        mitigation: mitigation || null,
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
