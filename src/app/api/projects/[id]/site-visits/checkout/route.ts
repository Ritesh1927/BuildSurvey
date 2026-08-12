import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission } from '@/lib/api-auth'
import { uploadPhotoDataUrl } from '@/lib/photo-upload'
import { siteStatus } from '@/lib/geo'
import { formatDistance, formatDate } from '@/lib/utils'
import { todayDateOnly } from '@/lib/attendance'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('site_visits:checkout')
  if (permError) return permError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id: projectId } = await params
    const body = await req.json()
    const { latitude, longitude, photo, workSummary } = body

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project || project.isDeleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const visit = await db.siteVisit.findFirst({
      where: { projectId, engineerId: userId, isDeleted: false, checkedOutAt: null },
      orderBy: { checkedInAt: 'desc' },
    })
    if (!visit) {
      return NextResponse.json({ success: false, error: 'You must check in before checking out' }, { status: 400 })
    }

    // Checkout "expires" at midnight - a check-in from an earlier day can no
    // longer be closed out, it's simply a missed visit for that day. This is
    // enforced here rather than by a cron mutating old rows.
    const today = todayDateOnly()
    if (visit.visitDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        {
          success: false,
          error: `Your check-in from ${formatDate(visit.visitDate)} expired at midnight without a checkout and is now marked as a missed visit. Check in again today to start a new visit.`,
        },
        { status: 400 }
      )
    }

    if (!workSummary || typeof workSummary !== 'string' || !workSummary.trim()) {
      return NextResponse.json(
        { success: false, error: "Describe today's work before checking out" },
        { status: 400 }
      )
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'A valid latitude and longitude are required' }, { status: 400 })
    }

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({ success: false, error: 'A check-out photo is required' }, { status: 400 })
    }

    const { onSite, distanceMeters } = siteStatus(lat, lng, project.latitude, project.longitude)
    if (!onSite) {
      return NextResponse.json(
        {
          success: false,
          error: `You're off-site (${formatDistance(distanceMeters ?? 0)} from the project location) — checkout is only allowed from the site. Move to the site and try again.`,
          distanceMeters,
          projectLatitude: project.latitude,
          projectLongitude: project.longitude,
        },
        { status: 400 }
      )
    }

    let photoUrl: string
    try {
      photoUrl = await uploadPhotoDataUrl(photo, `site-visits/${projectId}/${userId}`)
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || 'Failed to upload photo' }, { status: 400 })
    }

    const now = new Date()
    const updated = await db.siteVisit.update({
      where: { id: visit.id },
      data: {
        checkedOutAt: now,
        checkOutLatitude: lat,
        checkOutLongitude: lng,
        checkOutPhotoUrl: photoUrl,
        workSummary: workSummary.trim(),
        updatedBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: updated, onSite, distanceMeters }, { status: 200 })
  } catch (error) {
    console.error('POST /api/projects/[id]/site-visits/checkout error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
