import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// A narrow, low-privilege slice of the employee directory - just enough to
// populate "assign to" dropdowns (lead owner, project manager/lead
// engineer, survey assignee) for any authenticated internal role. Unlike
// the full /api/users listing (Admin/Manager/Super Admin only, includes
// email/phone/last login), this only ever returns name + role, so it's
// safe to expose to whoever the surrounding page's own role check
// already lets in - e.g. an Engineer creating a survey needs to see
// who's assignable, even though they can't browse the employee directory.
//
// `permission` filters to users whose primary or secondary Role holds
// that key (e.g. "leads:assignable") - the same permission a Super Admin
// grants/revokes per role from the Roles & Permissions panel, so who
// shows up here stays in sync with that automatically.
export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const permission = searchParams.get('permission')

    let roleFilter: any = {}
    if (permission) {
      const eligibleRoles = await db.role.findMany({
        where: { permissions: { some: { permission: { key: permission } } } },
        select: { id: true },
      })
      const roleIds = eligibleRoles.map((r: any) => r.id)
      // No role currently grants this permission - fail closed to an
      // empty list rather than an unfiltered one.
      roleFilter = { OR: [{ roleId: { in: roleIds } }, { secondaryRoleId: { in: roleIds } }] }
    }

    const users = await db.user.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        ...roleFilter,
      },
      select: {
        id: true, firstName: true, lastName: true, role: true, secondaryRole: true,
        roleRef: { select: { name: true } },
        secondaryRoleRef: { select: { name: true } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    return NextResponse.json({
      success: true,
      data: users.map(({ roleRef, secondaryRoleRef, ...u }: any) => ({
        ...u,
        roleName: roleRef?.name ?? u.role,
        secondaryRoleName: secondaryRoleRef?.name ?? u.secondaryRole,
      })),
    })
  } catch (error) {
    console.error('GET /api/users/assignable error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
