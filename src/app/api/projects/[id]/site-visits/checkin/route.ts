import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { uploadPhotoDataUrl } from '@/lib/photo-upload'
import { siteStatus } from '@/lib/geo'
import { formatDistance } from '@/lib/utils'

// Self-attested proof-of-presence, same reasoning as survey check-in - only
// the project's own lead engineer can check themselves in, nobody else.
const CHECKIN_ROLES = ['ENGINEER'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...CHECKIN_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id: projectId } = await params
    const body = await req.json()
    const { latitude, longitude, photo } = body

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project || project.isDeleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    if (project.leadUserId !== userId) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    if (project.latitude == null || project.longitude == null) {
      return NextResponse.json(
        { success: false, error: 'This project has no site coordinates set — an Admin/Manager needs to add them before site visits can be tracked.' },
        { status: 400 }
      )
    }

    // Site visits are meant for ongoing supervision after a survey has
    // cleared the site - not available before that point.
    const approvedSurveyCount = await db.survey.count({
      where: { projectId, status: 'APPROVED', isDeleted: false },
    })
    if (approvedSurveyCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Site visits open once a survey on this project has been approved.' },
        { status: 400 }
      )
    }

    const openVisit = await db.siteVisit.findFirst({
      where: { projectId, engineerId: userId, isDeleted: false, checkedOutAt: null },
    })
    if (openVisit) {
      return NextResponse.json(
        { success: false, error: "You're already checked in to a site visit for this project. Check out before starting a new one." },
        { status: 409 }
      )
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'A valid latitude and longitude are required' }, { status: 400 })
    }

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({ success: false, error: 'A check-in photo is required' }, { status: 400 })
    }

    const { onSite, distanceMeters } = siteStatus(lat, lng, project.latitude, project.longitude)
    if (!onSite) {
      return NextResponse.json(
        {
          success: false,
          error: `You're off-site (${formatDistance(distanceMeters ?? 0)} from the project location) — check-in is only allowed from the site. Move to the site and try again.`,
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

    const visit = await db.siteVisit.create({
      data: {
        projectId,
        engineerId: userId,
        checkInLatitude: lat,
        checkInLongitude: lng,
        checkInPhotoUrl: photoUrl,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: visit, onSite, distanceMeters }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects/[id]/site-visits/checkin error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
