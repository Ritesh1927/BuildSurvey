// Client-safe counterparts to hasPermission()/hasRole() in
// src/lib/api-auth.ts - that file pulls in auth.ts (bcrypt, Prisma) and
// can't be imported from client components, so these tiny duplicates
// exist purely to avoid that.
export function hasPermission(user: { permissions?: string[] } | null | undefined, ...keys: string[]): boolean {
  if (!user?.permissions?.length) return false
  return keys.some((key) => user.permissions!.includes(key))
}

/** A user's secondaryRole grants that role's eligibility on top of their primary role. */
export function hasRole(user: { role?: string; secondaryRole?: string | null } | null | undefined, role: string): boolean {
  if (!user) return false
  return user.role === role || user.secondaryRole === role
}
