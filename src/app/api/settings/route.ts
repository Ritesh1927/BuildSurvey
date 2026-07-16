import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const
const WRITE_ROLES = ['SUPER_ADMIN'] as const

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const settings = await db.setting.findMany({
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
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'settings array is required' },
        { status: 400 }
      )
    }

    const validItems = settings.filter((item: any) => item?.key && item.value !== undefined)

    const results = await db.$transaction(
      validItems.map((item: any) =>
        db.setting.upsert({
          where: { key: item.key },
          update: {
            value: String(item.value),
            ...(item.group !== undefined && { group: item.group }),
            ...(item.description !== undefined && { description: item.description }),
            updatedBy: userId,
          },
          create: {
            key: item.key,
            value: String(item.value),
            group: item.group || null,
            description: item.description || null,
            createdBy: userId,
          },
        })
      )
    )

    return NextResponse.json({ success: true, data: results }, { status: 201 })
  } catch (error) {
    console.error('Failed to upsert settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upsert settings' },
      { status: 500 }
    )
  }
}
