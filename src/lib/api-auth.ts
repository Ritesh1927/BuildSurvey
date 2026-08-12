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

// --- Dynamic RBAC (Role / Permission) ---
//
// `session.user.permissions` is the resolved union of the user's primary
// and secondary Role's permission keys, baked into the JWT at login (see
// auth.ts) - same "changes take effect on next sign-in" tradeoff `role`
// already has. This coexists with requireRole()/hasRole() above during
// the migration from the fixed UserRole enum to admin-editable roles;
// nothing calls these yet until routes are migrated one at a time.

/** True if the session holds ANY of the given permission keys. */
export function hasPermission(user: { permissions?: string[] }, ...keys: string[]): boolean {
  if (!user.permissions?.length) return false
  return keys.some((key) => user.permissions!.includes(key))
}

/** Gate an API route on holding at least one of the given permission keys. */
export async function requirePermission(...keys: string[]) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  if (!hasPermission(session.user, ...keys)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  return null
}
