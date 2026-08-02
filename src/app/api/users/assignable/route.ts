import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// A narrow, low-privilege slice of the employee directory - just enough to
// populate "assign to" dropdowns (survey assignee, project lead engineer,
// etc.) for any authenticated internal role. Unlike the full /api/users
// listing (Admin/Manager/Super Admin only, includes email/phone/last
// login), this only ever returns name + role, so it's safe to expose to
// whoever the surrounding page's own role check already lets in - e.g. an
// Engineer or Surveyor creating a survey needs to see who's assignable,
// even though they can't browse the employee directory itself.
export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const rolesParam = searchParams.get('roles') || ''
    const roles = rolesParam.split(',').map((r) => r.trim()).filter(Boolean)

    const users = await db.user.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        ...(roles.length > 0 ? { role: { in: roles as any } } : {}),
      },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('GET /api/users/assignable error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
