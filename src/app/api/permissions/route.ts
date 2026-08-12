import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/api-auth'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const permissions = await db.permission.findMany({
      // Never listed - see scripts/seed-roles-permissions.ts for why.
      where: { key: { not: 'roles:manage' } },
      orderBy: [{ category: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    })

    const grouped = new Map<string, typeof permissions>()
    for (const p of permissions) {
      if (!grouped.has(p.category)) grouped.set(p.category, [])
      grouped.get(p.category)!.push(p)
    }

    return NextResponse.json({
      success: true,
      data: Array.from(grouped.entries()).map(([category, items]) => ({
        category,
        permissions: items.map((p: any) => ({ key: p.key, resource: p.resource, action: p.action, label: p.label })),
      })),
    })
  } catch (error) {
    console.error('GET /api/permissions error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
