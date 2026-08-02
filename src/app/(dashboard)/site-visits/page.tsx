"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Navigation,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react"

import { formatDateTime, formatDuration } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PhotoViewDialog } from "@/components/shared/photo-view-dialog"

interface SiteVisit {
  id: string
  projectId: string
  projectName: string
  projectCode: string
  engineerId: string
  engineerName: string
  checkedInAt: string
  checkedOutAt: string | null
  checkInPhotoUrl: string
  checkOutPhotoUrl: string | null
  workSummary: string | null
  durationMinutes: number | null
}

export default function SiteVisitsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isOwnView = role === 'ENGINEER'

  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [viewPhoto, setViewPhoto] = useState<{ url: string | null; title: string; subtitle: string } | null>(null)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-visits?limit=100')
      const data = await res.json()
      if (data.success) setVisits(data.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVisits() }, [fetchVisits])

  const openCount = visits.filter((v) => !v.checkedOutAt).length
  const completedCount = visits.filter((v) => v.checkedOutAt).length
  const avgDuration = (() => {
    const durations = visits.map((v) => v.durationMinutes).filter((d): d is number => d != null)
    if (durations.length === 0) return null
    return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
  })()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Visits"
        description={isOwnView ? "Your ongoing site supervision visits" : "Engineer site supervision across all projects"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Site Visits" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Currently On Site" value={openCount} icon={<Navigation className="h-6 w-6" />} color="info" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 className="h-6 w-6" />} color="success" />
        <StatCard label="Avg. Visit Length" value={avgDuration != null ? formatDuration(avgDuration) : '—'} icon={<Clock className="h-6 w-6" />} color="default" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading site visits...</div>
          ) : visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No site visits yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isOwnView ? "Check in from a project's Site Visits tab to get started" : "Site visits open once a survey on a project has been approved"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Photo</TableHead>
                  <TableHead>Project</TableHead>
                  {!isOwnView && <TableHead>Engineer</TableHead>}
                  <TableHead>Checked In</TableHead>
                  <TableHead>Checked Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Work Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setViewPhoto({ url: v.checkInPhotoUrl, title: v.engineerName, subtitle: `${v.projectName} · ${formatDateTime(v.checkedInAt)}` })}
                        className="block h-9 w-9 overflow-hidden rounded-full border hover:opacity-80"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.checkInPhotoUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Link href={`/projects/${v.projectId}`} className="font-medium hover:text-primary transition-colors">
                        {v.projectName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{v.projectCode}</p>
                    </TableCell>
                    {!isOwnView && <TableCell className="text-sm">{v.engineerName}</TableCell>}
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(v.checkedInAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.checkedOutAt ? formatDateTime(v.checkedOutAt) : '—'}</TableCell>
                    <TableCell className="text-sm">
                      {v.durationMinutes != null ? formatDuration(v.durationMinutes) : <Badge variant="warning" className="text-[10px]">In Progress</Badge>}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground" title={v.workSummary || undefined}>
                      {v.workSummary || '—'}
                    </TableCell>
                  </TableRow>
                ))}
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
