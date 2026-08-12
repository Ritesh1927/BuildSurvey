import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, hasPermission } from '@/lib/api-auth'
import { RiskLevel } from '@/generated/prisma/enums'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('risks:read:all', 'risks:read:own')
  if (permError) return permError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id } = await params
    const risk = await db.riskAssessment.findUnique({
      where: { id },
      include: {
        survey: { select: { id: true, title: true, projectId: true } },
        identifiedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!risk || risk.isDeleted) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    if (!hasPermission(session!.user!, 'risks:read:all') && risk.identifiedById !== userId) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: risk })
  } catch (error) {
    console.error('GET /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('risks:write:all', 'risks:write:own')
  if (permError) return permError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json()

    const existing = await db.riskAssessment.findUnique({ where: { id } })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    if (!hasPermission(session!.user!, 'risks:write:all') && existing.identifiedById !== userId) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    if (!hasPermission(session!.user!, 'risks:assign')) {
      delete body.identifiedById
    }

    const { title, description, level, mitigation, surveyId, identifiedById } = body

    if (level && !Object.values(RiskLevel).includes(level)) {
      return NextResponse.json({ success: false, error: 'Invalid risk level' }, { status: 400 })
    }

    if (surveyId) {
      const survey = await db.survey.findUnique({ where: { id: surveyId } })
      if (!survey || survey.isDeleted) {
        return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 400 })
      }
    }

    const updateData: any = { updatedBy: userId }

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (level) updateData.level = level
    if (mitigation !== undefined) updateData.mitigation = mitigation
    if (surveyId) updateData.surveyId = surveyId
    if (identifiedById) updateData.identifiedById = identifiedById

    const updated = await db.riskAssessment.update({
      where: { id },
      data: updateData,
      include: {
        survey: { select: { id: true, title: true, projectId: true } },
        identifiedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('risks:delete')
  if (permError) return permError

  try {
    const { id } = await params

    const existing = await db.riskAssessment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      return NextResponse.json({ success: true, message: 'Risk assessment deleted successfully' })
    }

    await db.riskAssessment.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Risk assessment deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
