import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/api-auth'

// A narrow slice of the Role table - just enough to populate the Role
// select on the employee create/edit forms. Unlike /api/roles (Super
// Admin only, full permission detail), this is available to anyone who
// can create or edit employees, same precedent as /api/users/assignable.
export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:create', 'users:write')
  if (permError) return permError

  try {
    const roles = await db.role.findMany({
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      select: { id: true, key: true, name: true, isSystem: true },
    })

    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    console.error('GET /api/roles/assignable error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
