"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  GanttChart,
  MoreHorizontal,
  PauseCircle,
  Plus,
  TrendingUp,
  XCircle,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/ui/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { showSuccess, showError } from "@/components/ui/toast"

interface ProjectRow {
  id: string
  name: string
  code: string
  type: string
  status: string
  budget: number | null
  actualCost: number
  progress: number
  startDate: string | null
  city: string | null
  clientId: string
  clientName: string
  managerId: string | null
  managerName: string
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  PLANNING: { label: "Planning", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "success" },
  ON_HOLD: { label: "On Hold", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const TYPE_META: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  INDUSTRIAL: "Industrial",
  INFRASTRUCTURE: "Infrastructure",
  INTERIOR: "Interior",
  MEP: "MEP",
  RENOVATION: "Renovation",
}

const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function ProjectsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [managerFilter, setManagerFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects?limit=200${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load projects')
        setProjects([])
        return
      }
      setProjects(data.data)
    } catch {
      setError('Network error while loading projects')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const managers = useMemo(
    () => [...new Set(projects.map((p) => p.managerName).filter((m) => m && m !== 'Unassigned'))].sort(),
    [projects]
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesType = typeFilter === "all" || project.type === typeFilter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesManager = managerFilter === "all" || project.managerName === managerFilter
      return matchesType && matchesStatus && matchesManager
    })
  }, [projects, typeFilter, statusFilter, managerFilter])

  const projectStats = {
    total: projects.length,
    planning: projects.filter((p) => p.status === 'PLANNING').length,
    inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    onHold: projects.filter((p) => p.status === 'ON_HOLD').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    cancelled: projects.filter((p) => p.status === 'CANCELLED').length,
  }

  const totalPages = Math.ceil(filteredProjects.length / pageSize)
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDelete = async (project: ProjectRow) => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete project')
        return
      }
      showSuccess('Project deleted')
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch {
      showError('Network error while deleting project')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Track and manage all construction projects across clients"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {role && CREATE_ROLES.includes(role) && (
              <Link href="/projects/new">
                <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Building2 className="h-6 w-6" />} label="Total Projects" value={projectStats.total} color="info" />
        <StatCard icon={<ClipboardList className="h-6 w-6" />} label="Planning" value={projectStats.planning} color="default" />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="In Progress" value={projectStats.inProgress} color="success" />
        <StatCard icon={<PauseCircle className="h-6 w-6" />} label="On Hold" value={projectStats.onHold} color="warning" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label="Completed" value={projectStats.completed} color="success" />
        <StatCard icon={<XCircle className="h-6 w-6" />} label="Cancelled" value={projectStats.cancelled} color="danger" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput placeholder="Search projects..." className="w-[250px]" onSearch={setSearchQuery} />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(TYPE_META).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {managers.length > 0 && (
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                  <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Managers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Managers</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading projects...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => {
                    const statusMeta = STATUS_META[project.status] || { label: project.status, variant: "secondary" as const }
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors">
                            {project.name}
                          </Link>
                          <p className="font-mono text-xs text-muted-foreground">{project.code}</p>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm">{project.clientName}</TableCell>
                        <TableCell><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {project.managerName === 'Unassigned' ? '—' : project.managerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-[120px] truncate text-sm">{project.managerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {project.budget != null ? formatCurrency(project.budget) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {role && DELETE_ROLES.includes(role) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project)}>
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GanttChart className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}

              <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredProjects.length} pageSize={pageSize} onPageChange={setCurrentPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
