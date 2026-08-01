import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deletePhotoUrl } from '@/lib/photo-upload'

// Attendance date/GPS/distance history is kept forever - only the photo
// itself is time-limited, to keep Blob storage from growing without bound.
const RETENTION_DAYS = 30

// Scoped to attendance selfies specifically - survey check-in/check-out
// photos are a project's actual work record and are deliberately left
// alone here, not swept up by this job.
export async function GET(request: NextRequest) {
  // Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}` on
  // scheduled invocations once that env var is set on the project - reject
  // anything else so this destructive endpoint can't be hit by URL alone.
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS)

    const expired = await db.attendance.findMany({
      where: { date: { lt: cutoff }, photoUrl: { not: null } },
      select: { id: true, photoUrl: true },
      take: 500, // one day's worth of backlog is always far smaller - this is just a safety cap
    })

    let deleted = 0
    let failed = 0
    for (const record of expired) {
      try {
        await deletePhotoUrl(record.photoUrl!)
        await db.attendance.update({ where: { id: record.id }, data: { photoUrl: null } })
        deleted++
      } catch (e) {
        console.error(`Failed to delete attendance photo ${record.id}:`, e)
        failed++
      }
    }

    return NextResponse.json({ success: true, deleted, failed, moreRemaining: expired.length === 500 })
  } catch (error) {
    console.error('GET /api/cron/cleanup-attendance-photos error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
