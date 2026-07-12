'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  MapPin,
  Clock,
  Users,
  RefreshCw,
  LocateFixed,
  Route,
  Shield,
  Timer,
  Battery,
  Gauge,
  Circle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'

interface ActiveUser {
  userId: string
  userName: string
  latitude: number
  longitude: number
  accuracy: number | null
  speed: number | null
  batteryLevel: number | null
  isMoving: boolean
  timestamp: string
  minutesAgo: number
  status: 'active' | 'idle' | 'offline'
  projectName: string
  projectId: string | null
}

interface RoutePoint {
  lat: number
  lng: number
  timestamp: string
  speed: number | null
  accuracy: number | null
}

interface Geofence {
  id: string
  name: string
  centerLat: number
  centerLng: number
  radius: number
  projectId: string
  engineerId: string | null
}

interface GeofenceSummary {
  userId: string
  userName: string
  surveyId: string
  surveyName: string
  firstSeen: string
  lastSeen: string
  everInside: boolean
  currentInside: boolean
  entries: number
  exits: number
  durationMinutes: number
}

export default function GpsTrackingPage() {
  const { data: session } = useSession()
  const sessionUser = session?.user as any
  const currentUserId = sessionUser?.id || ''

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [routes, setRoutes] = useState<Record<string, RoutePoint[]>>({})
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [geofenceSummary, setGeofenceSummary] = useState<GeofenceSummary[]>([])
  const [totalLocations, setTotalLocations] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [lastSent, setLastSent] = useState('')
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showGeofences, setShowGeofences] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any>({})
  const routeLayersRef = useRef<any>({})
  const geofenceLayersRef = useRef<any>({})
  const LRef = useRef<any>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/gps?hours=24&route=true')
      const data = await res.json()
      setActiveUsers(data.activeUsers || [])
      setRoutes(data.routes || {})
      setGeofences(data.geofences || [])
      setGeofenceSummary(data.geofenceSummary || [])
      setTotalLocations(data.total || 0)
      updateMap(data.activeUsers || [], data.routes || {}, data.geofences || [])
    } catch {
      // silently fail
    }
  }, [])

  const updateMap = (
    users: ActiveUser[],
    userRoutes: Record<string, RoutePoint[]>,
    fenceList: Geofence[]
  ) => {
    if (!mapRef.current || !LRef.current) return
    const L = LRef.current

    Object.values(markersRef.current).forEach((m: any) => mapRef.current.removeLayer(m))
    markersRef.current = {}

    Object.values(routeLayersRef.current).forEach((l: any) => mapRef.current.removeLayer(l))
    routeLayersRef.current = {}

    Object.values(geofenceLayersRef.current).forEach((l: any) => mapRef.current.removeLayer(l))
    geofenceLayersRef.current = {}

    if (showGeofences) {
      for (const fence of fenceList) {
        const circle = L.circle([fence.centerLat, fence.centerLng], {
          radius: fence.radius,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '8, 6',
        })
          .addTo(mapRef.current)
          .bindPopup(`<b>${fence.name}</b><br/>Geofence: ${fence.radius}m radius`)
        geofenceLayersRef.current[fence.id] = circle
      }
    }

    for (const u of users) {
      const color =
        u.status === 'active' ? '#22c55e' : u.status === 'idle' ? '#eab308' : '#94a3b8'
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;position:relative">
          <span style="color:white;font-size:12px;font-weight:bold">${u.userName.split(' ').map((n: string) => n[0]).join('')}</span>
          ${u.isMoving ? '<span style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid white"></span>' : ''}
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      markersRef.current[u.userId] = L.marker([u.latitude, u.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="min-width:160px">
            <b>${u.userName}</b><br/>
            <span style="color:#666">${u.projectName}</span><br/>
            <span style="color:#888;font-size:12px">${u.minutesAgo}m ago</span>
            ${u.speed ? `<br/><span style="color:#888;font-size:12px">Speed: ${u.speed.toFixed(1)} m/s</span>` : ''}
          </div>`
        )
    }

    if (showRoutes) {
      for (const [uid, pts] of Object.entries(userRoutes)) {
        if (pts.length < 2) continue
        const latlngs = pts.map((p) => [p.lat, p.lng] as [number, number])
        const polyline = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '6, 4',
        }).addTo(mapRef.current)
        routeLayersRef.current[uid] = polyline
      }
    }

    if (users.length > 0 && !selectedUser) {
      mapRef.current.setView([users[0].latitude, users[0].longitude], 13)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 12000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    LRef.current = L

    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 12,
        zoomControl: true,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
    }
  }, [])

  useEffect(() => {
    updateMap(activeUsers, routes, geofences)
  }, [showRoutes, showGeofences])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser')
      return
    }

    setError('')
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords
        let battery = null
        try {
          const b = await (navigator as any).getBattery?.()
          if (b) battery = Math.round(b.level * 100)
        } catch {}

        try {
          await fetch('/api/gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUserId,
              latitude,
              longitude,
              accuracy,
              speed,
              batteryLevel: battery,
            }),
          })
          setLastSent(new Date().toLocaleTimeString())
          fetchData()
        } catch {}
      },
      (err) => setError(`Location error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 12000 }
    )

    setWatchId(id)
    setIsTracking(true)
  }

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    setWatchId(null)
    setIsTracking(false)
  }

  useEffect(() => {
    if (currentUserId && !isTracking) startTracking()
  }, [currentUserId])

  const focusUser = (user: ActiveUser) => {
    setSelectedUser(user.userId)
    if (mapRef.current) {
      mapRef.current.setView([user.latitude, user.longitude], 15)
      markersRef.current[user.userId]?.openPopup()
    }
  }

  const activeCount = activeUsers.filter((u) => u.status === 'active').length
  const idleCount = activeUsers.filter((u) => u.status === 'idle').length
  const offlineCount = activeUsers.filter((u) => u.status === 'offline').length
  const movingCount = activeUsers.filter((u) => u.isMoving).length
  const insideGeofence = geofenceSummary.filter((g) => g.currentInside).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS Tracking"
        description="Real-time field team location tracking with geofencing"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'GPS Tracking' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {isTracking && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          <LocateFixed className="h-4 w-4 animate-pulse" />
          <span className="font-medium">Auto-tracking active</span>
          {lastSent && <span className="text-muted-foreground">— Last ping: {lastSent}</span>}
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Users className="h-6 w-6" />} label="Active" value={activeCount} color="success" />
        <StatCard icon={<Gauge className="h-6 w-6" />} label="Moving" value={movingCount} color="info" />
        <StatCard icon={<Clock className="h-6 w-6" />} label="Idle" value={idleCount} color="warning" />
        <StatCard icon={<Shield className="h-6 w-6" />} label="On-Site" value={insideGeofence} color="success" />
        <StatCard icon={<MapPin className="h-6 w-6" />} label="Total Pings" value={totalLocations} color="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />Live Map
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={showRoutes ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowRoutes(!showRoutes)}
                  >
                    <Route className="h-4 w-4 mr-1" />Routes
                  </Button>
                  <Button
                    variant={showGeofences ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowGeofences(!showGeofences)}
                  >
                    <Circle className="h-4 w-4 mr-1" />Geofences
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={mapContainerRef}
                className="h-[400px] sm:h-[520px] w-full rounded-lg border border-border z-0"
                style={{ background: '#e5e7eb' }}
              />
            </CardContent>
          </Card>

          {geofenceSummary.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />Geofence Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {geofenceSummary.map((g, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{g.userName}</p>
                        <p className="text-xs text-muted-foreground">{g.surveyName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={g.currentInside ? 'success' : 'secondary'}>
                          {g.currentInside ? 'On-Site' : 'Left Site'}
                        </Badge>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{g.durationMinutes} min total</p>
                          <p>{g.entries} entries</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Field Team</CardTitle>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No tracking data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Tracking starts automatically</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <div
                      key={user.userId}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                        selectedUser === user.userId
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-border hover:bg-accent/50'
                      }`}
                      onClick={() => focusUser(user)}
                    >
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {user.userName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                            user.status === 'active'
                              ? 'bg-emerald-500'
                              : user.status === 'idle'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.projectName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.isMoving && (
                            <Badge variant="success" className="text-[9px] px-1 py-0">
                              Moving
                            </Badge>
                          )}
                          {user.batteryLevel != null && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Battery className="h-3 w-3" />
                              {user.batteryLevel}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'success'
                              : user.status === 'idle'
                                ? 'warning'
                                : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {user.status === 'active'
                            ? `${user.minutesAgo}m ago`
                            : user.status === 'idle'
                              ? `${user.minutesAgo}m`
                              : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Circle className="h-4 w-4" />Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Active (moving)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-500" /> Idle (stationary)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gray-400" /> Offline
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }} />
                Travel route
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-500/10" />
                Geofence (500m)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
