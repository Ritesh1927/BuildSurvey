import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await db.client.findUnique({
      where: { id },
      include: {
        projects: { where: { isDeleted: false }, select: { id: true, name: true, code: true, status: true } },
        leads: { where: { isDeleted: false }, select: { id: true, name: true, status: true, createdAt: true } },
      },
    })

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      companyName, contactPerson, email, phone, address, city, state,
      zipCode, country, gstNumber, panNumber, website, notes,
    } = body

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (companyName) updateData.companyName = companyName
    if (contactPerson) updateData.contactPerson = contactPerson
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (country !== undefined) updateData.country = country
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber
    if (panNumber !== undefined) updateData.panNumber = panNumber
    if (website !== undefined) updateData.website = website
    if (notes !== undefined) updateData.notes = notes

    const updated = await db.client.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    await db.client.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Client deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
