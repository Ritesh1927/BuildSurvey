import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const OVERRIDE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const SCOPED_ROLES = ['ENGINEER', 'SURVEYOR']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id, itemId } = await params
    const body = await req.json()
    const { isCompleted, notes } = body

    const survey = await db.survey.findUnique({ where: { id } })
    if (!survey || survey.isDeleted) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    const item = await db.surveyChecklistItem.findUnique({ where: { id: itemId } })
    if (!item || item.isDeleted || item.surveyId !== id) {
      return NextResponse.json({ success: false, error: 'Checklist item not found' }, { status: 404 })
    }

    if (SCOPED_ROLES.includes(role)) {
      if (survey.engineerId !== userId) {
        return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
      }
      // The whole point of the checklist is a record of what was actually
      // observed on site - only editable during the on-site window itself,
      // not before arriving or after already checking out. Admin/Manager
      // are exempt since they may need to correct entries after the fact.
      if (!survey.checkedInAt || survey.checkedOutAt) {
        return NextResponse.json(
          { success: false, error: 'Checklist can only be updated while checked in on-site' },
          { status: 400 }
        )
      }
    } else if (!OVERRIDE_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = { updatedBy: userId }
    if (isCompleted !== undefined) updateData.isCompleted = !!isCompleted
    if (notes !== undefined) updateData.notes = notes || null

    const updated = await db.surveyChecklistItem.update({
      where: { id: itemId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/surveys/[id]/checklist/[itemId] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
