import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/api-auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('holidays:write')
  if (permError) return permError

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
