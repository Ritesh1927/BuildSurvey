import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const survey = await db.survey.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
        engineer: { select: { id: true, firstName: true, lastName: true, email: true } },
        checklistItems: { where: { isDeleted: false } },
        photos: { where: { isDeleted: false } },
      },
    })

    if (!survey) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: survey })
  } catch (error) {
    console.error('GET /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      title, description, type, status, scheduledDate, completedDate,
      gpsLatitude, gpsLongitude, weatherCondition, siteCondition,
      accessDetails, notes, engineerId,
    } = body

    const existing = await db.survey.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type) updateData.type = type
    if (status) updateData.status = status
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null
    if (completedDate !== undefined) updateData.completedDate = completedDate ? new Date(completedDate) : null
    if (gpsLatitude !== undefined) updateData.gpsLatitude = gpsLatitude ? parseFloat(gpsLatitude) : null
    if (gpsLongitude !== undefined) updateData.gpsLongitude = gpsLongitude ? parseFloat(gpsLongitude) : null
    if (weatherCondition !== undefined) updateData.weatherCondition = weatherCondition
    if (siteCondition !== undefined) updateData.siteCondition = siteCondition
    if (accessDetails !== undefined) updateData.accessDetails = accessDetails
    if (notes !== undefined) updateData.notes = notes
    if (engineerId !== undefined) updateData.engineerId = engineerId

    const updated = await db.survey.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        engineer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.survey.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 })
    }

    await db.survey.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Survey deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/surveys/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
