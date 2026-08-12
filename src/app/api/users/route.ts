import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, canManageRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:read')
  if (permError) return permError

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    const where: any = { isDeleted: false }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    // Filters by Role.key via the relation rather than the legacy `role`
    // enum column, so filtering also works correctly for custom roles
    // (whose enum column just holds a placeholder - see users POST/PATCH).
    if (role) where.roleRef = { key: role }
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

    // Active/inactive counts for the summary stat cards - scoped to the
    // same search/role filter as the list itself, but deliberately not the
    // status filter, since these two cards are the active/inactive
    // breakdown of that filtered set rather than a count re-filtered by
    // status. Computed server-side (not from the current page of `users`)
    // so the cards stay correct beyond the first page.
    const countsWhere: any = { isDeleted: false }
    if (where.OR) countsWhere.OR = where.OR
    if (role) countsWhere.roleRef = { key: role }

    const [rawUsers, total, activeCount, inactiveCount] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          secondaryRole: true,
          isActive: true,
          avatar: true,
          createdAt: true,
          lastLoginAt: true,
          roleRef: { select: { key: true, name: true } },
          secondaryRoleRef: { select: { key: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
      db.user.count({ where: { ...countsWhere, isActive: true } }),
      db.user.count({ where: { ...countsWhere, isActive: false } }),
    ])

    // See GET /api/users/[id] - roleKey/roleName are the TRUE current
    // role, unlike the legacy role/secondaryRole enum fields.
    const users = rawUsers.map(({ roleRef, secondaryRoleRef, ...u }: any) => ({
      ...u,
      roleKey: roleRef?.key ?? u.role,
      roleName: roleRef?.name ?? u.role,
      secondaryRoleKey: secondaryRoleRef?.key ?? u.secondaryRole,
      secondaryRoleName: secondaryRoleRef?.name ?? u.secondaryRole,
    }))

    return NextResponse.json({ users, total, activeCount, inactiveCount, page, limit })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('users:create')
  if (permError) return permError

  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, role, secondaryRole, isActive, initialPassword, clientId } = body

    if (!firstName || !lastName || !email || !role || !initialPassword) {
      return NextResponse.json(
        { error: 'First name, last name, email, role, and password are required' },
        { status: 400 }
      )
    }

    // `role` is now any Role.key - a built-in (system) key or a custom
    // role created via the Roles & Permissions panel - not just the 7
    // UserRole enum values.
    const roleRecord = await db.role.findUnique({ where: { key: role } })
    if (!roleRecord) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (secondaryRole && !['ENGINEER', 'SURVEYOR'].includes(secondaryRole)) {
      return NextResponse.json(
        { error: 'Secondary role must be Engineer, Surveyor, or none' },
        { status: 400 }
      )
    }
    if (secondaryRole && secondaryRole === roleRecord.key) {
      return NextResponse.json(
        { error: 'Secondary role cannot be the same as the primary role' },
        { status: 400 }
      )
    }

    if (roleRecord.key === 'CLIENT') {
      if (!clientId) {
        return NextResponse.json(
          { error: 'clientId is required when creating a CLIENT-role user' },
          { status: 400 }
        )
      }
      const client = await db.client.findUnique({ where: { id: clientId } })
      if (!client || client.isDeleted) {
        return NextResponse.json({ error: 'Client not found' }, { status: 400 })
      }
    } else if (clientId) {
      return NextResponse.json(
        { error: 'clientId can only be set for a CLIENT-role user' },
        { status: 400 }
      )
    }

    if (initialPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const session = await auth()
    if (!canManageRole(session!.user!.role, roleRecord.key)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can create a Super Admin user' },
        { status: 403 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 12)

    const resolvedSecondaryRole = roleRecord.key === 'CLIENT' ? null : (secondaryRole || null)
    const secondaryRoleRecord = resolvedSecondaryRole
      ? await db.role.findUnique({ where: { key: resolvedSecondaryRole } })
      : null

    // The legacy `role` enum column can only ever hold one of the
    // original UserRole values - a genuinely custom role has no matching
    // enum value, so it falls back to the CUSTOM sentinel (never
    // ENGINEER/SURVEYOR/etc, so it can't spuriously pass an identity
    // check like role === 'ENGINEER' meant for real Engineer-flavored
    // users). roleId (below) is the real, authoritative source of truth
    // for access control from here on.
    const legacyRoleEnum = roleRecord.isSystem ? roleRecord.key : 'CUSTOM'

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: legacyRoleEnum as any,
        secondaryRole: resolvedSecondaryRole,
        roleId: roleRecord.id,
        secondaryRoleId: secondaryRoleRecord?.id ?? null,
        isActive: isActive !== false,
        clientId: roleRecord.key === 'CLIENT' ? clientId : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        secondaryRole: true,
        isActive: true,
        clientId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error('POST /api/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
