import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission } from '@/lib/api-auth'

// Never assignable through the panel - granting it would let a custom
// role manage roles/permissions itself, a privilege-escalation path.
// Only the seeded SUPER_ADMIN role holds it, implicitly, from the seed
// script's "Super Admin gets every permission" rule.
const PROTECTED_PERMISSION_KEY = 'roles:manage'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const roles = await db.role.findMany({
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: {
        permissions: { select: { permission: { select: { key: true } } } },
        _count: { select: { primaryUsers: true, secondaryUsers: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: roles.map((r: any) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissionKeys: r.permissions.map((rp: any) => rp.permission.key),
        userCount: r._count.primaryUsers + r._count.secondaryUsers,
      })),
    })
  } catch (error) {
    console.error('GET /api/roles error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const session = await auth()
    const body = await request.json()
    const { name, description, permissionKeys } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'A role name is required' }, { status: 400 })
    }

    // Slugified from the name - e.g. "Regional Supervisor" -> "REGIONAL_SUPERVISOR".
    // Matches the shape of the 7 seeded system role keys.
    const key = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    if (!key) {
      return NextResponse.json({ success: false, error: 'Role name must contain at least one letter or number' }, { status: 400 })
    }

    const existing = await db.role.findUnique({ where: { key } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'A role with this name already exists' }, { status: 409 })
    }

    const requestedKeys: string[] = Array.isArray(permissionKeys)
      ? permissionKeys.filter((k: unknown): k is string => typeof k === 'string' && k !== PROTECTED_PERMISSION_KEY)
      : []

    let validPermissions: { id: string; key: string }[] = []
    if (requestedKeys.length > 0) {
      validPermissions = await db.permission.findMany({ where: { key: { in: requestedKeys } }, select: { id: true, key: true } })
      if (validPermissions.length !== requestedKeys.length) {
        return NextResponse.json({ success: false, error: 'One or more permission keys are invalid' }, { status: 400 })
      }
    }

    const role = await db.role.create({
      data: {
        key,
        name: name.trim(),
        description: description?.trim() || null,
        isSystem: false,
        createdBy: session!.user!.id,
        permissions: {
          create: validPermissions.map((p) => ({ permissionId: p.id })),
        },
      },
    })

    return NextResponse.json({ success: true, data: { id: role.id, key: role.key, name: role.name } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/roles error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
