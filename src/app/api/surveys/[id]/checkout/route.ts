import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'
import { uploadPhotoDataUrl } from '@/lib/photo-upload'
import { siteStatus } from '@/lib/geo'

const CHECKOUT_ROLES = ['ENGINEER', 'SURVEYOR'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...CHECKOUT_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json()
    const { latitude, longitude, photo, measurements, materials } = body

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

    if (!survey.checkedInAt) {
      return NextResponse.json({ success: false, error: 'You must check in before checking out' }, { status: 400 })
    }

    if (survey.checkedOutAt) {
      return NextResponse.json({ success: false, error: 'Already checked out of this survey' }, { status: 409 })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json({ success: false, error: 'A valid latitude and longitude are required' }, { status: 400 })
    }

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({ success: false, error: 'A check-out photo is required' }, { status: 400 })
    }

    const measurementList = Array.isArray(measurements) ? measurements : []
    for (const m of measurementList) {
      if (!m?.category || typeof m.category !== 'string') {
        return NextResponse.json({ success: false, error: 'Each measurement requires a category' }, { status: 400 })
      }
    }

    const materialList = Array.isArray(materials) ? materials : []
    for (const mat of materialList) {
      if (!mat?.materialName || mat?.quantity === undefined || !mat?.unit) {
        return NextResponse.json({ success: false, error: 'Each material requires a name, quantity, and unit' }, { status: 400 })
      }
      const qty = parseFloat(mat.quantity)
      if (Number.isNaN(qty) || qty < 0) {
        return NextResponse.json({ success: false, error: 'Material quantity must be a non-negative number' }, { status: 400 })
      }
    }

    let photoUrl: string
    try {
      photoUrl = await uploadPhotoDataUrl(photo, `surveys/${id}/checkout`)
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || 'Failed to upload photo' }, { status: 400 })
    }

    const now = new Date()

    const [, , , updatedSurvey] = await db.$transaction([
      db.photo.create({
        data: {
          surveyId: id,
          url: photoUrl,
          filename: `checkout-${now.getTime()}.jpg`,
          caption: 'Check-Out',
          latitude: lat,
          longitude: lng,
          takenAt: now,
          createdBy: userId,
        },
      }),
      db.measurement.createMany({
        data: measurementList.map((m: any) => ({
          surveyId: id,
          category: m.category,
          description: m.description || null,
          length: m.length !== undefined && m.length !== '' ? parseFloat(m.length) : null,
          width: m.width !== undefined && m.width !== '' ? parseFloat(m.width) : null,
          height: m.height !== undefined && m.height !== '' ? parseFloat(m.height) : null,
          unit: m.unit || 'm',
          notes: m.notes || null,
          createdBy: userId,
        })),
      }),
      db.materialRequirement.createMany({
        data: materialList.map((mat: any) => ({
          surveyId: id,
          materialName: mat.materialName,
          specification: mat.specification || null,
          quantity: parseFloat(mat.quantity),
          unit: mat.unit,
          estimatedCost: mat.estimatedCost !== undefined && mat.estimatedCost !== '' ? parseFloat(mat.estimatedCost) : null,
          notes: mat.notes || null,
          createdBy: userId,
        })),
      }),
      db.survey.update({
        where: { id },
        data: {
          checkedOutAt: now,
          status: 'SUBMITTED',
          completedDate: now,
          updatedBy: userId,
        },
      }),
    ], { timeout: 20000 })

    const { onSite, distanceMeters } = siteStatus(lat, lng, survey.project.latitude, survey.project.longitude)

    return NextResponse.json({ success: true, data: updatedSurvey, photoUrl, onSite, distanceMeters }, { status: 201 })
  } catch (error) {
    console.error('POST /api/surveys/[id]/checkout error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
