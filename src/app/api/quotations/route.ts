import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const projectId = searchParams.get('projectId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const where: any = { isDeleted: false }

    if (search) {
      const s = search.toLowerCase()
      where.OR = [
        { quotationNumber: { contains: s, mode: 'insensitive' } },
        { title: { contains: s, mode: 'insensitive' } },
      ]
    }

    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const [quotations, total] = await Promise.all([
      (db as any).quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, code: true } },
          items: { where: { isDeleted: false } },
        },
      }),
      (db as any).quotation.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: quotations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Failed to fetch quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, projectId, items, validUntil, terms, notes } = body

    if (!title || !projectId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'title, projectId, and items (non-empty array) are required' },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (!item.description || !item.unit || item.quantity === undefined || item.unitRate === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each item requires description, unit, quantity, and unitRate' },
          { status: 400 }
        )
      }
    }

    const lastQuotation = await (db as any).quotation.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { quotationNumber: true },
    })

    let nextNum = 1
    if (lastQuotation && lastQuotation.quotationNumber) {
      const parts = lastQuotation.quotationNumber.split('-')
      const last = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(last)) nextNum = last + 1
    }
    const year = new Date().getFullYear()
    const quotationNumber = `QUO-${year}-${String(nextNum).padStart(3, '0')}`

    const computedItems = items.map((item: any) => ({
      description: item.description,
      unit: item.unit,
      quantity: parseFloat(item.quantity),
      unitRate: parseFloat(item.unitRate),
      amount: parseFloat(item.quantity) * parseFloat(item.unitRate),
    }))

    const totalAmount = computedItems.reduce((sum: number, item: any) => sum + item.amount, 0)
    const taxAmount = totalAmount * 0.18
    const grandTotal = totalAmount + taxAmount

    const quotation = await (db as any).quotation.create({
      data: {
        quotationNumber,
        title,
        projectId,
        totalAmount,
        taxAmount,
        grandTotal,
        validUntil: validUntil ? new Date(validUntil) : null,
        terms: terms || null,
        notes: notes || null,
        items: {
          create: computedItems,
        },
      },
      include: {
        items: true,
        project: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (error) {
    console.error('Failed to create quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
