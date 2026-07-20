import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { uploadPhotoDataUrl } from '@/lib/photo-upload'
import { siteStatus } from '@/lib/geo'

// Deliberately narrower than the survey WRITE_ROLES tier: check-in is a
// self-attested proof-of-presence action. Letting Admin/Manager perform it
// "on someone's behalf" would defeat the entire point — only the person
// physically assigned to the survey can check themselves in.
const CHECKIN_ROLES = ['ENGINEER', 'SURVEYOR'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...CHECKIN_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json()
    const { latitude, longitude, photo } = body

    const survey = await db.survey.findUnique({
      where: { id },
      include: { project: { select: { latitude: true, longitude: true } } },
    })
    if (!survey || survey.isDeleted) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    if (survey.engineerId !== userId) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    // Re-submission is allowed up until checkout — a surveyor who checked in
    // from off-site needs to be able to retry once they're actually on site,
    // rather than being permanently stuck on their first, invalid attempt.
    if (survey.checkedOutAt) {
      return NextResponse.json({ success: false, error: 'This survey has already been checked out' }, { status: 409 })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'A valid latitude and longitude are required' }, { status: 400 })
    }

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({ success: false, error: 'A check-in photo is required' }, { status: 400 })
    }

    let photoUrl: string
    try {
      photoUrl = await uploadPhotoDataUrl(photo, `surveys/${id}/checkin`)
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || 'Failed to upload photo' }, { status: 400 })
    }

    const now = new Date()

    const [, , updatedSurvey] = await db.$transaction([
      db.photo.deleteMany({
        where: { surveyId: id, caption: 'Check-In' },
      }),
      db.photo.create({
        data: {
          surveyId: id,
          url: photoUrl,
          filename: `checkin-${now.getTime()}.jpg`,
          caption: 'Check-In',
          latitude: lat,
          longitude: lng,
          takenAt: now,
          createdBy: userId,
        },
      }),
      db.survey.update({
        where: { id },
        data: {
          checkedInAt: now,
          updatedBy: userId,
          ...(survey.status === 'DRAFT' || survey.status === 'ASSIGNED' ? { status: 'IN_PROGRESS' } : {}),
        },
      }),
    ], { timeout: 20000 })

    const { onSite, distanceMeters } = siteStatus(lat, lng, survey.project.latitude, survey.project.longitude)

    return NextResponse.json({ success: true, data: updatedSurvey, photoUrl, onSite, distanceMeters }, { status: 201 })
  } catch (error) {
    console.error('POST /api/surveys/[id]/checkin error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
