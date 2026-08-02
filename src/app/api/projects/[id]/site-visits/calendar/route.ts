import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { getWeeklyHolidayDays, isWeeklyHoliday, getHolidaysInRange } from '@/lib/holidays'
import { todayDateOnly } from '@/lib/attendance'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id: projectId } = await params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { leadUser: { select: { id: true, firstName: true, lastName: true } } },
    })
    if (!project || project.isDeleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    if (!project.leadUserId || !project.leadUser) {
      return NextResponse.json({ success: false, error: 'This project has no assigned engineer' }, { status: 404 })
    }
    if (role === 'ENGINEER' && project.leadUserId !== userId) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }
    if (!project.startDate || !project.endDate) {
      return NextResponse.json({ success: false, error: 'This project has no start/end date set' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const monthParam = searchParams.get('month') || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const [yearStr, monthStr] = monthParam.split('-')
    const year = parseInt(yearStr, 10)
    const monthIndex = parseInt(monthStr, 10) - 1
    if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return NextResponse.json({ success: false, error: 'Invalid month' }, { status: 400 })
    }

    const monthStart = new Date(Date.UTC(year, monthIndex, 1))
    const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1))
    const windowStart = new Date(Date.UTC(project.startDate.getUTCFullYear(), project.startDate.getUTCMonth(), project.startDate.getUTCDate()))
    const windowEnd = new Date(Date.UTC(project.endDate.getUTCFullYear(), project.endDate.getUTCMonth(), project.endDate.getUTCDate()))

    const [visits, weeklyHolidayDays, adHocHolidays] = await Promise.all([
      db.siteVisit.findMany({
        where: {
          projectId, engineerId: project.leadUserId, isDeleted: false,
          visitDate: { gte: monthStart, lt: monthEnd },
        },
        select: {
          visitDate: true, checkedInAt: true, checkedOutAt: true,
          checkInPhotoUrl: true, checkOutPhotoUrl: true, workSummary: true,
        },
      }),
      getWeeklyHolidayDays(),
      getHolidaysInRange(monthStart, monthEnd),
    ])

    const visitsByDate = new Map<string, (typeof visits)[number]>(visits.map((v: any) => [v.visitDate.toISOString().slice(0, 10), v]))
    const holidayNameByDate = new Map<string, string>(adHocHolidays.map((h: any) => [h.date.toISOString().slice(0, 10), h.name]))
    const today = todayDateOnly()

    const days: any[] = []
    let visited = 0, missed = 0, expired = 0, holidayCount = 0
    for (let d = new Date(monthStart); d < monthEnd; d = new Date(d.getTime() + 86400000)) {
      const key = d.toISOString().slice(0, 10)
      const record = visitsByDate.get(key)
      const adHocName = holidayNameByDate.get(key)
      const eligible = d >= windowStart && d <= windowEnd

      let status: 'not-eligible' | 'holiday' | 'future' | 'visited' | 'in-progress' | 'expired' | 'pending' | 'missed'
      if (!eligible) {
        status = 'not-eligible'
      } else if (adHocName || isWeeklyHoliday(d, weeklyHolidayDays)) {
        status = 'holiday'
        holidayCount++
      } else if (d > today) {
        status = 'future'
      } else if (record?.checkedOutAt) {
        status = 'visited'
        visited++
      } else if (record) {
        status = d.getTime() === today.getTime() ? 'in-progress' : 'expired'
        if (status === 'expired') expired++
      } else if (d.getTime() === today.getTime()) {
        status = 'pending'
      } else {
        status = 'missed'
        missed++
      }

      days.push({
        date: key,
        status,
        checkedInAt: record?.checkedInAt ?? null,
        checkedOutAt: record?.checkedOutAt ?? null,
        checkInPhotoUrl: record?.checkInPhotoUrl ?? null,
        checkOutPhotoUrl: record?.checkOutPhotoUrl ?? null,
        workSummary: record?.workSummary ?? null,
        holidayName: adHocName || null,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        engineerName: `${project.leadUser.firstName} ${project.leadUser.lastName}`,
        windowStart: windowStart.toISOString().slice(0, 10),
        windowEnd: windowEnd.toISOString().slice(0, 10),
        month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        days,
        summary: { visited, missed, expired, holidays: holidayCount, total: days.length },
      },
    })
  } catch (error) {
    console.error('GET /api/projects/[id]/site-visits/calendar error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
