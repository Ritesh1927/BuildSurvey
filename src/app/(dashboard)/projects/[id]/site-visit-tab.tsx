"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Camera,
  LogIn,
  LogOut,
  Loader2,
  Navigation,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react"

import { formatDate, formatDateTime, formatDuration } from "@/lib/utils"
import { compressImage, getCurrentPosition } from "@/lib/image-compress"
import { siteStatus } from "@/lib/geo"
import { showSuccess, showError } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PhotoViewDialog } from "@/components/shared/photo-view-dialog"

interface SiteVisitRecord {
  id: string
  visitDate: string
  checkedInAt: string
  checkedOutAt: string | null
  checkInPhotoUrl: string
  checkOutPhotoUrl: string | null
  checkInLatitude: number
  checkInLongitude: number
  checkOutLatitude: number | null
  checkOutLongitude: number | null
  workSummary: string | null
  engineer: { id: string; firstName: string; lastName: string }
}

function SiteBadge({ onSite }: { onSite: boolean | null }) {
  if (onSite === null) return <Badge variant="secondary" className="text-[10px] gap-1"><HelpCircle className="h-3 w-3" />Unknown</Badge>
  return onSite ? (
    <Badge variant="success" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />On Site</Badge>
  ) : (
    <Badge variant="destructive" className="text-[10px] gap-1"><XCircle className="h-3 w-3" />Off Site</Badge>
  )
}

interface SiteVisitTabProps {
  projectId: string
  isLeadEngineer: boolean
  canViewAll: boolean
  projectLatitude: number | null
  projectLongitude: number | null
  projectStartDate: string | null
  projectEndDate: string | null
}

export function SiteVisitTab({ projectId, isLeadEngineer, canViewAll, projectLatitude, projectLongitude, projectStartDate, projectEndDate }: SiteVisitTabProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [visits, setVisits] = useState<SiteVisitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [viewPhoto, setViewPhoto] = useState<{ url: string | null; title: string; subtitle: string } | null>(null)

  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  const [checkOutPhoto, setCheckOutPhoto] = useState<string | null>(null)
  const [workSummary, setWorkSummary] = useState("")
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkOutError, setCheckOutError] = useState<string | null>(null)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/site-visits`)
      const data = await res.json()
      if (data.success) setVisits(data.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchVisits() }, [fetchVisits])

  // One visit per project per day - "today" here means today's record for
  // this engineer specifically, keyed by visitDate rather than checkedInAt
  // so a still-open visit from a previous day (which has expired at
  // midnight and can no longer be checked out) doesn't get mistaken for an
  // active one.
  const todayKey = new Date().toISOString().slice(0, 10)
  const myVisits = visits.filter((v) => v.engineer.id === userId)
  const todayVisit = myVisits.find((v) => v.visitDate.slice(0, 10) === todayKey) || null
  const staleOpenVisit = myVisits.find((v) => !v.checkedOutAt && v.visitDate.slice(0, 10) !== todayKey) || null

  const isWithinWindow = !!projectStartDate && !!projectEndDate
    && todayKey >= projectStartDate.slice(0, 10) && todayKey <= projectEndDate.slice(0, 10)

  const handleCheckInPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCheckInPhoto(await compressImage(file))
    setCheckInError(null)
  }

  const handleCheckOutPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCheckOutPhoto(await compressImage(file))
    setCheckOutError(null)
  }

  const handleCheckIn = async () => {
    if (!checkInPhoto) {
      showError("Take a check-in photo first")
      return
    }
    setCheckingIn(true)
    setCheckInError(null)
    try {
      const position = await getCurrentPosition()
      const res = await fetch(`/api/projects/${projectId}/site-visits/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photo: checkInPhoto,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setCheckInError(data.error || "Failed to check in")
        return
      }
      showSuccess("Checked in to this site visit")
      setCheckInPhoto(null)
      fetchVisits()
    } catch (e: any) {
      setCheckInError(e?.message || "Could not get your location. Make sure location access is allowed for this site.")
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!checkOutPhoto) {
      showError("Take a check-out photo first")
      return
    }
    if (!workSummary.trim()) {
      showError("Describe today's work before checking out")
      return
    }
    setCheckingOut(true)
    setCheckOutError(null)
    try {
      const position = await getCurrentPosition()
      const res = await fetch(`/api/projects/${projectId}/site-visits/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photo: checkOutPhoto,
          workSummary,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setCheckOutError(data.error || "Failed to check out")
        return
      }
      showSuccess("Checked out — have a good day")
      setCheckOutPhoto(null)
      setWorkSummary("")
      fetchVisits()
    } catch (e: any) {
      setCheckOutError(e?.message || "Could not get your location. Make sure location access is allowed for this site.")
    } finally {
      setCheckingOut(false)
    }
  }

  const mapsHref = projectLatitude != null && projectLongitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${projectLatitude},${projectLongitude}`
    : null

  return (
    <div className="space-y-6">
      {isLeadEngineer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {todayVisit?.checkedOutAt ? <CheckCircle2 className="h-5 w-5" /> : todayVisit ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              {todayVisit?.checkedOutAt ? "Today's Visit" : todayVisit ? "Check Out" : "Check In"}
            </CardTitle>
            <CardDescription>
              {todayVisit?.checkedOutAt
                ? `Completed — checked out ${formatDateTime(todayVisit.checkedOutAt)}`
                : todayVisit
                  ? `Checked in ${formatDateTime(todayVisit.checkedInAt)} — describe today's work to check out`
                  : isWithinWindow
                    ? "Site visits require a photo taken from the project site — location is captured automatically"
                    : projectStartDate && projectEndDate
                      ? `Site visits for this project run from ${formatDate(projectStartDate)} to ${formatDate(projectEndDate)} — today is outside that window.`
                      : "This project has no start/end date set yet — an Admin/Manager needs to add them before site visits can be tracked."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {staleOpenVisit && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Your check-in from {formatDate(staleOpenVisit.visitDate)} expired at midnight without a checkout and is now marked as a missed visit.</span>
              </div>
            )}

            {mapsHref && !todayVisit?.checkedOutAt && (isWithinWindow || todayVisit) && (
              <Button variant="outline" className="w-full" asChild>
                <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-4 w-4" />Get Directions to Site
                </a>
              </Button>
            )}

            {todayVisit?.checkedOutAt ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={todayVisit.checkInPhotoUrl} alt="Check-in" className="w-full max-w-xs rounded-lg border object-cover" />
                <div className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Only one visit per project per day — see you tomorrow</div>
                {todayVisit.workSummary && <p className="text-sm text-muted-foreground">{todayVisit.workSummary}</p>}
              </div>
            ) : !todayVisit ? (
              isWithinWindow && (
                <>
                  {checkInPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={checkInPhoto} alt="Check-in preview" className="w-full max-w-xs rounded-lg border object-cover" />
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tap to take a photo</span>
                      <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleCheckInPhoto} />
                    </label>
                  )}
                  {checkInError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{checkInError}</div>
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {checkInPhoto && (
                      <Button variant="outline" onClick={() => setCheckInPhoto(null)} disabled={checkingIn}>Retake</Button>
                    )}
                    <Button className="sm:flex-1" onClick={handleCheckIn} disabled={!checkInPhoto || checkingIn}>
                      {checkingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                      {checkingIn ? "Checking in..." : "Check In"}
                    </Button>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Today&apos;s Work *</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe the work done today, in your own words..."
                    value={workSummary}
                    onChange={(e) => setWorkSummary(e.target.value)}
                  />
                </div>
                {checkOutPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={checkOutPhoto} alt="Check-out preview" className="w-full max-w-xs rounded-lg border object-cover" />
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to take a photo</span>
                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleCheckOutPhoto} />
                  </label>
                )}
                {checkOutError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{checkOutError}</div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {checkOutPhoto && (
                    <Button variant="outline" onClick={() => setCheckOutPhoto(null)} disabled={checkingOut}>Retake</Button>
                  )}
                  <Button className="sm:flex-1" onClick={handleCheckOut} disabled={!checkOutPhoto || !workSummary.trim() || checkingOut}>
                    {checkingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    {checkingOut ? "Checking out..." : "Check Out"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Visit History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : visits.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No site visits recorded yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Photo</TableHead>
                  {canViewAll && <TableHead>Engineer</TableHead>}
                  <TableHead>Checked In</TableHead>
                  <TableHead>Checked Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((v) => {
                  const checkInStatus = siteStatus(v.checkInLatitude, v.checkInLongitude, projectLatitude, projectLongitude)
                  const durationMinutes = v.checkedOutAt
                    ? Math.round((new Date(v.checkedOutAt).getTime() - new Date(v.checkedInAt).getTime()) / 60000)
                    : null
                  const isToday = v.visitDate.slice(0, 10) === todayKey
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => setViewPhoto({ url: v.checkInPhotoUrl, title: `${v.engineer.firstName} ${v.engineer.lastName}`, subtitle: formatDateTime(v.checkedInAt) })}
                          className="block h-9 w-9 overflow-hidden rounded-full border hover:opacity-80"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={v.checkInPhotoUrl} alt="" className="h-full w-full object-cover" />
                        </button>
                      </TableCell>
                      {canViewAll && <TableCell className="font-medium">{v.engineer.firstName} {v.engineer.lastName}</TableCell>}
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(v.checkedInAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.checkedOutAt ? formatDateTime(v.checkedOutAt) : '—'}</TableCell>
                      <TableCell className="text-sm">
                        {durationMinutes != null ? (
                          formatDuration(durationMinutes)
                        ) : isToday ? (
                          <Badge variant="warning" className="text-[10px]">In Progress</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">No Checkout</Badge>
                        )}
                      </TableCell>
                      <TableCell><SiteBadge onSite={checkInStatus.onSite} /></TableCell>
                      <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground" title={v.workSummary || undefined}>
                        {v.workSummary || '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PhotoViewDialog
        photoUrl={viewPhoto?.url ?? null}
        title={viewPhoto?.title ?? ""}
        subtitle={viewPhoto?.subtitle}
        open={!!viewPhoto}
        onOpenChange={(open) => { if (!open) setViewPhoto(null) }}
      />
    </div>
  )
}
