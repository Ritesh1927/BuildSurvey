import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        surveys: { where: { isDeleted: false }, select: { id: true, title: true, status: true, scheduledDate: true } },
        boqItems: { where: { isDeleted: false }, select: { id: true, serialNumber: true, description: true, category: true, quantity: true, unitRate: true, amount: true } },
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name, description, type, status, startDate, endDate,
      budget, actualCost, address, city, state, latitude, longitude,
      area, floors, managerId, leadUserId,
    } = body

    const existing = await db.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type) updateData.type = type
    if (status) updateData.status = status
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null
    if (actualCost !== undefined) updateData.actualCost = parseFloat(actualCost)
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null
    if (area !== undefined) updateData.area = area ? parseFloat(area) : null
    if (floors !== undefined) updateData.floors = parseInt(floors, 10)
    if (managerId !== undefined) updateData.managerId = managerId
    if (leadUserId !== undefined) updateData.leadUserId = leadUserId

    const updated = await db.project.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, companyName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    await db.project.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
