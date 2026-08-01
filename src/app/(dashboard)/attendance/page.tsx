"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Camera,
  CheckCircle2,
  Loader2,
  Navigation,
  UserCheck,
  Users,
  XCircle,
  HelpCircle,
} from "lucide-react"

import { formatDate, formatDateTime } from "@/lib/utils"
import { compressImage, getCurrentPosition } from "@/lib/image-compress"
import { showSuccess, showError } from "@/components/ui/toast"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/ui/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AttendanceRecord {
  id: string
  date: string
  markedAt: string
  distanceMeters: number
  photoUrl: string
}

interface TeamEmployee {
  id: string
  firstName: string
  lastName: string
  role: string
  today: { markedAt: string; distanceMeters: number; photoUrl: string } | null
  monthCount: number
}

const TEAM_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function AttendancePage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canViewTeam = !!role && TEAM_VIEW_ROLES.includes(role)

  const [officeLocation, setOfficeLocation] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null })
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const [photo, setPhoto] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState<{ message: string; distanceMeters?: number } | null>(null)

  const [activeTab, setActiveTab] = useState("mine")
  const [teamDate, setTeamDate] = useState(todayKey())
  const [teamEmployees, setTeamEmployees] = useState<TeamEmployee[]>([])
  const [teamLoading, setTeamLoading] = useState(false)

  const todayRecord = history.find((r) => r.date.slice(0, 10) === todayKey()) || null

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/attendance?scope=self&limit=30')
      const data = await res.json()
      if (data.success) setHistory(data.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
    fetch('/api/settings/office-location')
      .then((res) => res.json())
      .then((data) => { if (data.success) setOfficeLocation(data.data) })
      .catch(() => {})
  }, [fetchHistory])

  const fetchTeam = useCallback(async (date: string) => {
    setTeamLoading(true)
    try {
      const res = await fetch(`/api/attendance?scope=team&date=${date}`)
      const data = await res.json()
      if (data.success) setTeamEmployees(data.data.employees)
    } catch {
      showError('Network error while loading team attendance')
    } finally {
      setTeamLoading(false)
    }
  }, [])

  useEffect(() => {
    if (canViewTeam && activeTab === 'team') fetchTeam(teamDate)
  }, [canViewTeam, activeTab, teamDate, fetchTeam])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(await compressImage(file))
    setMarkError(null)
  }

  const handleMark = async () => {
    if (!photo) {
      showError('Take a photo first')
      return
    }
    setMarking(true)
    setMarkError(null)
    try {
      const position = await getCurrentPosition()
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photo,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setMarkError({ message: data.error || 'Failed to mark attendance', distanceMeters: data.distanceMeters })
        if (data.officeLatitude != null && data.officeLongitude != null) {
          setOfficeLocation({ latitude: data.officeLatitude, longitude: data.officeLongitude })
        }
        return
      }
      showSuccess('Attendance marked — you\'re on record for today')
      setPhoto(null)
      fetchHistory()
    } catch (e: any) {
      setMarkError({ message: e?.message === 'Geolocation is not supported by this browser' || e?.code
        ? 'Could not get your location. Make sure location access is allowed for this site.'
        : 'Network error while marking attendance' })
    } finally {
      setMarking(false)
    }
  }

  const mapsHref = officeLocation.latitude != null && officeLocation.longitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${officeLocation.latitude},${officeLocation.longitude}`
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark today's attendance and track office presence"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Attendance" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {canViewTeam && (
          <TabsList>
            <TabsTrigger value="mine" className="gap-2"><UserCheck className="h-4 w-4" />My Attendance</TabsTrigger>
            <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" />Team Attendance</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="mine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <CardDescription>{formatDate(new Date())}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayRecord ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" />Attendance marked for today
                  </div>
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={todayRecord.photoUrl} alt="Attendance" className="h-24 w-24 rounded-lg border object-cover" />
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Marked at:</span> {formatDateTime(todayRecord.markedAt)}</p>
                      <p><span className="text-muted-foreground">Distance from office:</span> {todayRecord.distanceMeters}m</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {mapsHref && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                        <Navigation className="mr-2 h-4 w-4" />Get Directions to Office
                      </a>
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">Take a photo of yourself at the office to mark today's attendance. Your location will be captured automatically and must be within 100m of the office.</p>

                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="Attendance preview" className="w-full max-w-xs rounded-lg border object-cover" />
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tap to take a photo</span>
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}

                  {markError && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{markError.message}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {photo && (
                      <Button variant="outline" onClick={() => { setPhoto(null); setMarkError(null) }} disabled={marking}>Retake</Button>
                    )}
                    <Button className="flex-1" onClick={handleMark} disabled={!photo || marking}>
                      {marking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                      {marking ? 'Marking...' : 'Mark Attendance'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">My Recent Attendance</CardTitle></CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No attendance marked yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Marked At</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{formatDate(r.date)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(r.markedAt)}</TableCell>
                        <TableCell className="text-right text-sm">{r.distanceMeters}m</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewTeam && (
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={teamDate}
                max={todayKey()}
                onChange={(e) => setTeamDate(e.target.value)}
                className="w-[180px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Present"
                value={teamEmployees.filter((e) => e.today).length}
                icon={<CheckCircle2 className="h-6 w-6" />}
                color="success"
              />
              <StatCard
                label="Not Marked"
                value={teamEmployees.filter((e) => !e.today).length}
                icon={<XCircle className="h-6 w-6" />}
                color="warning"
              />
              <StatCard
                label="Total Employees"
                value={teamEmployees.length}
                icon={<Users className="h-6 w-6" />}
                color="default"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                {teamLoading ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Loading team attendance...</div>
                ) : teamEmployees.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">No employees found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked At</TableHead>
                        <TableHead className="text-right">Distance</TableHead>
                        <TableHead className="text-right">This Month</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamEmployees.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">
                                  {e.firstName[0]}{e.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{e.firstName} {e.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{e.role}</TableCell>
                          <TableCell>
                            {e.today ? (
                              <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Present</Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1"><HelpCircle className="h-3 w-3" />Not Marked</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{e.today ? formatDateTime(e.today.markedAt) : '—'}</TableCell>
                          <TableCell className="text-right text-sm">{e.today ? `${e.today.distanceMeters}m` : '—'}</TableCell>
                          <TableCell className="text-right text-sm">{e.monthCount} day{e.monthCount === 1 ? '' : 's'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
