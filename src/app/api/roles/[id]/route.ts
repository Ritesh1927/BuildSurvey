import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/api-auth'

const PROTECTED_PERMISSION_KEY = 'roles:manage'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const { id } = await params
    const role = await db.role.findUnique({
      where: { id },
      include: {
        permissions: { select: { permission: { select: { key: true } } } },
        _count: { select: { primaryUsers: true, secondaryUsers: true } },
      },
    })

    if (!role) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissionKeys: role.permissions.map((rp: any) => rp.permission.key),
        userCount: role._count.primaryUsers + role._count.secondaryUsers,
      },
    })
  } catch (error) {
    console.error('GET /api/roles/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, permissionKeys } = body

    const existing = await db.role.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ success: false, error: 'Role name cannot be empty' }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    if (description !== undefined) updateData.description = description?.trim() || null

    if (permissionKeys !== undefined) {
      if (!Array.isArray(permissionKeys)) {
        return NextResponse.json({ success: false, error: 'permissionKeys must be an array' }, { status: 400 })
      }
      let requestedKeys: string[] = permissionKeys.filter(
        (k: unknown): k is string => typeof k === 'string' && k !== PROTECTED_PERMISSION_KEY
      )
      // Super Admin can have every other permission toggled off and back
      // on at will, but roles:manage itself is pinned regardless of what
      // was submitted - the one thing that can never be removed, so
      // there's always a way back into this panel to undo a mistake.
      if (existing.key === 'SUPER_ADMIN') {
        requestedKeys = [...new Set([...requestedKeys, PROTECTED_PERMISSION_KEY])]
      }
      let validPermissions: { id: string }[] = []
      if (requestedKeys.length > 0) {
        validPermissions = await db.permission.findMany({ where: { key: { in: requestedKeys } }, select: { id: true } })
        if (validPermissions.length !== requestedKeys.length) {
          return NextResponse.json({ success: false, error: 'One or more permission keys are invalid' }, { status: 400 })
        }
      }

      await db.$transaction([
        db.rolePermission.deleteMany({ where: { roleId: id } }),
        db.rolePermission.createMany({
          data: validPermissions.map((p) => ({ roleId: id, permissionId: p.id })),
        }),
      ])
    }

    const updated = await db.role.update({ where: { id }, data: updateData })

    return NextResponse.json({ success: true, data: { id: updated.id, key: updated.key, name: updated.name } })
  } catch (error) {
    console.error('PATCH /api/roles/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('roles:manage')
  if (permError) return permError

  try {
    const { id } = await params
    const existing = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { primaryUsers: true, secondaryUsers: true } } },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 })
    }

    if (existing.isSystem) {
      return NextResponse.json({ success: false, error: 'Built-in roles cannot be deleted' }, { status: 403 })
    }

    const userCount = existing._count.primaryUsers + existing._count.secondaryUsers
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: `${userCount} employee(s) still have this role assigned - reassign them before deleting it` },
        { status: 409 }
      )
    }

    await db.role.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/roles/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
