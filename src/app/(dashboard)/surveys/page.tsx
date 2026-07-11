"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Plus, Search, MapPin, Eye, Edit, Trash2, Copy,
  MoreHorizontal, Calendar, ClipboardCheck, FileText,
  Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckSquare, CircleDot, Clock, Users, Timer, X
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Survey {
  id: string
  title: string
  project: string
  type: string
  status: string
  engineer: { name: string; avatar: string; initials: string } | null
  scheduledDate: string
  hasGps: boolean
  duration: string | null
  priority: string
}

const mockSurveys: Survey[] = [
  { id: "SUR-001", title: "Foundation Inspection - Phase 1", project: "Riverside Tower Complex", type: "Initial", status: "completed", engineer: { name: "Rajesh Kumar", avatar: "", initials: "RK" }, scheduledDate: "2026-07-01", hasGps: true, duration: "4h 30m", priority: "high" },
  { id: "SUR-002", title: "Electrical Systems Audit", project: "Green Valley Office Park", type: "Detailed", status: "in_progress", engineer: { name: "Priya Sharma", avatar: "", initials: "PS" }, scheduledDate: "2026-07-05", hasGps: true, duration: null, priority: "medium" },
  { id: "SUR-003", title: "Plumbing Network Assessment", project: "Metro Residential Towers", type: "Follow-up", status: "pending", engineer: { name: "Amit Patel", avatar: "", initials: "AP" }, scheduledDate: "2026-07-10", hasGps: false, duration: null, priority: "low" },
  { id: "SUR-004", title: "Fire Safety Compliance Check", project: "Downtown Mall Expansion", type: "Final", status: "approved", engineer: { name: "Neha Gupta", avatar: "", initials: "NG" }, scheduledDate: "2026-06-28", hasGps: true, duration: "3h 15m", priority: "high" },
  { id: "SUR-005", title: "Environmental Impact Survey", project: "Lakeside Villa Community", type: "Initial", status: "draft", engineer: null, scheduledDate: "2026-07-15", hasGps: false, duration: null, priority: "low" },
  { id: "SUR-006", title: "Interior Finishing Quality Check", project: "Riverside Tower Complex", type: "As-Built", status: "in_progress", engineer: { name: "Rajesh Kumar", avatar: "", initials: "RK" }, scheduledDate: "2026-07-08", hasGps: true, duration: null, priority: "medium" },
  { id: "SUR-007", title: "Structural Integrity Assessment", project: "Heritage Building Renovation", type: "Detailed", status: "under_review", engineer: { name: "Suresh Reddy", avatar: "", initials: "SR" }, scheduledDate: "2026-07-02", hasGps: true, duration: "6h 00m", priority: "critical" },
  { id: "SUR-008", title: "HVAC System Inspection", project: "Green Valley Office Park", type: "Follow-up", status: "assigned", engineer: { name: "Priya Sharma", avatar: "", initials: "PS" }, scheduledDate: "2026-07-12", hasGps: false, duration: null, priority: "medium" },
  { id: "SUR-009", title: "Site Drainage Assessment", project: "Metro Residential Towers", type: "Initial", status: "completed", engineer: { name: "Amit Patel", avatar: "", initials: "AP" }, scheduledDate: "2026-06-25", hasGps: true, duration: "2h 45m", priority: "low" },
  { id: "SUR-010", title: "Elevator Installation Survey", project: "Downtown Mall Expansion", type: "As-Built", status: "assigned", engineer: { name: "Neha Gupta", avatar: "", initials: "NG" }, scheduledDate: "2026-07-14", hasGps: false, duration: null, priority: "high" },
  { id: "SUR-011", title: "Roofing Material Inspection", project: "Heritage Building Renovation", type: "Detailed", status: "in_progress", engineer: { name: "Suresh Reddy", avatar: "", initials: "SR" }, scheduledDate: "2026-07-06", hasGps: true, duration: null, priority: "medium" },
  { id: "SUR-012", title: "Water Supply Network Audit", project: "Lakeside Villa Community", type: "Follow-up", status: "pending", engineer: { name: "Rajesh Kumar", avatar: "", initials: "RK" }, scheduledDate: "2026-07-18", hasGps: false, duration: null, priority: "low" },
  { id: "SUR-013", title: "Parking Structure Assessment", project: "Riverside Tower Complex", type: "Final", status: "completed", engineer: { name: "Priya Sharma", avatar: "", initials: "PS" }, scheduledDate: "2026-06-20", hasGps: true, duration: "5h 15m", priority: "high" },
  { id: "SUR-014", title: "Storm Water Management Survey", project: "Green Valley Office Park", type: "Initial", status: "rejected", engineer: { name: "Amit Patel", avatar: "", initials: "AP" }, scheduledDate: "2026-07-03", hasGps: true, duration: "3h 00m", priority: "medium" },
  { id: "SUR-015", title: "Facade Inspection - East Wing", project: "Downtown Mall Expansion", type: "Detailed", status: "draft", engineer: null, scheduledDate: "2026-07-20", hasGps: false, duration: null, priority: "low" },
  { id: "SUR-016", title: "Landscaping Irrigation Survey", project: "Lakeside Villa Community", type: "As-Built", status: "scheduled", engineer: { name: "Neha Gupta", avatar: "", initials: "NG" }, scheduledDate: "2026-07-22", hasGps: false, duration: null, priority: "low" },
  { id: "SUR-017", title: "Seismic Resistance Testing", project: "Metro Residential Towers", type: "Initial", status: "in_progress", engineer: { name: "Suresh Reddy", avatar: "", initials: "SR" }, scheduledDate: "2026-07-09", hasGps: true, duration: null, priority: "critical" },
  { id: "SUR-018", title: "Fire Suppression System Audit", project: "Downtown Mall Expansion", type: "Final", status: "approved", engineer: { name: "Rajesh Kumar", avatar: "", initials: "RK" }, scheduledDate: "2026-06-30", hasGps: true, duration: "2h 30m", priority: "high" },
  { id: "SUR-019", title: "Solar Panel Installation Survey", project: "Green Valley Office Park", type: "Initial", status: "completed", engineer: { name: "Priya Sharma", avatar: "", initials: "PS" }, scheduledDate: "2026-06-22", hasGps: true, duration: "3h 45m", priority: "medium" },
  { id: "SUR-020", title: "Accessibility Compliance Check", project: "Riverside Tower Complex", type: "Final", status: "in_progress", engineer: { name: "Amit Patel", avatar: "", initials: "AP" }, scheduledDate: "2026-07-11", hasGps: true, duration: null, priority: "high" },
  { id: "SUR-021", title: "Basement Waterproofing Survey", project: "Metro Residential Towers", type: "Follow-up", status: "under_review", engineer: { name: "Neha Gupta", avatar: "", initials: "NG" }, scheduledDate: "2026-07-04", hasGps: true, duration: "4h 00m", priority: "medium" },
  { id: "SUR-022", title: "Compound Wall & Gate Assessment", project: "Lakeside Villa Community", type: "Detailed", status: "completed", engineer: { name: "Suresh Reddy", avatar: "", initials: "SR" }, scheduledDate: "2026-06-18", hasGps: true, duration: "2h 00m", priority: "low" },
]

const typeColors: Record<string, string> = {
  Initial: "bg-blue-100 text-blue-800 border-blue-200",
  Detailed: "bg-purple-100 text-purple-800 border-purple-200",
  "Follow-up": "bg-amber-100 text-amber-800 border-amber-200",
  Final: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "As-Built": "bg-cyan-100 text-cyan-800 border-cyan-200",
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
}

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 20, 25]

export default function SurveysPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [engineerFilter, setEngineerFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const projects = [...new Set(mockSurveys.map(s => s.project))]
  const engineers = [...new Set(mockSurveys.filter(s => s.engineer).map(s => s.engineer!.name))]

  const filteredSurveys = useMemo(() => {
    return mockSurveys.filter((survey) => {
      const matchesSearch =
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || survey.status === statusFilter
      const matchesType = typeFilter === "all" || survey.type === typeFilter
      const matchesProject = projectFilter === "all" || survey.project === projectFilter
      const matchesEngineer = engineerFilter === "all" || survey.engineer?.name === engineerFilter
      const matchesDateFrom = !dateFrom || survey.scheduledDate >= dateFrom
      const matchesDateTo = !dateTo || survey.scheduledDate <= dateTo
      return matchesSearch && matchesStatus && matchesType && matchesProject && matchesEngineer && matchesDateFrom && matchesDateTo
    })
  }, [searchQuery, statusFilter, typeFilter, projectFilter, engineerFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage)
  const paginatedSurveys = filteredSurveys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedSurveys.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedSurveys.map(s => s.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setProjectFilter("all")
    setEngineerFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all" || projectFilter !== "all" || engineerFilter !== "all" || dateFrom || dateTo

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
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/surveys/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Survey
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<ClipboardCheck className="h-6 w-6" />}
          label="Total Surveys"
          value={mockSurveys.length}
          color="default"
          change={8}
          trend="up"
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          label="In Progress"
          value={mockSurveys.filter(s => s.status === "in_progress").length}
          color="info"
          change={12}
          trend="up"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Pending Approval"
          value={mockSurveys.filter(s => s.status === "pending" || s.status === "under_review").length}
          color="warning"
          change={-5}
          trend="down"
        />
        <StatCard
          icon={<CheckSquare className="h-6 w-6" />}
          label="Completed This Month"
          value={mockSurveys.filter(s => s.status === "completed" || s.status === "approved").length}
          color="success"
          change={15}
          trend="up"
        />
        <StatCard
          icon={<Timer className="h-6 w-6" />}
          label="Avg. Duration"
          value="3h 52m"
          color="default"
          change={-8}
          trend="down"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
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
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Initial">Initial</SelectItem>
                  <SelectItem value="Detailed">Detailed</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="As-Built">As-Built</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={(v) => { setProjectFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={engineerFilter} onValueChange={(v) => { setEngineerFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Engineer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engineers</SelectItem>
                  {engineers.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }} className="w-[150px]" />
                <span className="text-sm text-muted-foreground">to</span>
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }} className="w-[150px]" />
              </div>
              <div className="flex-1" />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                {filteredSurveys.length} of {mockSurveys.length} surveys
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3 animate-in slide-in-from-top-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Selected
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {filteredSurveys.length === 0 ? (
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
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.length === paginatedSurveys.length && paginatedSurveys.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>GPS</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.map((survey) => (
                    <TableRow key={survey.id} className={selectedIds.includes(survey.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(survey.id)}
                          onCheckedChange={() => toggleSelect(survey.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${priorityColors[survey.priority]}`} />
                          <div>
                            <Link href={`/surveys/${survey.id}`} className="font-medium text-foreground hover:underline">
                              {survey.title}
                            </Link>
                            <div className="text-xs text-muted-foreground">{survey.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm">{survey.project}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${typeColors[survey.type] || "bg-gray-100 text-gray-800"}`}>
                          {survey.type}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={survey.status} /></TableCell>
                      <TableCell>
                        {survey.engineer ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={survey.engineer.avatar} alt={survey.engineer.name} />
                              <AvatarFallback className="text-xs">{survey.engineer.initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{survey.engineer.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {survey.scheduledDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        {survey.hasGps ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-emerald-600">Set</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {survey.duration ? (
                          <span className="text-sm font-medium">{survey.duration}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/surveys/${survey.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Survey
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
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
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSurveys.length)} of {filteredSurveys.length}
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
