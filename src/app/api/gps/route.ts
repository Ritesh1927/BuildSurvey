import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || ''
    const projectId = searchParams.get('projectId') || ''
    const hours = parseInt(searchParams.get('hours') || '24', 10)

    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const where: any = {
      isDeleted: false,
      timestamp: { gte: since },
    }

    if (userId) where.userId = userId
    if (projectId) where.projectId = projectId

    const locations = await db.gpsTracking.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 500,
    })

    const latestByUser: Record<string, any> = {}
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
          timestamp: loc.timestamp,
          minutesAgo,
          status: minutesAgo < 5 ? 'active' : minutesAgo < 30 ? 'idle' : 'offline',
          projectName: loc.project?.name || 'Unassigned',
        }
      }
    }

    return NextResponse.json({
      locations,
      activeUsers: Object.values(latestByUser),
      total: locations.length,
    })
  } catch (error) {
    console.error('GET /api/gps error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, latitude, longitude, accuracy, projectId } = body

    if (!userId || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'userId, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    const location = await db.gpsTracking.create({
      data: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        projectId: projectId || null,
      },
    })

    return NextResponse.json({ success: true, location }, { status: 201 })
  } catch (error) {
    console.error('POST /api/gps error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
