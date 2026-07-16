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
    const department = searchParams.get('department') || ''
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

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
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
    ])

    return NextResponse.json({ users, total, page, limit })
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
    const {
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      department,
      designation,
      dateOfJoining,
      role,
      isActive,
      initialPassword,
    } = body

    if (!firstName || !lastName || !email || !role || !initialPassword) {
      return NextResponse.json(
        { error: 'First name, last name, email, role, and password are required' },
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
        isActive: isActive !== false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error('POST /api/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
