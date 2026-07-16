import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const GEOFENCE_RADIUS_METERS = 500
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] as const
const SCOPED_ROLES = ['ENGINEER', 'SURVEYOR']

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const sessionUserId = session!.user!.id

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get('userId') || ''
    const projectId = searchParams.get('projectId') || ''
    const hours = parseInt(searchParams.get('hours') || '24', 10)
    const route = searchParams.get('route') === 'true'

    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const where: any = {
      isDeleted: false,
      timestamp: { gte: since },
    }

    // Engineer/Surveyor can only ever see their own location history —
    // seeing a colleague's whereabouts is a privacy boundary, not just
    // a data-access one. The client-supplied userId is never honored
    // for these roles.
    if (SCOPED_ROLES.includes(role)) {
      where.userId = sessionUserId
    } else if (requestedUserId) {
      where.userId = requestedUserId
    }

    if (projectId) where.projectId = projectId

    const locations = await db.gpsTracking.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'asc' },
      take: 2000,
    })

    const latestByUser: Record<string, any> = {}
    const routeByUser: Record<string, any[]> = {}
    const geofenceEvents: any[] = []

    for (const loc of locations) {
      const uid = loc.userId

      if (!latestByUser[uid]) {
        const elapsed = Date.now() - new Date(loc.timestamp).getTime()
        const minutesAgo = Math.round(elapsed / 60000)
        latestByUser[uid] = {
          userId: uid,
          userName: `${loc.user.firstName} ${loc.user.lastName}`,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          speed: loc.speed,
          batteryLevel: loc.batteryLevel,
          isMoving: loc.isMoving,
          timestamp: loc.timestamp,
          minutesAgo,
          status: minutesAgo < 5 ? 'active' : minutesAgo < 30 ? 'idle' : 'offline',
          projectName: loc.project?.name || 'Unassigned',
          projectId: loc.projectId,
        }
      }

      if (route) {
        if (!routeByUser[uid]) routeByUser[uid] = []
        routeByUser[uid].push({
          lat: loc.latitude,
          lng: loc.longitude,
          timestamp: loc.timestamp,
          speed: loc.speed,
          accuracy: loc.accuracy,
        })
      }
    }

    const surveys = await db.survey.findMany({
      where: {
        isDeleted: false,
        gpsLatitude: { not: null },
        gpsLongitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        gpsLatitude: true,
        gpsLongitude: true,
        projectId: true,
        engineerId: true,
        status: true,
      },
    })

    // Engineer/Surveyor only get geofences relevant to themselves — the
    // full list otherwise leaks every survey site's coordinates and
    // which engineer is assigned to each, company-wide.
    const geofences = surveys
      .filter((s: any) => s.gpsLatitude && s.gpsLongitude)
      .filter((s: any) => !SCOPED_ROLES.includes(role) || s.engineerId === sessionUserId)
      .map((s: any) => ({
        id: s.id,
        name: s.title,
        centerLat: s.gpsLatitude!,
        centerLng: s.gpsLongitude!,
        radius: GEOFENCE_RADIUS_METERS,
        projectId: s.projectId,
        engineerId: s.engineerId,
      }))

    for (const loc of locations) {
      for (const fence of geofences) {
        const dist = haversineDistance(loc.latitude, loc.longitude, fence.centerLat, fence.centerLng)
        const isInside = dist <= fence.radius

        if (loc.userId === fence.engineerId) {
          geofenceEvents.push({
            userId: loc.userId,
            userName: `${loc.user.firstName} ${loc.user.lastName}`,
            surveyId: fence.id,
            surveyName: fence.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            distance: Math.round(dist),
            isInside,
            timestamp: loc.timestamp,
          })
        }
      }
    }

    const entryExitByUser: Record<string, any> = {}
    for (const evt of geofenceEvents) {
      const key = `${evt.userId}-${evt.surveyId}`
      if (!entryExitByUser[key]) {
        entryExitByUser[key] = {
          userId: evt.userId,
          userName: evt.userName,
          surveyId: evt.surveyId,
          surveyName: evt.surveyName,
          firstSeen: evt.timestamp,
          lastSeen: evt.timestamp,
          everInside: false,
          currentInside: false,
          entries: 0,
          exits: 0,
        }
      }
      const entry = entryExitByUser[key]
      entry.lastSeen = evt.timestamp
      if (evt.isInside) {
        entry.everInside = true
        entry.currentInside = true
      } else {
        if (entry.currentInside) entry.exits++
        entry.currentInside = false
      }
    }

    for (const key of Object.keys(entryExitByUser)) {
      const entry = entryExitByUser[key]
      if (entry.everInside && entry.currentInside) entry.entries++
      const duration = new Date(entry.lastSeen).getTime() - new Date(entry.firstSeen).getTime()
      entry.durationMinutes = Math.round(duration / 60000)
    }

    return NextResponse.json({
      locations: locations.reverse(),
      activeUsers: Object.values(latestByUser),
      routes: route ? routeByUser : undefined,
      geofences,
      geofenceSummary: Object.values(entryExitByUser),
      total: locations.length,
    })
  } catch (error) {
    console.error('GET /api/gps error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...WRITE_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    // A GPS ping always reports the submitting device's own position —
    // userId is never taken from the body, for any role. Accepting a
    // client-supplied userId would let anyone fabricate another
    // employee's location/attendance record.
    const userId = session!.user!.id

    const body = await req.json()
    const { latitude, longitude, accuracy, speed, batteryLevel } = body

    if (latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'latitude and longitude are required' },
        { status: 400 }
      )
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'latitude/longitude out of range' },
        { status: 400 }
      )
    }

    const isMoving = speed != null && parseFloat(speed) > 0.5

    // Project association is always computed server-side from proximity
    // to an active survey's site coordinates — never trusted from the
    // client, otherwise the geofence "verification" would be meaningless
    // (an employee could just always claim their assigned project).
    let assignedProjectId: string | null = null

    const activeSurvey = await db.survey.findFirst({
      where: {
        engineerId: userId,
        isDeleted: false,
        status: { in: ['IN_PROGRESS', 'ASSIGNED'] },
        gpsLatitude: { not: null },
        gpsLongitude: { not: null },
      },
      select: { projectId: true, gpsLatitude: true, gpsLongitude: true },
    })

    if (activeSurvey) {
      const dist = haversineDistance(
        lat, lng,
        activeSurvey.gpsLatitude!, activeSurvey.gpsLongitude!
      )
      if (dist <= GEOFENCE_RADIUS_METERS * 2) {
        assignedProjectId = activeSurvey.projectId
      }
    }

    const location = await db.gpsTracking.create({
      data: {
        userId,
        latitude: lat,
        longitude: lng,
        accuracy: accuracy !== undefined && accuracy !== null && accuracy !== '' ? parseFloat(accuracy) : null,
        speed: speed !== undefined && speed !== null && speed !== '' ? parseFloat(speed) : null,
        batteryLevel: batteryLevel != null ? parseInt(batteryLevel) : null,
        isMoving,
        projectId: assignedProjectId,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, location }, { status: 201 })
  } catch (error) {
    console.error('POST /api/gps error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
