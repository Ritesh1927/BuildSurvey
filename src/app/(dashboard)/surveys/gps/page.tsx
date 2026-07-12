'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  MapPin,
  Play,
  Square,
  Clock,
  Users,
  Battery,
  Signal,
  RefreshCw,
  LocateFixed,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'

interface GpsLocation {
  userId: string
  userName: string
  latitude: number
  longitude: number
  accuracy: number | null
  timestamp: string
  minutesAgo: number
  status: 'active' | 'idle' | 'offline'
  projectName: string
}

interface MapMarker {
  id: string
  lat: number
  lng: number
  label: string
  status: string
  color: string
}

export default function GpsTrackingPage() {
  const { data: session } = useSession()
  const sessionUser = session?.user as any
  const currentUserId = sessionUser?.id || ''

  const [activeUsers, setActiveUsers] = useState<GpsLocation[]>([])
  const [totalLocations, setTotalLocations] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [lastSent, setLastSent] = useState<string>('')
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629])
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/gps?hours=1')
      const data = await res.json()
      setActiveUsers(data.activeUsers || [])
      setTotalLocations(data.total || 0)
      updateMapMarkers(data.activeUsers || [])
    } catch {
      // silently fail
    }
  }, [])

  const updateMapMarkers = (users: GpsLocation[]) => {
    if (!mapRef.current) return
    const L = require('leaflet')

    users.forEach((u) => {
      const color = u.status === 'active' ? '#22c55e' : u.status === 'idle' ? '#eab308' : '#94a3b8'
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:11px;font-weight:bold">${u.userName.charAt(0)}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      if (markersRef.current[u.userId]) {
        markersRef.current[u.userId].setLatLng([u.latitude, u.longitude]).setIcon(icon)
      } else {
        markersRef.current[u.userId] = L.marker([u.latitude, u.longitude], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${u.userName}</b><br/>${u.projectName}<br/>${u.minutesAgo}m ago`)
      }
    })

    if (users.length > 0 && !isTracking) {
      setMapCenter([users[0].latitude, users[0].longitude])
    }
  }

  useEffect(() => {
    fetchLocations()
    const interval = setInterval(fetchLocations, 15000)
    return () => clearInterval(interval)
  }, [fetchLocations])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')

    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      setMapReady(true)

      setTimeout(() => map.invalidateSize(), 100)
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, mapRef.current.getZoom())
    }
  }, [mapCenter])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setError('')
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setMapCenter([latitude, longitude])

        try {
          await fetch('/api/gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUserId,
              latitude,
              longitude,
              accuracy,
            }),
          })
          setLastSent(new Date().toLocaleTimeString())
          fetchLocations()
        } catch {
          // silently fail
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    )

    setWatchId(id)
    setIsTracking(true)
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsTracking(false)
  }

  const clearMapMarkers = () => {
    if (!mapRef.current) return
    Object.values(markersRef.current).forEach((m: any) => mapRef.current.removeLayer(m))
    markersRef.current = {}
    fetchLocations()
  }

  const activeCount = activeUsers.filter((u) => u.status === 'active').length
  const idleCount = activeUsers.filter((u) => u.status === 'idle').length
  const offlineCount = activeUsers.filter((u) => u.status === 'offline').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS Tracking"
        description="Real-time field team location tracking"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'GPS Tracking' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLocations}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
            {!isTracking ? (
              <Button onClick={startTracking} className="bg-emerald-600 hover:bg-emerald-700">
                <Play className="mr-2 h-4 w-4" />Start Tracking
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="destructive">
                <Square className="mr-2 h-4 w-4" />Stop Tracking
              </Button>
            )}
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
          <span className="font-medium">Tracking active</span>
          {lastSent && <span className="text-muted-foreground">— Last sent: {lastSent}</span>}
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Active Now" value={activeCount} color="success" />
        <StatCard icon={<Clock className="h-6 w-6" />} label="Idle" value={idleCount} color="warning" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Offline" value={offlineCount} color="danger" />
        <StatCard icon={<MapPin className="h-6 w-6" />} label="Total Pings" value={totalLocations} color="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />Live Map
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearMapMarkers}>
                  <Trash2 className="h-4 w-4 mr-1" />Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={mapContainerRef}
                className="h-[400px] sm:h-[500px] w-full rounded-lg border border-border z-0"
                style={{ background: '#e5e7eb' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Engineer List */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Field Team</CardTitle>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No tracking data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start tracking to see locations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setMapCenter([user.latitude, user.longitude])}
                    >
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {user.userName.charAt(0)}
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
        </div>
      </div>
    </div>
  )
}
