"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Download,
  GanttChart,
  LayoutGrid,
  MapPin,
  MoreHorizontal,
  Plus,
  TableIcon,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"
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

const kanbanStatuses = Object.keys(STATUS_META)
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function ProjectsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
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
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="h-8">
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="h-8">
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            {role && CREATE_ROLES.includes(role) && (
              <Link href="/projects/new">
                <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
              </Link>
            )}
          </div>
        }
      />

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
          ) : viewMode === "table" ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="w-[150px]">Progress</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => {
                    const statusMeta = STATUS_META[project.status] || { label: project.status, variant: "secondary" as const }
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-xs">{project.code}</TableCell>
                        <TableCell>
                          <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors">
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{project.clientName}</TableCell>
                        <TableCell><Badge variant="outline">{TYPE_META[project.type] || project.type}</Badge></TableCell>
                        <TableCell><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {project.managerName === 'Unassigned' ? '—' : project.managerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{project.managerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {project.budget != null ? formatCurrency(project.budget) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium w-8">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : '—'}
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
          ) : (
            <div className="grid grid-cols-5 gap-4 overflow-x-auto">
              {kanbanStatuses.map((status) => {
                const meta = STATUS_META[status]
                const columnProjects = filteredProjects.filter((p) => p.status === status)
                return (
                  <div key={status} className="min-w-[260px] rounded-lg border-2 p-3 bg-muted/30">
                    <div className="mb-3 rounded-md px-3 py-2 text-center bg-muted">
                      <h3 className="text-sm font-semibold">
                        {meta.label}<span className="ml-2 text-xs opacity-70">({columnProjects.length})</span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {columnProjects.map((project) => (
                        <KanbanCard key={project.id} project={project} />
                      ))}
                      {columnProjects.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-8">No projects</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KanbanCard({ project }: { project: ProjectRow }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background">
      <CardContent className="p-3 space-y-2">
        <Link href={`/projects/${project.id}`} className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2">
          {project.name}
        </Link>
        <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
        <p className="text-xs text-muted-foreground">{project.clientName}</p>
        {project.city && (
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{project.city}</span>
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-[11px] text-muted-foreground">{project.managerName}</span>
          <span className="text-[11px] font-medium">{project.budget != null ? formatCurrency(project.budget) : '—'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
