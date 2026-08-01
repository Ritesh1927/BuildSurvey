import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

// Mirrors /api/settings' own tiers exactly - ad-hoc holidays are just
// another piece of org-wide configuration.
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)

    const holidays = await db.holiday.findMany({
      where: {
        isDeleted: false,
        date: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ success: true, data: holidays })
  } catch (error) {
    console.error('GET /api/settings/holidays error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const body = await request.json()
    const { date, name } = body

    if (!date || !name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'A date and name are required' }, { status: 400 })
    }

    const holiday = await db.holiday.create({
      data: { date: dateOnly(date), name: name.trim(), createdBy: userId },
    })

    return NextResponse.json({ success: true, data: holiday }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A holiday is already set for that date' }, { status: 409 })
    }
    console.error('POST /api/settings/holidays error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create holiday' }, { status: 500 })
  }
}
