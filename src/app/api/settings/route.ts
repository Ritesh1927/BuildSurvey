import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const settings = await (db as any).setting.findMany({
      where: { isDeleted: false },
      orderBy: { key: 'asc' },
    })

    const grouped: Record<string, any[]> = {}
    for (const setting of settings) {
      const group = setting.group || 'general'
      if (!grouped[group]) grouped[group] = []
      grouped[group].push(setting)
    }

    return NextResponse.json({ success: true, data: settings, grouped })
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'settings array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const item of settings) {
      const { key, value, group, description } = item

      if (!key || value === undefined) {
        continue
      }

      const existing = await (db as any).setting.findUnique({ where: { key } })

      let result
      if (existing) {
        result = await (db as any).setting.update({
          where: { key },
          data: {
            value: String(value),
            ...(group !== undefined && { group }),
            ...(description !== undefined && { description }),
          },
        })
      } else {
        result = await (db as any).setting.create({
          data: {
            key,
            value: String(value),
            group: group || null,
            description: description || null,
          },
        })
      }

      results.push(result)
    }

    return NextResponse.json({ success: true, data: results }, { status: 201 })
  } catch (error) {
    console.error('Failed to upsert settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upsert settings' },
      { status: 500 }
    )
  }
}
