import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const risk = await (db as any).riskAssessment.findUnique({
      where: { id },
      include: {
        survey: { select: { id: true, title: true, projectId: true } },
        identifiedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!risk) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: risk })
  } catch (error) {
    console.error('GET /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, level, mitigation, surveyId, identifiedById } = body

    const existing = await (db as any).riskAssessment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (level) updateData.level = level
    if (mitigation !== undefined) updateData.mitigation = mitigation
    if (surveyId) updateData.surveyId = surveyId
    if (identifiedById) updateData.identifiedById = identifiedById

    const updated = await (db as any).riskAssessment.update({
      where: { id },
      data: updateData,
      include: {
        survey: { select: { id: true, title: true, projectId: true } },
        identifiedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await (db as any).riskAssessment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Risk assessment not found' }, { status: 404 })
    }

    await (db as any).riskAssessment.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true, message: 'Risk assessment deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/risks/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
