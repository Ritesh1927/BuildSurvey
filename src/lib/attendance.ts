import { db } from '@/lib/db'
import { getOfficeLocation } from '@/lib/office-location'
import { haversineDistanceMeters } from '@/lib/geo'

export function todayDateOnly(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

// Called from Survey and Site Visit check-in - a field worker who's proven
// their presence at a project site that day shouldn't also need to check in
// from the office to avoid showing up as "Not Marked". No photo is stored
// here (see AttendanceSource.FIELD_VISIT in schema.prisma for why) and this
// never overwrites an existing record for the day - first check-in wins,
// whether that's an office mark or a field one.
export async function markFieldAttendance(userId: string, lat: number, lng: number): Promise<void> {
  const today = todayDateOnly()
  const existing = await db.attendance.findUnique({ where: { userId_date: { userId, date: today } } })
  if (existing) return

  const office = await getOfficeLocation()
  const distanceMeters = office.latitude != null && office.longitude != null
    ? Math.round(haversineDistanceMeters(lat, lng, office.latitude, office.longitude))
    : 0

  try {
    await db.attendance.create({
      data: {
        userId,
        date: today,
        latitude: lat,
        longitude: lng,
        distanceMeters,
        photoUrl: null,
        source: 'FIELD_VISIT',
        createdBy: userId,
      },
    })
  } catch (e: any) {
    // Race with another field check-in the same moment - harmless, someone
    // else's check-in already claimed the day.
    if (e?.code !== 'P2002') throw e
  }
}
