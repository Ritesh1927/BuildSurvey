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

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth()
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/** Only a Super Admin may grant, hold, or be acted upon for the Super Admin role. */
export function canManageRole(actingRole: UserRole, subjectRole: UserRole): boolean {
  return subjectRole !== 'SUPER_ADMIN' || actingRole === 'SUPER_ADMIN'
}
