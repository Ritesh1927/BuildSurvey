import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const projectId = searchParams.get('projectId') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { description: { contains: s, mode: 'insensitive' } },
        { category: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (projectId) where.projectId = projectId
    if (category) where.category = category

    const [items, total] = await Promise.all([
      (db as any).bOQItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { serialNumber: 'asc' },
        include: { project: { select: { id: true, name: true, code: true } } },
      }),
      (db as any).bOQItem.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to fetch BOQ items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch BOQ items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, serialNumber, description, category, unit, quantity, unitRate, notes } = body

    if (!projectId || !serialNumber || !description || !category || !unit || quantity === undefined || unitRate === undefined) {
      return NextResponse.json(
        { success: false, error: 'projectId, serialNumber, description, category, unit, quantity, and unitRate are required' },
        { status: 400 }
      )
    }

    const amount = parseFloat(quantity) * parseFloat(unitRate)

    const item = await (db as any).bOQItem.create({
      data: {
        projectId,
        serialNumber: parseInt(serialNumber, 10),
        description,
        category,
        unit,
        quantity: parseFloat(quantity),
        unitRate: parseFloat(unitRate),
        amount,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Failed to create BOQ item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create BOQ item' },
      { status: 500 }
    )
  }
}
