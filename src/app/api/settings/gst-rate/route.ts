import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { getGstRate } from '@/lib/gst'

// GST rate is a plain tax percentage, not sensitive - deliberately a
// narrower, any-authenticated-role-readable endpoint rather than routing
// through /api/settings (which is locked to SUPER_ADMIN/ADMIN/MANAGER
// since it also exposes SMTP credentials, integration keys, etc.). BOQ
// and Quotations both need this value and are readable by a much wider
// set of roles (Engineer, Surveyor, Accountant, Client).
export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const gstRate = await getGstRate()
  return NextResponse.json({ success: true, data: { gstRate } })
}
