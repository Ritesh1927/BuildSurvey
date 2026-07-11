"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar,
  Download,
  GanttChart,
  GripVertical,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  TableIcon,
  Users,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { ProjectCard } from "@/components/dashboard/project-card"

const mockProjects = [
  {
    id: "PRJ-001",
    name: "Worli Sky Residences Tower A",
    code: "PRJ-2024-001",
    clientName: "L&T Realty",
    status: "In Progress",
    type: "Residential Tower",
    managerName: "Amit Deshmukh",
    managerInitials: "AD",
    budget: 12500000,
    spent: 8125000,
    progress: 65,
    startDate: "2024-01-15",
    endDate: "2025-06-30",
    city: "Mumbai",
    floors: 42,
    area: 285000,
  },
  {
    id: "PRJ-002",
    name: "BKC Commercial Hub Phase 1",
    code: "PRJ-2024-002",
    clientName: "L&T Realty",
    status: "Planning",
    type: "Commercial Complex",
    managerName: "Priya Nair",
    managerInitials: "PN",
    budget: 8900000,
    spent: 1335000,
    progress: 15,
    startDate: "2024-06-01",
    endDate: "2026-03-31",
    city: "Mumbai",
    floors: 28,
    area: 450000,
  },
  {
    id: "PRJ-003",
    name: "Delhi-Meerut Expressway Section 3",
    code: "PRJ-2023-015",
    clientName: "NHAI",
    status: "In Progress",
    type: "Highway",
    managerName: "Ravi Shankar",
    managerInitials: "RS",
    budget: 45000000,
    spent: 31500000,
    progress: 70,
    startDate: "2023-04-01",
    endDate: "2025-03-31",
    city: "Ghaziabad",
    floors: 0,
    area: 3200000,
  },
  {
    id: "PRJ-004",
    name: "Prestige Lake Ridge Villas",
    code: "PRJ-2024-004",
    clientName: "Prestige Estates",
    status: "In Progress",
    type: "Residential Tower",
    managerName: "Neha Kulkarni",
    managerInitials: "NK",
    budget: 9800000,
    spent: 4116000,
    progress: 42,
    startDate: "2024-03-15",
    endDate: "2025-12-31",
    city: "Bangalore",
    floors: 18,
    area: 185000,
  },
  {
    id: "PRJ-005",
    name: "Adani Ahmedabad Airport Expansion",
    code: "PRJ-2023-020",
    clientName: "Adani Realty",
    status: "On Hold",
    type: "Infrastructure",
    managerName: "Vikram Desai",
    managerInitials: "VD",
    budget: 67000000,
    spent: 20100000,
    progress: 30,
    startDate: "2023-09-01",
    endDate: "2026-06-30",
    city: "Ahmedabad",
    floors: 0,
    area: 5600000,
  },
  {
    id: "PRJ-006",
    name: "Godrej Platinum Towers",
    code: "PRJ-2024-006",
    clientName: "Godrej Properties",
    status: "Completed",
    type: "Residential Tower",
    managerName: "Sanjay Kulkarni",
    managerInitials: "SK",
    budget: 7500000,
    spent: 7200000,
    progress: 100,
    startDate: "2023-01-10",
    endDate: "2024-06-30",
    city: "Pune",
    floors: 32,
    area: 220000,
  },
  {
    id: "PRJ-007",
    name: "Mumbai Metro Line 4 Extension",
    code: "PRJ-2023-025",
    clientName: "MMRC",
    status: "In Progress",
    type: "Infrastructure",
    managerName: "Deepak Nair",
    managerInitials: "DN",
    budget: 125000000,
    spent: 75000000,
    progress: 60,
    startDate: "2023-02-15",
    endDate: "2026-12-31",
    city: "Mumbai",
    floors: 0,
    area: 8900000,
  },
  {
    id: "PRJ-008",
    name: "Brigade Gateway Commercial Tower",
    code: "PRJ-2024-008",
    clientName: "Brigade Enterprises",
    status: "Planning",
    type: "Commercial Complex",
    managerName: "Arjun Reddy",
    managerInitials: "AR",
    budget: 11200000,
    spent: 560000,
    progress: 5,
    startDate: "2024-08-01",
    endDate: "2026-09-30",
    city: "Bangalore",
    floors: 35,
    area: 380000,
  },
  {
    id: "PRJ-009",
    name: "Chennai-Salem Expressway",
    code: "PRJ-2022-030",
    clientName: "NHAI",
    status: "Completed",
    type: "Highway",
    managerName: "Manish Gupta",
    managerInitials: "MG",
    budget: 78000000,
    spent: 74100000,
    progress: 100,
    startDate: "2022-06-01",
    endDate: "2024-08-31",
    city: "Salem",
    floors: 0,
    area: 4800000,
  },
  {
    id: "PRJ-010",
    name: "Oberoi Three Sixty West",
    code: "PRJ-2024-010",
    clientName: "Oberoi Realty",
    status: "In Progress",
    type: "Residential Tower",
    managerName: "Meera Rao",
    managerInitials: "MR",
    budget: 15800000,
    spent: 6320000,
    progress: 40,
    startDate: "2024-02-01",
    endDate: "2026-01-31",
    city: "Mumbai",
    floors: 55,
    area: 420000,
  },
  {
    id: "PRJ-011",
    name: "Ircon Bridge Reconstruction - Bihar",
    code: "PRJ-2023-035",
    clientName: "Ircon International",
    status: "In Progress",
    type: "Bridge",
    managerName: "Suresh Patil",
    managerInitials: "SP",
    budget: 34000000,
    spent: 23800000,
    progress: 70,
    startDate: "2023-05-01",
    endDate: "2025-04-30",
    city: "Patna",
    floors: 0,
    area: 120000,
  },
  {
    id: "PRJ-012",
    name: "DLF Cyber City Phase 2",
    code: "PRJ-2024-012",
    clientName: "DLF Limited",
    status: "Planning",
    type: "Commercial Complex",
    managerName: "Karan Bhatt",
    managerInitials: "KB",
    budget: 22000000,
    spent: 1100000,
    progress: 5,
    startDate: "2024-09-01",
    endDate: "2027-03-31",
    city: "Gurugram",
    floors: 40,
    area: 650000,
  },
  {
    id: "PRJ-013",
    name: "Tata Housing Primanti Floors",
    code: "PRJ-2023-040",
    clientName: "Tata Projects Ltd",
    status: "Completed",
    type: "Residential Tower",
    managerName: "Ashok Verma",
    managerInitials: "AV",
    budget: 6200000,
    spent: 5900000,
    progress: 100,
    startDate: "2023-03-01",
    endDate: "2024-09-30",
    city: "Gurugram",
    floors: 22,
    area: 165000,
  },
  {
    id: "PRJ-014",
    name: "HCC Selinium Tower B",
    code: "PRJ-2024-014",
    clientName: "Hindustan Construction Co",
    status: "Cancelled",
    type: "Residential Tower",
    managerName: "Rakesh Sachdev",
    managerInitials: "RS",
    budget: 5400000,
    spent: 810000,
    progress: 15,
    startDate: "2024-01-01",
    endDate: "2025-06-30",
    city: "Mumbai",
    floors: 28,
    area: 195000,
  },
]

const projectTypes = [...new Set(mockProjects.map((p) => p.type))].sort()
const projectStatuses = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"]
const managers = [...new Set(mockProjects.map((p) => p.managerName))].sort()

const kanbanColumns = [
  { status: "Planning", color: "bg-blue-50 border-blue-200", headerColor: "bg-blue-100 text-blue-800" },
  { status: "In Progress", color: "bg-emerald-50 border-emerald-200", headerColor: "bg-emerald-100 text-emerald-800" },
  { status: "On Hold", color: "bg-amber-50 border-amber-200", headerColor: "bg-amber-100 text-amber-800" },
  { status: "Completed", color: "bg-violet-50 border-violet-200", headerColor: "bg-violet-100 text-violet-800" },
  { status: "Cancelled", color: "bg-red-50 border-red-200", headerColor: "bg-red-100 text-red-800" },
]

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [managerFilter, setManagerFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || project.type === typeFilter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesManager = managerFilter === "all" || project.managerName === managerFilter

      return matchesSearch && matchesType && matchesStatus && matchesManager
    })
  }, [searchQuery, typeFilter, statusFilter, managerFilter])

  const totalPages = Math.ceil(filteredProjects.length / pageSize)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="Search projects..."
                className="w-[250px]"
                onSearch={setSearchQuery}
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={managerFilter} onValueChange={setManagerFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="All Managers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Managers</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager} value={manager}>
                      {manager}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
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
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs">{project.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{project.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {project.managerInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.managerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(project.budget)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-8">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(project.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GanttChart className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProjects.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-5 gap-4 overflow-x-auto">
              {kanbanColumns.map((column) => {
                const columnProjects = filteredProjects.filter(
                  (p) => p.status === column.status
                )
                return (
                  <div
                    key={column.status}
                    className={cn(
                      "min-w-[260px] rounded-lg border-2 p-3",
                      column.color
                    )}
                  >
                    <div className={cn("mb-3 rounded-md px-3 py-2 text-center", column.headerColor)}>
                      <h3 className="text-sm font-semibold">
                        {column.status}
                        <span className="ml-2 text-xs opacity-70">
                          ({columnProjects.length})
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {columnProjects.map((project) => (
                        <KanbanCard key={project.id} project={project} />
                      ))}
                      {columnProjects.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-8">
                          No projects
                        </p>
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

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
    Planning: "info",
    "In Progress": "success",
    "On Hold": "warning",
    Completed: "secondary",
    Cancelled: "destructive",
  }
  return (
    <Badge variant={variantMap[status] || "secondary"}>
      {status}
    </Badge>
  )
}

function KanbanCard({ project }: { project: typeof mockProjects[0] }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-background">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/projects/${project.id}`}
            className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2"
          >
            {project.name}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
        <p className="text-xs text-muted-foreground">{project.clientName}</p>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{project.city}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {project.managerInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-muted-foreground">{project.managerName}</span>
          </div>
          <span className="text-[11px] font-medium">{formatCurrency(project.budget)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
