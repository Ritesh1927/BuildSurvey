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
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectRow {
  id: string
  name: string
  code: string
  status: string
  clientName: string
  budget: number | null
  createdAt: string
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  PLANNING: { label: "Planning", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "success" },
  ON_HOLD: { label: "On Hold", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
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
  const [loading, setLoading] = useState(true)

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

  const today = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    []
  )

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const roleLabel = session?.user?.role?.replace(/_/g, ' ')

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
            <Button asChild size="sm" className="bg-white text-slate-900 shadow-sm hover:bg-white/90">
              <Link href="/surveys/new"><ClipboardList className="mr-1 h-4 w-4" />New Survey</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <Link href="/projects/new"><FolderKanban className="mr-1 h-4 w-4" />New Project</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              <Link href="/quotations/new"><FileText className="mr-1 h-4 w-4" />Create Quotation</Link>
            </Button>
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
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const statusMeta = STATUS_META[project.status] || { label: project.status, variant: 'secondary' as const }
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <Badge variant={statusMeta.variant} className="text-[10px] shrink-0">{statusMeta.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{project.code}</span>
                        <span>·</span>
                        <span className="truncate">{project.clientName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3 text-xs text-muted-foreground">
                      {project.budget != null && <span>{formatCurrency(project.budget)}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(project.createdAt)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
