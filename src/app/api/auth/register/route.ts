import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, phone, password, mode } = body

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      )
    }

    if (mode === 'register') {
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }

      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || ''

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          role: 'ENGINEER',
          isActive: false,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Account created. Please wait for admin activation.',
        userId: user.id,
      })
    }

    // Request Access mode
    const existingRequest = await (db as any).accessRequest.findUnique({
      where: { email },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A request with this email already exists' },
        { status: 409 }
      )
    }

    const accessRequest = await (db as any).accessRequest.create({
      data: {
        name,
        email,
        company,
        phone: phone || null,
        message: body.message || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Request submitted. Admin will review within 24-48 hours.',
      requestId: accessRequest.id,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
