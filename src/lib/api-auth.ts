import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { UserRole } from '@/generated/prisma/enums'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// A user's secondaryRole (ENGINEER or SURVEYOR only) grants that role's
// eligibility on top of their primary role, without replacing it - a
// Surveyor with secondaryRole=ENGINEER passes a check for either role.
export function hasRole(user: { role: UserRole; secondaryRole?: UserRole | null }, role: UserRole): boolean {
  return user.role === role || user.secondaryRole === role
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  const allowed = allowedRoles.includes(session.user.role)
    || (!!session.user.secondaryRole && allowedRoles.includes(session.user.secondaryRole))
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/** Only a Super Admin may grant, hold, or be acted upon for the Super Admin role. */
export function canManageRole(actingRole: UserRole, subjectRole: UserRole): boolean {
  return subjectRole !== 'SUPER_ADMIN' || actingRole === 'SUPER_ADMIN'
}
