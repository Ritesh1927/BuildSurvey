import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole, canManageRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER'])
  if (roleError) return roleError

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
    if (role) where.role = role
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
    if (role) countsWhere.role = role

    const [users, total, activeCount, inactiveCount] = await Promise.all([
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
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
      db.user.count({ where: { ...countsWhere, isActive: true } }),
      db.user.count({ where: { ...countsWhere, isActive: false } }),
    ])

    return NextResponse.json({ users, total, activeCount, inactiveCount, page, limit })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole(['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, role, secondaryRole, isActive, initialPassword, clientId } = body

    if (!firstName || !lastName || !email || !role || !initialPassword) {
      return NextResponse.json(
        { error: 'First name, last name, email, role, and password are required' },
        { status: 400 }
      )
    }

    if (secondaryRole && !['ENGINEER', 'SURVEYOR'].includes(secondaryRole)) {
      return NextResponse.json(
        { error: 'Secondary role must be Engineer, Surveyor, or none' },
        { status: 400 }
      )
    }
    if (secondaryRole && secondaryRole === role) {
      return NextResponse.json(
        { error: 'Secondary role cannot be the same as the primary role' },
        { status: 400 }
      )
    }

    if (role === 'CLIENT') {
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
    if (!canManageRole(session!.user!.role, role)) {
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

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'ENGINEER',
        secondaryRole: role === 'CLIENT' ? null : (secondaryRole || null),
        isActive: isActive !== false,
        clientId: role === 'CLIENT' ? clientId : null,
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
