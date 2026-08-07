"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  ListChecks,
  AlertTriangle,
} from "lucide-react"

import { formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SiteVisitCalendarDialog } from "./site-visit-calendar-dialog"

type TodayStatus = "visited" | "in-progress" | "pending" | "holiday" | "outside-window"

interface EligibleProject {
  id: string
  name: string
  code: string
  clientName: string
  engineerId: string
  engineerName: string
  windowStart: string
  windowEnd: string
  eligibleSoFar: number
  visited: number
  missed: number
  todayStatus: TodayStatus
}

const TODAY_STATUS_META: Record<TodayStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  visited: { label: "Visited Today", variant: "success" },
  "in-progress": { label: "In Progress", variant: "warning" },
  pending: { label: "Pending Today", variant: "secondary" },
  holiday: { label: "Holiday", variant: "secondary" },
  "outside-window": { label: "Outside Window", variant: "secondary" },
}

export default function SiteVisitsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isOwnView = role === 'ENGINEER'

  const [projects, setProjects] = useState<EligibleProject[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarProject, setCalendarProject] = useState<{ id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-visits')
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const visitedToday = projects.filter((p) => p.todayStatus === 'visited').length
  const pendingToday = projects.filter((p) => p.todayStatus === 'pending' || p.todayStatus === 'in-progress').length
  const totalMissed = projects.reduce((sum, p) => sum + p.missed, 0)

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.engineerName.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Visits"
        description={isOwnView ? "Your assigned projects' site-visit schedules" : "Engineer site-visit schedules across all projects"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Site Visits" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Visited Today" value={visitedToday} icon={<CheckCircle2 className="h-6 w-6" />} color="success" />
        <StatCard label="Pending Today" value={pendingToday} icon={<Clock className="h-6 w-6" />} color="info" />
        <StatCard label="Total Missed Visits" value={totalMissed} icon={<AlertTriangle className="h-6 w-6" />} color="warning" />
      </div>

      <Card>
        <CardHeader>
          <SearchInput placeholder="Search by project, code, client, or engineer..." className="w-full sm:w-[300px]" onSearch={setSearchQuery} />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading site visits...</div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No site-visit-eligible projects</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                A project needs an assigned engineer and a start/end date before it shows up here.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No matches</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                No projects match &quot;{searchQuery}&quot; — try a different search.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  {!isOwnView && <TableHead>Engineer</TableHead>}
                  <TableHead>Window</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => {
                  const meta = TODAY_STATUS_META[p.todayStatus]
                  return (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => setCalendarProject({ id: p.id, name: p.name })}
                    >
                      <TableCell>
                        <Link
                          href={`/projects/${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.code}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.clientName}</TableCell>
                      {!isOwnView && <TableCell className="text-sm">{p.engineerName}</TableCell>}
                      <TableCell className="text-sm text-muted-foreground">{formatDate(p.windowStart)} – {formatDate(p.windowEnd)}</TableCell>
                      <TableCell className="text-sm">
                        {p.visited}/{p.eligibleSoFar} visited
                        {p.missed > 0 && <span className="ml-1.5 text-destructive font-medium">· {p.missed} missed</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant} className="gap-1">
                          {p.todayStatus === 'visited' && <CheckCircle2 className="h-3 w-3" />}
                          {(p.todayStatus === 'pending' || p.todayStatus === 'outside-window' || p.todayStatus === 'holiday') && <HelpCircle className="h-3 w-3" />}
                          {p.todayStatus === 'in-progress' && <Clock className="h-3 w-3" />}
                          {meta.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SiteVisitCalendarDialog
        projectId={calendarProject?.id ?? null}
        projectName={calendarProject?.name ?? ""}
        open={!!calendarProject}
        onOpenChange={(open) => { if (!open) setCalendarProject(null) }}
      />
    </div>
  )
}
