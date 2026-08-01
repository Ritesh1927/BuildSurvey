import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { uploadPhotoDataUrl } from '@/lib/photo-upload'
import { getOfficeLocation } from '@/lib/office-location'
import { siteStatus, OFFICE_RADIUS_METERS } from '@/lib/geo'

// Every internal role marks their own attendance - a Client isn't office
// staff and has no reason to be on this page at all.
const MARK_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'ACCOUNTANT'] as const
const TEAM_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const

function todayDateOnly(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'self'

    if (scope === 'team') {
      const roleError = await requireRole([...TEAM_VIEW_ROLES])
      if (roleError) return roleError

      const dateParam = searchParams.get('date')
      const targetDate = dateParam ? new Date(`${dateParam}T00:00:00.000Z`) : todayDateOnly()
      if (Number.isNaN(targetDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid date' }, { status: 400 })
      }

      const monthStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1))
      const monthEnd = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 1))

      const [employees, todayRecords, monthRecords] = await Promise.all([
        db.user.findMany({
          where: { isDeleted: false, isActive: true, role: { not: 'CLIENT' } },
          select: { id: true, firstName: true, lastName: true, role: true },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        }),
        db.attendance.findMany({
          where: { isDeleted: false, date: targetDate },
          select: { userId: true, markedAt: true, distanceMeters: true, photoUrl: true },
        }),
        db.attendance.findMany({
          where: { isDeleted: false, date: { gte: monthStart, lt: monthEnd } },
          select: { userId: true },
        }),
      ])

      const todayByUser = new Map(todayRecords.map((r: any) => [r.userId, r]))
      const monthCountByUser = new Map<string, number>()
      for (const r of monthRecords as any[]) {
        monthCountByUser.set(r.userId, (monthCountByUser.get(r.userId) || 0) + 1)
      }

      const data = employees.map((e: any) => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        role: e.role,
        today: todayByUser.get(e.id) || null,
        monthCount: monthCountByUser.get(e.id) || 0,
      }))

      return NextResponse.json({
        success: true,
        data: { date: targetDate.toISOString().slice(0, 10), employees: data },
      })
    }

    // scope=self - the caller's own recent history
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10) || 30, 100)
    const records = await db.attendance.findMany({
      where: { isDeleted: false, userId },
      orderBy: { date: 'desc' },
      take: limit,
      select: { id: true, date: true, markedAt: true, distanceMeters: true, photoUrl: true },
    })

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('GET /api/attendance error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...MARK_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const body = await request.json()
    const { latitude, longitude, photo } = body

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'A valid latitude and longitude are required' }, { status: 400 })
    }

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({ success: false, error: 'A photo is required to mark attendance' }, { status: 400 })
    }

    const office = await getOfficeLocation()
    if (office.latitude == null || office.longitude == null) {
      return NextResponse.json(
        { success: false, error: 'Office location has not been configured yet. Contact an admin.' },
        { status: 400 }
      )
    }

    const today = todayDateOnly()
    const existing = await db.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    })
    if (existing && !existing.isDeleted) {
      return NextResponse.json(
        {
          success: false,
          error: `You've already marked attendance today at ${existing.markedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        },
        { status: 409 }
      )
    }

    const { onSite, distanceMeters } = siteStatus(lat, lng, office.latitude, office.longitude, OFFICE_RADIUS_METERS)

    if (!onSite) {
      return NextResponse.json(
        {
          success: false,
          error: `You're ${distanceMeters}m away from the office — you need to be within ${OFFICE_RADIUS_METERS}m to mark attendance.`,
          distanceMeters,
          officeLatitude: office.latitude,
          officeLongitude: office.longitude,
        },
        { status: 400 }
      )
    }

    let photoUrl: string
    try {
      photoUrl = await uploadPhotoDataUrl(photo, `attendance/${userId}`)
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || 'Failed to upload photo' }, { status: 400 })
    }

    const record = await db.attendance.create({
      data: {
        userId,
        date: today,
        latitude: lat,
        longitude: lng,
        distanceMeters: distanceMeters ?? 0,
        photoUrl,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "You've already marked attendance today" },
        { status: 409 }
      )
    }
    console.error('POST /api/attendance error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
