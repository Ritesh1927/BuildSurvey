import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { SurveyStatus, SurveyType } from '@/generated/prisma/enums'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const ASSIGN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const APPROVE_ROLES = ['SUPER_ADMIN']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const
const SCOPED_ROLES = ['ENGINEER', 'SURVEYOR']

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id } = await params
    const survey = await db.survey.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        engineer: { select: { id: true, firstName: true, lastName: true, email: true } },
        checklistItems: { where: { isDeleted: false } },
        photos: { where: { isDeleted: false } },
      },
    })

    if (!survey || survey.isDeleted) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    if (SCOPED_ROLES.includes(role) && survey.engineerId !== userId) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: survey })
  } catch (error) {
    console.error('GET /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json()

    const existing = await db.survey.findUnique({ where: { id } })
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    if (SCOPED_ROLES.includes(role) && existing.engineerId !== userId) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    if (!ASSIGN_ROLES.includes(role)) {
      delete body.engineerId
    }

    const {
      title, description, type, status, scheduledDate, completedDate,
      gpsLatitude, gpsLongitude, weatherCondition, siteCondition,
      accessDetails, notes, engineerId,
    } = body

    if (type && !Object.values(SurveyType).includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid survey type' }, { status: 400 })
    }

    if (status) {
      if (!Object.values(SurveyStatus).includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 })
      }
      if ((status === 'APPROVED' || status === 'REJECTED') && !APPROVE_ROLES.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Only a Super Admin can approve or reject a survey' },
          { status: 403 }
        )
      }
    }

    const updateData: any = { updatedBy: userId }

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type) updateData.type = type
    if (status) updateData.status = status
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null
    if (completedDate !== undefined) updateData.completedDate = completedDate ? new Date(completedDate) : null
    if (gpsLatitude !== undefined) updateData.gpsLatitude = gpsLatitude !== null && gpsLatitude !== '' ? parseFloat(gpsLatitude) : null
    if (gpsLongitude !== undefined) updateData.gpsLongitude = gpsLongitude !== null && gpsLongitude !== '' ? parseFloat(gpsLongitude) : null
    if (weatherCondition !== undefined) updateData.weatherCondition = weatherCondition
    if (siteCondition !== undefined) updateData.siteCondition = siteCondition
    if (accessDetails !== undefined) updateData.accessDetails = accessDetails
    if (notes !== undefined) updateData.notes = notes
    if (engineerId !== undefined) updateData.engineerId = engineerId

    const updated = await db.survey.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        engineer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...DELETE_ROLES])
  if (roleError) return roleError

  try {
    const { id } = await params

    const existing = await db.survey.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    if (existing.isDeleted) {
      return NextResponse.json({ success: true, message: 'Survey deleted successfully' })
    }

    await db.survey.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Survey deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
