import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission } from '@/lib/api-auth'
import {
  isValidEmail, isValidPhone, isValidGST, isValidPAN, isValidTAN, isValidCIN,
  isValidPIN, isValidUrl, isPositiveNumber, isNonNegativeNumber, isValidLatitude, isValidLongitude,
} from '@/lib/validation'

// Only settings keys with a real, checkable format are validated here -
// free-text/opaque fields (API keys, SMTP host, etc) have nothing
// meaningful to validate. Keyed by the flat Setting.key the client sends,
// same names as the settings page's per-group state.
const SETTING_VALIDATORS: Record<string, (v: string) => boolean> = {
  gstRate: (v) => isNonNegativeNumber(v) && Number(v) <= 100,
  officeLatitude: isValidLatitude,
  officeLongitude: isValidLongitude,
  email: isValidEmail,
  phone: isValidPhone,
  website: isValidUrl,
  pincode: isValidPIN,
  gstNumber: isValidGST,
  panNumber: isValidPAN,
  tanNumber: isValidTAN,
  cinNumber: isValidCIN,
  minPasswordLength: isPositiveNumber,
  passwordExpiryDays: isNonNegativeNumber,
  sessionTimeout: isPositiveNumber,
  maxLoginAttempts: isPositiveNumber,
  lockoutDuration: isNonNegativeNumber,
  maxFileSize: isPositiveNumber,
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('settings:read')
  if (permError) return permError

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

  const permError = await requirePermission('settings:write')
  if (permError) return permError

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

    for (const item of validItems) {
      const validator = SETTING_VALIDATORS[item.key]
      const value = String(item.value)
      if (validator && value !== '' && !validator(value)) {
        return NextResponse.json(
          { success: false, error: `Invalid value for setting "${item.key}"` },
          { status: 400 }
        )
      }
    }

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
