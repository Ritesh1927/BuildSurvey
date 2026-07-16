"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Plus, Search, Eye, Trash2,
  MoreHorizontal, Calendar, ClipboardCheck, FileText,
  ChevronLeft, ChevronRight,
  CheckSquare, Clock, X
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { showSuccess, showError } from "@/components/ui/toast"

interface SurveyRow {
  id: string
  title: string
  type: string
  status: string
  scheduledDate: string | null
  gpsLatitude: number | null
  gpsLongitude: number | null
  projectId: string
  projectName: string
  engineerId: string | null
  engineerName: string
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}

const TYPE_META: Record<string, string> = {
  INITIAL: "Initial", DETAILED: "Detailed", FOLLOW_UP: "Follow-up", FINAL: "Final", AS_BUILT: "As-Built",
}

const TYPE_COLORS: Record<string, string> = {
  INITIAL: "bg-blue-100 text-blue-800 border-blue-200",
  DETAILED: "bg-purple-100 text-purple-800 border-purple-200",
  FOLLOW_UP: "bg-amber-100 text-amber-800 border-amber-200",
  FINAL: "bg-emerald-100 text-emerald-800 border-emerald-200",
  AS_BUILT: "bg-cyan-100 text-cyan-800 border-cyan-200",
}

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 20, 25]
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function SurveysPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  const [surveys, setSurveys] = useState<SurveyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/surveys?limit=200${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load surveys')
        setSurveys([])
        return
      }
      setSurveys(data.data)
    } catch {
      setError('Network error while loading surveys')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey) => {
      const matchesStatus = statusFilter === "all" || survey.status === statusFilter
      const matchesType = typeFilter === "all" || survey.type === typeFilter
      return matchesStatus && matchesType
    })
  }, [surveys, statusFilter, typeFilter])

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage)
  const paginatedSurveys = filteredSurveys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }
  const hasActiveFilters = !!searchQuery || statusFilter !== "all" || typeFilter !== "all"

  const handleDelete = async (survey: SurveyRow) => {
    if (!confirm(`Delete survey "${survey.title}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete survey')
        return
      }
      showSuccess('Survey deleted')
      setSurveys((prev) => prev.filter((s) => s.id !== survey.id))
    } catch {
      showError('Network error while deleting survey')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Surveys"
        description="Manage and track all construction site surveys"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys" },
        ]}
        actions={
          role && CREATE_ROLES.includes(role) ? (
            <Link href="/surveys/new">
              <Button><Plus className="h-4 w-4 mr-2" />New Survey</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ClipboardCheck className="h-6 w-6" />} label="Total Surveys" value={surveys.length} color="default" />
        <StatCard icon={<Clock className="h-6 w-6" />} label="In Progress" value={surveys.filter(s => s.status === "IN_PROGRESS").length} color="info" />
        <StatCard icon={<FileText className="h-6 w-6" />} label="Pending Review" value={surveys.filter(s => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW").length} color="warning" />
        <StatCard icon={<CheckSquare className="h-6 w-6" />} label="Approved" value={surveys.filter(s => s.status === "APPROVED").length} color="success" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_META).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />Clear Filters
              </Button>
            )}
            <div className="text-sm text-muted-foreground">{filteredSurveys.length} of {surveys.length} surveys</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading surveys...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : filteredSurveys.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="h-6 w-6" />}
              title="No surveys found"
              description="No surveys match your current filters. Try adjusting your search criteria."
              action={hasActiveFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>GPS</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.map((survey) => {
                    const statusMeta = STATUS_META[survey.status] || { label: survey.status, variant: 'secondary' as const }
                    const hasGps = survey.gpsLatitude != null && survey.gpsLongitude != null
                    return (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <Link href={`/surveys/${survey.id}`} className="font-medium text-foreground hover:underline">
                            {survey.title}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm">{survey.projectName}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[survey.type] || "bg-gray-100 text-gray-800"}`}>
                            {TYPE_META[survey.type] || survey.type}
                          </span>
                        </TableCell>
                        <TableCell><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></TableCell>
                        <TableCell>
                          {survey.engineerName !== 'Unassigned' ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">
                                  {survey.engineerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{survey.engineerName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {survey.scheduledDate ? new Date(survey.scheduledDate).toLocaleDateString('en-IN') : '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasGps ? (
                            <div className="flex items-center gap-1">
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                              <span className="text-xs text-emerald-600">Set</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/surveys/${survey.id}`}><Eye className="h-4 w-4 mr-2" />View Details</Link>
                              </DropdownMenuItem>
                              {role && DELETE_ROLES.includes(role) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(survey)}>
                                    <Trash2 className="h-4 w-4 mr-2" />Delete
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

              <div className="flex items-center justify-between border-t p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}>
                    <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredSurveys.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSurveys.length)} of {filteredSurveys.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
