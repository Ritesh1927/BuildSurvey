import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/api-auth'

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const { id } = await params

    const existing = await db.holiday.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Holiday not found' }, { status: 404 })
    }

    await db.holiday.update({ where: { id }, data: { isDeleted: true } })

    return NextResponse.json({ success: true, message: 'Holiday removed' })
  } catch (error) {
    console.error('DELETE /api/settings/holidays/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
