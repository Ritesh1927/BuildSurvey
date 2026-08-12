import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, canManageRole } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:read')
  if (permError) return permError

  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        role: true, secondaryRole: true, isActive: true, avatar: true, createdAt: true, lastLoginAt: true,
        roleRef: { select: { key: true, name: true } },
        secondaryRoleRef: { select: { key: true, name: true } },
        _count: {
          select: {
            ledProjects: { where: { isDeleted: false } },
            managedProjects: { where: { isDeleted: false } },
            assignedSurveys: { where: { isDeleted: false } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // roleRef/secondaryRoleRef hold the TRUE current role - the legacy
    // role/secondaryRole enum fields are a placeholder for anyone on a
    // custom (non-system) role. roleKey/secondaryRoleKey below are what
    // the UI should actually display and pre-select for editing.
    const { _count, roleRef, secondaryRoleRef, ...rest } = user
    return NextResponse.json({
      user: {
        ...rest,
        roleKey: roleRef?.key ?? user.role,
        roleName: roleRef?.name ?? user.role,
        secondaryRoleKey: secondaryRoleRef?.key ?? user.secondaryRole,
        secondaryRoleName: secondaryRoleRef?.name ?? user.secondaryRole,
        counts: _count,
      },
    })
  } catch (error) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:write')
  if (permError) return permError

  try {
    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, email, phone, role, secondaryRole, isActive, password, clientId } = body

    const existing = await db.user.findUnique({ where: { id }, include: { roleRef: { select: { key: true } } } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await auth()
    const actingRole = session!.user!.role
    const actingUserId = session!.user!.id

    if ((role || secondaryRole !== undefined) && id === actingUserId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      )
    }

    // Secondary role is deliberately restricted to ENGINEER/SURVEYOR - it's
    // meant for one specific gap (a person doing both jobs), not a general
    // second role. Enforced here regardless of what the client sends.
    if (secondaryRole !== undefined && secondaryRole !== null && !['ENGINEER', 'SURVEYOR'].includes(secondaryRole)) {
      return NextResponse.json(
        { error: 'Secondary role must be Engineer, Surveyor, or none' },
        { status: 400 }
      )
    }

    // `role` is now any Role.key, not just the 7 UserRole enum values -
    // resolve and validate it up front. The user's TRUE current role key
    // comes from roleRef, not the legacy `role` enum column, since that
    // column holds a placeholder for anyone currently on a custom role
    // (see the create route for why).
    const existingRoleKey = existing.roleRef?.key ?? existing.role
    let roleRecord: { id: string; key: string; isSystem: boolean } | null = null
    if (role) {
      roleRecord = await db.role.findUnique({ where: { key: role }, select: { id: true, key: true, isSystem: true } })
      if (!roleRecord) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    if (!canManageRole(actingRole, existingRoleKey)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can modify a Super Admin user' },
        { status: 403 }
      )
    }

    if (roleRecord && !canManageRole(actingRole, roleRecord.key)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can assign the Super Admin role' },
        { status: 403 }
      )
    }

    const effectiveRoleKey = roleRecord?.key ?? existingRoleKey

    if (secondaryRole && secondaryRole === effectiveRoleKey) {
      return NextResponse.json(
        { error: 'Secondary role cannot be the same as the primary role' },
        { status: 400 }
      )
    }

    if (effectiveRoleKey === 'CLIENT') {
      const resolvedClientId = clientId !== undefined ? clientId : existing.clientId
      if (!resolvedClientId) {
        return NextResponse.json(
          { error: 'clientId is required for a CLIENT-role user' },
          { status: 400 }
        )
      }
      if (clientId !== undefined) {
        const client = await db.client.findUnique({ where: { id: clientId } })
        if (!client || client.isDeleted) {
          return NextResponse.json({ error: 'Client not found' }, { status: 400 })
        }
      }
    } else if (clientId) {
      return NextResponse.json(
        { error: 'clientId can only be set for a CLIENT-role user' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (email) {
      if (email !== existing.email) {
        const dup = await db.user.findFirst({ where: { email, isDeleted: false } })
        if (dup) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
        }
      }
      updateData.email = email
    }
    if (phone !== undefined) updateData.phone = phone
    if (roleRecord) {
      // See the create route for why the legacy enum column gets the
      // CUSTOM sentinel for a custom (non-system) role - roleId is the
      // real source of truth for access control from here on.
      updateData.role = roleRecord.isSystem ? roleRecord.key : 'CUSTOM'
      updateData.roleId = roleRecord.id
    }
    if (effectiveRoleKey === 'CLIENT') {
      // A Client login has no business holding field-staff capability -
      // force-clear regardless of what was sent, mirroring clientId below.
      updateData.secondaryRole = null
      updateData.secondaryRoleId = null
    } else if (secondaryRole !== undefined) {
      updateData.secondaryRole = secondaryRole || null
      const secondaryRoleRecord = secondaryRole
        ? await db.role.findUnique({ where: { key: secondaryRole }, select: { id: true } })
        : null
      updateData.secondaryRoleId = secondaryRoleRecord?.id ?? null
    }
    if (isActive !== undefined) updateData.isActive = isActive
    if (effectiveRoleKey === 'CLIENT') {
      if (clientId !== undefined) updateData.clientId = clientId
    } else if (effectiveRoleKey !== existingRoleKey) {
      // Role is changing away from CLIENT — clear the now-meaningless link.
      updateData.clientId = null
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        role: true, secondaryRole: true, isActive: true, clientId: true, createdAt: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:delete')
  if (permError) return permError

  try {
    const { id } = await params

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await auth()

    if (id === session!.user!.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      )
    }

    if (!canManageRole(session!.user!.role, existing.role)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can delete a Super Admin user' },
        { status: 403 }
      )
    }

    await db.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
