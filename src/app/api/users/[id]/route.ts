import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole, canManageRole } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER'])
  if (roleError) return roleError

  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        role: true, isActive: true, avatar: true, createdAt: true, lastLoginAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole(['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

  try {
    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, email, phone, role, isActive, password } = body

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await auth()
    const actingRole = session!.user!.role
    const actingUserId = session!.user!.id

    if (role && id === actingUserId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      )
    }

    if (!canManageRole(actingRole, existing.role)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can modify a Super Admin user' },
        { status: 403 }
      )
    }

    if (role && !canManageRole(actingRole, role)) {
      return NextResponse.json(
        { error: 'Only a Super Admin can assign the Super Admin role' },
        { status: 403 }
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
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

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
        role: true, isActive: true, createdAt: true,
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

  const roleError = await requireRole(['SUPER_ADMIN', 'ADMIN'])
  if (roleError) return roleError

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
