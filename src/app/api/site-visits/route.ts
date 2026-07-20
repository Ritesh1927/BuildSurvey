import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { siteStatus } from '@/lib/geo'

// Manager/Admin oversight only — engineers/surveyors already see their own
// check-in/check-out on the survey detail page.
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const recentSurveys = await db.survey.findMany({
      where: { isDeleted: false, checkedInAt: { not: null } },
      orderBy: { checkedInAt: 'desc' },
      take: 25,
      select: {
        id: true,
        title: true,
        status: true,
        checkedInAt: true,
        checkedOutAt: true,
        project: { select: { id: true, name: true, latitude: true, longitude: true } },
        engineer: { select: { id: true, firstName: true, lastName: true } },
        photos: {
          where: { isDeleted: false, caption: { in: ['Check-In', 'Check-Out'] } },
          select: { caption: true, url: true, latitude: true, longitude: true, takenAt: true },
        },
        _count: { select: { measurements: true, materialRequirements: true } },
      },
    })

    const siteVisits = recentSurveys.map((s: any) => {
      const checkInPhoto = s.photos.find((p: any) => p.caption === 'Check-In') || null
      const checkOutPhoto = s.photos.find((p: any) => p.caption === 'Check-Out') || null

      return {
        surveyId: s.id,
        surveyTitle: s.title,
        status: s.status,
        projectId: s.project.id,
        projectName: s.project.name,
        engineerName: s.engineer ? `${s.engineer.firstName} ${s.engineer.lastName}` : 'Unassigned',
        checkedInAt: s.checkedInAt,
        checkedOutAt: s.checkedOutAt,
        checkInPhoto,
        checkOutPhoto,
        checkIn: checkInPhoto ? siteStatus(checkInPhoto.latitude, checkInPhoto.longitude, s.project.latitude, s.project.longitude) : { onSite: null, distanceMeters: null },
        checkOut: checkOutPhoto ? siteStatus(checkOutPhoto.latitude, checkOutPhoto.longitude, s.project.latitude, s.project.longitude) : { onSite: null, distanceMeters: null },
        measurementCount: s._count.measurements,
        materialCount: s._count.materialRequirements,
      }
    })

    return NextResponse.json({ success: true, data: siteVisits })
  } catch (error) {
    console.error('GET /api/site-visits error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
