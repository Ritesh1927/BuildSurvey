import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, hasPermission, hasRole } from '@/lib/api-auth'
import { todayDateOnly } from '@/lib/attendance'
import { countEligibleDays } from '@/lib/site-visit-days'
import { getWeeklyHolidayDays, isWeeklyHoliday, getHolidaysInRange } from '@/lib/holidays'

// A project counts as "site-visit eligible" once it has an assigned lead
// engineer and a start/end date - those three fields define the whole
// feature (who visits, and on which days). Projects missing any of them
// simply don't show up here, rather than appearing greyed-out.
export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('site_visits:read:all', 'site_visits:read:own')
  if (permError) return permError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const hasFullAccess = hasPermission(session!.user!, 'site_visits:read:all')

    const where: any = {
      isDeleted: false,
      leadUserId: { not: null },
      startDate: { not: null },
      endDate: { not: null },
    }
    if (!hasFullAccess) {
      if (hasRole(session!.user!, 'ENGINEER')) {
        where.leadUserId = userId
      } else {
        // Fail closed to no results if scoped access is held but the
        // identity doesn't map to a recognized "own" concept (e.g. a
        // future custom role without ENGINEER capability), rather than
        // falling through unscoped.
        where.id = '__none__'
      }
    }

    const projects = await db.project.findMany({
      where,
      select: {
        id: true, name: true, code: true, startDate: true, endDate: true,
        leadUser: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { companyName: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    if (projects.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const today = todayDateOnly()
    const projectIds = projects.map((p: any) => p.id)

    const [visitCounts, weeklyHolidayDays, todayHolidayRows, todayRecords] = await Promise.all([
      db.siteVisit.groupBy({
        by: ['projectId'],
        where: { projectId: { in: projectIds }, isDeleted: false, checkedOutAt: { not: null } },
        _count: { _all: true },
      }),
      getWeeklyHolidayDays(),
      getHolidaysInRange(today, new Date(today.getTime() + 86400000)),
      db.siteVisit.findMany({
        where: { projectId: { in: projectIds }, isDeleted: false, visitDate: today },
        select: { projectId: true, checkedOutAt: true },
      }),
    ])

    const visitedByProject = new Map<string, number>(visitCounts.map((v: any) => [v.projectId, v._count._all]))
    const todayByProject = new Map<string, { checkedOutAt: Date | null }>(todayRecords.map((v: any) => [v.projectId, v]))
    const isTodayHoliday = todayHolidayRows.length > 0 || isWeeklyHoliday(today, weeklyHolidayDays)

    const data = await Promise.all(projects.map(async (p: any) => {
      const windowStart = new Date(Date.UTC(p.startDate.getUTCFullYear(), p.startDate.getUTCMonth(), p.startDate.getUTCDate()))
      const windowEnd = new Date(Date.UTC(p.endDate.getUTCFullYear(), p.endDate.getUTCMonth(), p.endDate.getUTCDate()))
      const eligibleEnd = windowEnd < today ? windowEnd : today
      const eligibleSoFar = windowStart <= eligibleEnd ? await countEligibleDays(windowStart, eligibleEnd) : 0
      const visited = visitedByProject.get(p.id) || 0
      const missed = Math.max(0, eligibleSoFar - visited)

      const todayRecord = todayByProject.get(p.id)
      let todayStatus: 'visited' | 'in-progress' | 'pending' | 'holiday' | 'outside-window'
      if (today < windowStart || today > windowEnd) {
        todayStatus = 'outside-window'
      } else if (todayRecord?.checkedOutAt) {
        todayStatus = 'visited'
      } else if (todayRecord) {
        todayStatus = 'in-progress'
      } else if (isTodayHoliday) {
        todayStatus = 'holiday'
      } else {
        todayStatus = 'pending'
      }

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        clientName: p.client.companyName,
        engineerId: p.leadUser.id,
        engineerName: `${p.leadUser.firstName} ${p.leadUser.lastName}`,
        windowStart: windowStart.toISOString().slice(0, 10),
        windowEnd: windowEnd.toISOString().slice(0, 10),
        eligibleSoFar,
        visited,
        missed,
        todayStatus,
      }
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/site-visits error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
