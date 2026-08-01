import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getOfficeLocation } from '@/lib/office-location'

// Every employee's attendance page needs the office coordinates (to build
// the "Get Directions" link and to show distance context) — deliberately a
// narrow, any-authenticated-role-readable endpoint rather than routing
// through /api/settings, which is read-locked to Super Admin/Admin/Manager
// and also exposes SMTP credentials, integration keys, etc.
export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const location = await getOfficeLocation()
  return NextResponse.json({ success: true, data: location })
}
