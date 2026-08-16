'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  FolderKanban,
  ClipboardList,
  Users,
  Building2,
  FileText,
  ArrowUpRight,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'

interface ProjectRow {
  id: string
  name: string
  code: string
  status: string
  clientName: string
  budget: number | null
  createdAt: string
}

interface LeadRow {
  id: string
  name: string
  company: string | null
  status: string
  estimatedValue: number | null
  createdAt: string
}

interface SurveyRow {
  id: string
  title: string
  status: string
  projectName: string
  scheduledDate: string | null
  createdAt: string
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  PLANNING: { label: "Planning", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "success" },
  ON_HOLD: { label: "On Hold", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const STATUS_ICON_BG: Record<string, string> = {
  PLANNING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  IN_PROGRESS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ON_HOLD: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  COMPLETED: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const LEAD_STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  NEW: { label: "New", variant: "info" },
  CONTACTED: { label: "Contacted", variant: "secondary" },
  QUALIFIED: { label: "Qualified", variant: "warning" },
  PROPOSAL: { label: "Proposal Sent", variant: "warning" },
  NEGOTIATION: { label: "Negotiation", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "destructive" },
}

const SURVEY_STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}


// Fetches just the `total` count from an already-secured list endpoint —
// each one naturally respects the caller's real role/ownership scoping,
// so an Engineer's dashboard shows counts for what they can actually see,
// not a global number they have no access to. A 403 (role has no access
// to that module at all) is treated as "don't show this card", not an error.
async function fetchTotal(url: string): Promise<number | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.total === 'number' ? data.total : (data.pagination?.total ?? null)
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [counts, setCounts] = useState<{ projects: number | null; leads: number | null; surveys: number | null; clients: number | null }>({
    projects: null, leads: null, surveys: null, clients: null,
  })
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([])
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([])
  const [recentSurveys, setRecentSurveys] = useState<SurveyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [surveysLoading, setSurveysLoading] = useState(true)

  const userId = session?.user?.id
  // Whoever can be assigned a lead / a survey gets a dashboard section
  // showing their own, even if they hold no general read access to that
  // module at all (a custom role that's e.g. only leads:assignable).
  const showAssignedLeads = hasPermission(session?.user, 'leads:assignable')
  const showAssignedSurveys = hasPermission(session?.user, 'surveys:assignable')

  useEffect(() => {
    Promise.all([
      fetchTotal('/api/projects?limit=1'),
      fetchTotal('/api/leads?limit=1'),
      fetchTotal('/api/surveys?limit=1'),
      fetchTotal('/api/clients?limit=1'),
    ]).then(([projects, leads, surveys, clients]) => {
      setCounts({ projects, leads, surveys, clients })
    })

    fetch('/api/projects?limit=5')
      .then((res) => res.json())
      .then((data) => { if (data.success) setRecentProjects(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!userId || !showAssignedLeads) { setLeadsLoading(false); return }
    fetch(`/api/leads?assignedTo=${userId}&limit=5`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setRecentLeads(data.data) })
      .catch(() => {})
      .finally(() => setLeadsLoading(false))
  }, [userId, showAssignedLeads])

  useEffect(() => {
    if (!userId || !showAssignedSurveys) { setSurveysLoading(false); return }
    fetch('/api/surveys?limit=5')
      .then((res) => res.json())
      .then((data) => { if (data.success) setRecentSurveys(data.data) })
      .catch(() => {})
      .finally(() => setSurveysLoading(false))
  }, [userId, showAssignedSurveys])

  const today = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    []
  )

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const roleLabel = session?.user?.roleName
  const canCreateSurvey = hasPermission(session?.user, 'surveys:create')
  const canCreateProject = hasPermission(session?.user, 'projects:create')
  const canCreateInvoice = hasPermission(session?.user, 'quotations:create')

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">{today}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            {roleLabel && <p className="mt-1 text-sm text-blue-200/80">{roleLabel}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canCreateSurvey && (
              <Button asChild size="sm" className="bg-white text-slate-900 shadow-sm hover:bg-white/90">
                <Link href="/surveys/new"><ClipboardList className="mr-1 h-4 w-4" />New Survey</Link>
              </Button>
            )}
            {canCreateProject && (
              <Button asChild size="sm" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                <Link href="/projects/new"><FolderKanban className="mr-1 h-4 w-4" />New Project</Link>
              </Button>
            )}
            {canCreateInvoice && (
              <Button asChild size="sm" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                <Link href="/quotations/new"><FileText className="mr-1 h-4 w-4" />Create Invoice</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.projects !== null && (
          <StatCard icon={<FolderKanban className="h-5 w-5" />} label="Projects" value={counts.projects} color="info" />
        )}
        {counts.leads !== null && (
          <StatCard icon={<Users className="h-5 w-5" />} label="Leads" value={counts.leads} color="default" />
        )}
        {counts.surveys !== null && (
          <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Surveys" value={counts.surveys} color="warning" />
        )}
        {counts.clients !== null && (
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Clients" value={counts.clients} color="success" />
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">View All<ArrowUpRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : recentProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No projects yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentProjects.map((project) => {
                const statusMeta = STATUS_META[project.status] || { label: project.status, variant: 'secondary' as const }
                const iconBg = STATUS_ICON_BG[project.status] || "bg-muted text-muted-foreground"
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconBg)}>
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold break-words">{project.name}</p>
                          <Badge variant={statusMeta.variant} className="text-[10px] shrink-0">{statusMeta.label}</Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono">{project.code}</span>
                          <span>·</span>
                          <span className="truncate">{project.clientName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                      <div className="text-left sm:text-right">
                        {project.budget != null && <p className="text-sm font-semibold">{formatCurrency(project.budget)}</p>}
                        <p className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                          <Clock className="h-3 w-3" />{formatDate(project.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground sm:block" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showAssignedLeads && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Leads Assigned to Me</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leads">View All<ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : recentLeads.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No leads assigned to you yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentLeads.map((lead) => {
                  const statusMeta = LEAD_STATUS_META[lead.status] || { label: lead.status, variant: 'secondary' as const }
                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="group flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold break-words">{lead.name}</p>
                            <Badge variant={statusMeta.variant} className="text-[10px] shrink-0">{statusMeta.label}</Badge>
                          </div>
                          {lead.company && <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.company}</p>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                        <div className="text-left sm:text-right">
                          {lead.estimatedValue != null && <p className="text-sm font-semibold">{formatCurrency(lead.estimatedValue)}</p>}
                          <p className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                            <Clock className="h-3 w-3" />{formatDate(lead.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground sm:block" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAssignedSurveys && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Surveys Assigned to Me</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/surveys">View All<ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {surveysLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : recentSurveys.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No surveys assigned to you yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentSurveys.map((survey) => {
                  const statusMeta = SURVEY_STATUS_META[survey.status] || { label: survey.status, variant: 'secondary' as const }
                  return (
                    <Link
                      key={survey.id}
                      href={`/surveys/${survey.id}`}
                      className="group flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold break-words">{survey.title}</p>
                            <Badge variant={statusMeta.variant} className="text-[10px] shrink-0">{statusMeta.label}</Badge>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{survey.projectName}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                            <Clock className="h-3 w-3" />{survey.scheduledDate ? formatDate(survey.scheduledDate) : formatDate(survey.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground sm:block" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
