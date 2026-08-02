import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] as const
const TEAM_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)

    const visits = await db.siteVisit.findMany({
      // Engineer only ever sees their own visits (self-scoped, same line as
      // Attendance) - full cross-project oversight is Admin/Manager only.
      where: { isDeleted: false, ...(TEAM_VIEW_ROLES.includes(role) ? {} : { engineerId: userId }) },
      orderBy: { checkedInAt: 'desc' },
      take: limit,
      include: {
        project: { select: { id: true, name: true, code: true } },
        engineer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    const data = visits.map((v: any) => ({
      id: v.id,
      projectId: v.project.id,
      projectName: v.project.name,
      projectCode: v.project.code,
      engineerId: v.engineer.id,
      engineerName: `${v.engineer.firstName} ${v.engineer.lastName}`,
      checkedInAt: v.checkedInAt,
      checkedOutAt: v.checkedOutAt,
      checkInPhotoUrl: v.checkInPhotoUrl,
      checkOutPhotoUrl: v.checkOutPhotoUrl,
      workSummary: v.workSummary,
      durationMinutes: v.checkedOutAt
        ? Math.round((new Date(v.checkedOutAt).getTime() - new Date(v.checkedInAt).getTime()) / 60000)
        : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/site-visits error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
