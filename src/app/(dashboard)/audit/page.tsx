"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Settings,
  Trash2,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  Pencil,
  Plus,
  Eye,
  Shield,
  Clock,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { cn, formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/ui/page-header"
import { Pagination } from "@/components/ui/pagination"
import { DatePicker } from "@/components/ui/date-picker"

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  userInitials: string
  action: string
  entityType: string
  entityId: string
  description: string
  ipAddress: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

const actionColors: Record<string, string> = {
  Created: "bg-emerald-100 text-emerald-800",
  Updated: "bg-blue-100 text-blue-800",
  Approved: "bg-violet-100 text-violet-800",
  Deleted: "bg-red-100 text-red-800",
  "Logged In": "bg-teal-100 text-teal-800",
  "Logged Out": "bg-gray-100 text-gray-800",
  Rejected: "bg-red-100 text-red-800",
  Downloaded: "bg-amber-100 text-amber-800",
  Uploaded: "bg-cyan-100 text-cyan-800",
  Shared: "bg-indigo-100 text-indigo-800",
  Commented: "bg-pink-100 text-pink-800",
  Exported: "bg-orange-100 text-orange-800",
  "Password Changed": "bg-rose-100 text-rose-800",
}

const actionIcons: Record<string, React.ReactNode> = {
  Created: <Plus className="h-3.5 w-3.5" />,
  Updated: <Pencil className="h-3.5 w-3.5" />,
  Approved: <CheckCircle className="h-3.5 w-3.5" />,
  Deleted: <Trash2 className="h-3.5 w-3.5" />,
  "Logged In": <LogIn className="h-3.5 w-3.5" />,
  "Logged Out": <LogOut className="h-3.5 w-3.5" />,
  Rejected: <XCircle className="h-3.5 w-3.5" />,
  Downloaded: <Download className="h-3.5 w-3.5" />,
  Uploaded: <FileText className="h-3.5 w-3.5" />,
  Shared: <User className="h-3.5 w-3.5" />,
  Commented: <FileText className="h-3.5 w-3.5" />,
  Exported: <Download className="h-3.5 w-3.5" />,
  "Password Changed": <Shield className="h-3.5 w-3.5" />,
}

const entityTypeColors: Record<string, string> = {
  Project: "bg-blue-50 text-blue-700",
  Survey: "bg-emerald-50 text-emerald-700",
  Report: "bg-violet-50 text-violet-700",
  Document: "bg-amber-50 text-amber-700",
  User: "bg-rose-50 text-rose-700",
  Client: "bg-teal-50 text-teal-700",
  Invoice: "bg-indigo-50 text-indigo-700",
  System: "bg-gray-50 text-gray-700",
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-07-11T16:30:00",
    user: "Saurabh Patil",
    userInitials: "SP",
    action: "Approved",
    entityType: "Report",
    entityId: "RPT-2026-001",
    description: "Approved Topographical Survey Report for Worli Sky Residences",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AUD-002",
    timestamp: "2026-07-11T15:45:00",
    user: "Raj Mehta",
    userInitials: "RM",
    action: "Uploaded",
    entityType: "Report",
    entityId: "RPT-2026-001",
    description: "Uploaded Topographical Survey Report for Worli Sky Residences",
    ipAddress: "192.168.1.112",
  },
  {
    id: "AUD-003",
    timestamp: "2026-07-11T14:20:00",
    user: "Priya Nair",
    userInitials: "PN",
    action: "Updated",
    entityType: "Project",
    entityId: "PRJ-002",
    description: "Updated project progress from 12% to 15%",
    ipAddress: "192.168.1.108",
    oldValues: { progress: 12, status: "Planning" },
    newValues: { progress: 15, status: "Planning" },
  },
  {
    id: "AUD-004",
    timestamp: "2026-07-11T13:10:00",
    user: "Amit Kumar",
    userInitials: "AK",
    action: "Created",
    entityType: "Survey",
    entityId: "SRV-042",
    description: "Created new Pre-Construction Survey assignment for Sunrise Enclave",
    ipAddress: "192.168.1.115",
    newValues: { title: "Pre-Construction Survey", project: "Sunrise Enclave", type: "Topographical" },
  },
  {
    id: "AUD-005",
    timestamp: "2026-07-11T11:55:00",
    user: "Neha Gupta",
    userInitials: "NG",
    action: "Downloaded",
    entityType: "Document",
    entityId: "DOC-001",
    description: "Downloaded Architectural Drawing - Floor Plan A3",
    ipAddress: "192.168.1.118",
  },
  {
    id: "AUD-006",
    timestamp: "2026-07-11T10:30:00",
    user: "Saurabh Patil",
    userInitials: "SP",
    action: "Logged In",
    entityType: "System",
    entityId: "SESSION-89234",
    description: "Successful login from Chrome on Windows 11",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AUD-007",
    timestamp: "2026-07-11T09:15:00",
    user: "Vikram Desai",
    userInitials: "VD",
    action: "Updated",
    entityType: "Survey",
    entityId: "SRV-038",
    description: "Updated survey status from In Progress to Completed",
    ipAddress: "192.168.1.120",
    oldValues: { status: "In Progress" },
    newValues: { status: "Completed" },
  },
  {
    id: "AUD-008",
    timestamp: "2026-07-10T17:45:00",
    user: "Meera Rao",
    userInitials: "MR",
    action: "Created",
    entityType: "Report",
    entityId: "RPT-2026-013",
    description: "Created Quality Inspection Report for Q2 FY2026-27",
    ipAddress: "192.168.1.122",
  },
  {
    id: "AUD-009",
    timestamp: "2026-07-10T16:20:00",
    user: "Sanjay Kulkarni",
    userInitials: "SK",
    action: "Commented",
    entityType: "Document",
    entityId: "DOC-002",
    description: "Added review comment on Structural Layout drawing",
    ipAddress: "192.168.1.125",
  },
  {
    id: "AUD-010",
    timestamp: "2026-07-10T15:00:00",
    user: "Deepak Nair",
    userInitials: "DN",
    action: "Shared",
    entityType: "Report",
    entityId: "RPT-2026-009",
    description: "Shared Project Summary with external consultant",
    ipAddress: "192.168.1.128",
  },
  {
    id: "AUD-011",
    timestamp: "2026-07-10T14:30:00",
    user: "Priya Nair",
    userInitials: "PN",
    action: "Approved",
    entityType: "Survey",
    entityId: "SRV-035",
    description: "Approved Foundation Inspection Survey for Metro Residency",
    ipAddress: "192.168.1.108",
  },
  {
    id: "AUD-012",
    timestamp: "2026-07-10T12:15:00",
    user: "Amit Deshmukh",
    userInitials: "AD",
    action: "Created",
    entityType: "Project",
    entityId: "PRJ-015",
    description: "Created new project: Brigade Gateway Commercial Tower",
    ipAddress: "192.168.1.130",
    newValues: { name: "Brigade Gateway Commercial Tower", client: "Brigade Enterprises", budget: 11200000 },
  },
  {
    id: "AUD-013",
    timestamp: "2026-07-10T11:00:00",
    user: "Raj Mehta",
    userInitials: "RM",
    action: "Exported",
    entityType: "Report",
    entityId: "RPT-2026-010",
    description: "Exported Bridge Load Testing Report to PDF",
    ipAddress: "192.168.1.112",
  },
  {
    id: "AUD-014",
    timestamp: "2026-07-10T09:45:00",
    user: "Neha Gupta",
    userInitials: "NG",
    action: "Updated",
    entityType: "Client",
    entityId: "CLI-005",
    description: "Updated client contact information for Prestige Estates",
    ipAddress: "192.168.1.118",
    oldValues: { phone: "+91 98765 43210" },
    newValues: { phone: "+91 98765 43211" },
  },
  {
    id: "AUD-015",
    timestamp: "2026-07-09T17:30:00",
    user: "Saurabh Patil",
    userInitials: "SP",
    action: "Approved",
    entityType: "Invoice",
    entityId: "INV-2026-042",
    description: "Approved Invoice for Worli Sky Residences - July 2026",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AUD-016",
    timestamp: "2026-07-09T16:10:00",
    user: "Vikram Desai",
    userInitials: "VD",
    action: "Deleted",
    entityType: "Document",
    entityId: "DOC-015",
    description: "Deleted outdated site layout drawing (superseded by revision)",
    ipAddress: "192.168.1.120",
    oldValues: { name: "Site Layout - Old Version.dwg", version: "1.0" },
  },
  {
    id: "AUD-017",
    timestamp: "2026-07-09T14:50:00",
    user: "Amit Kumar",
    userInitials: "AK",
    action: "Created",
    entityType: "Survey",
    entityId: "SRV-041",
    description: "Created Material Quality Check survey for Greenfield Estates",
    ipAddress: "192.168.1.115",
  },
  {
    id: "AUD-018",
    timestamp: "2026-07-09T13:25:00",
    user: "Meera Rao",
    userInitials: "MR",
    action: "Rejected",
    entityType: "Report",
    entityId: "RPT-2026-011",
    description: "Rejected BOQ Update - requires cost reconciliation",
    ipAddress: "192.168.1.122",
  },
  {
    id: "AUD-019",
    timestamp: "2026-07-09T11:40:00",
    user: "Priya Nair",
    userInitials: "PN",
    action: "Updated",
    entityType: "Project",
    entityId: "PRJ-007",
    description: "Updated Mumbai Metro Line 4 progress from 58% to 60%",
    ipAddress: "192.168.1.108",
    oldValues: { progress: 58 },
    newValues: { progress: 60 },
  },
  {
    id: "AUD-020",
    timestamp: "2026-07-09T10:15:00",
    user: "Sanjay Kulkarni",
    userInitials: "SK",
    action: "Downloaded",
    entityType: "Document",
    entityId: "DOC-009",
    description: "Downloaded Main Construction Contract for review",
    ipAddress: "192.168.1.125",
  },
  {
    id: "AUD-021",
    timestamp: "2026-07-09T09:00:00",
    user: "Saurabh Patil",
    userInitials: "SP",
    action: "Logged In",
    entityType: "System",
    entityId: "SESSION-89156",
    description: "Successful login from Chrome on Windows 11",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AUD-022",
    timestamp: "2026-07-08T17:55:00",
    user: "Deepak Nair",
    userInitials: "DN",
    action: "Uploaded",
    entityType: "Document",
    entityId: "DOC-018",
    description: "Uploaded Client Communication - Phase 2 Approval letter",
    ipAddress: "192.168.1.128",
  },
  {
    id: "AUD-023",
    timestamp: "2026-07-08T16:30:00",
    user: "Raj Mehta",
    userInitials: "RM",
    action: "Updated",
    entityType: "Survey",
    entityId: "SRV-039",
    description: "Updated survey checklist items for Progress Documentation",
    ipAddress: "192.168.1.112",
    oldValues: { checklistComplete: 12 },
    newValues: { checklistComplete: 18 },
  },
  {
    id: "AUD-024",
    timestamp: "2026-07-08T15:15:00",
    user: "Neha Gupta",
    userInitials: "NG",
    action: "Created",
    entityType: "Client",
    entityId: "CLI-012",
    description: "Created new client profile for Brigade Enterprises",
    ipAddress: "192.168.1.118",
    newValues: { name: "Brigade Enterprises", contact: "Karan Bhatt", city: "Bangalore" },
  },
  {
    id: "AUD-025",
    timestamp: "2026-07-08T14:00:00",
    user: "Amit Deshmukh",
    userInitials: "AD",
    action: "Approved",
    entityType: "Project",
    entityId: "PRJ-014",
    description: "Approved project closure for HCC Selinium Tower B",
    ipAddress: "192.168.1.130",
  },
  {
    id: "AUD-026",
    timestamp: "2026-07-08T12:45:00",
    user: "Vikram Desai",
    userInitials: "VD",
    action: "Commented",
    entityType: "Survey",
    entityId: "SRV-037",
    description: "Added review comment on Environmental Assessment Survey",
    ipAddress: "192.168.1.120",
  },
  {
    id: "AUD-027",
    timestamp: "2026-07-08T11:30:00",
    user: "Saurabh Patil",
    userInitials: "SP",
    action: "Password Changed",
    entityType: "User",
    entityId: "USR-005",
    description: "Password changed for user Amit Kumar (security policy)",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AUD-028",
    timestamp: "2026-07-08T10:10:00",
    user: "Meera Rao",
    userInitials: "MR",
    action: "Downloaded",
    entityType: "Report",
    entityId: "RPT-2026-008",
    description: "Downloaded Monthly Financial Report for June 2026",
    ipAddress: "192.168.1.122",
  },
  {
    id: "AUD-029",
    timestamp: "2026-07-08T09:00:00",
    user: "Amit Kumar",
    userInitials: "AK",
    action: "Logged Out",
    entityType: "System",
    entityId: "SESSION-89012",
    description: "Session ended (timeout after 30 minutes of inactivity)",
    ipAddress: "192.168.1.115",
  },
  {
    id: "AUD-030",
    timestamp: "2026-07-07T17:45:00",
    user: "Priya Nair",
    userInitials: "PN",
    action: "Created",
    entityType: "Report",
    entityId: "RPT-2026-012",
    description: "Generated BOQ Report for Oberoi Three Sixty West",
    ipAddress: "192.168.1.108",
  },
]

const actionFilters = [
  "All Actions",
  "Created",
  "Updated",
  "Approved",
  "Deleted",
  "Logged In",
  "Logged Out",
  "Rejected",
  "Downloaded",
  "Uploaded",
  "Shared",
  "Commented",
  "Exported",
  "Password Changed",
]

const entityTypeFilters = [
  "All Entities",
  "Project",
  "Survey",
  "Report",
  "Document",
  "User",
  "Client",
  "Invoice",
  "System",
]

const userFilters = [
  "All Users",
  "Saurabh Patil",
  "Raj Mehta",
  "Neha Gupta",
  "Amit Kumar",
  "Priya Nair",
  "Vikram Desai",
  "Sanjay Kulkarni",
  "Deepak Nair",
  "Meera Rao",
  "Amit Deshmukh",
]

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("All Actions")
  const [entityFilter, setEntityFilter] = useState("All Entities")
  const [userFilter, setUserFilter] = useState("All Users")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const pageSize = 25

  const filteredEntries = useMemo(() => {
    return mockAuditEntries.filter((entry) => {
      const matchesSearch =
        searchQuery === "" ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAction =
        actionFilter === "All Actions" || entry.action === actionFilter
      const matchesEntity =
        entityFilter === "All Entities" || entry.entityType === entityFilter
      const matchesUser =
        userFilter === "All Users" || entry.user === userFilter
      return matchesSearch && matchesAction && matchesEntity && matchesUser
    })
  }, [searchQuery, actionFilter, entityFilter, userFilter])

  const totalPages = Math.ceil(filteredEntries.length / pageSize)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="Complete log of all system activities and changes"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Audit Log" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search audit log..."
              className="w-[250px]"
              onSearch={setSearchQuery}
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                {userFilters.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {actionFilters.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                {entityTypeFilters.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredEntries.length} entries
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => {
                const isExpanded = expandedRows.includes(entry.id)
                const hasDetails = entry.oldValues || entry.newValues
                return (
                  <>
                    <TableRow
                      key={entry.id}
                      className={cn(hasDetails && "cursor-pointer", isExpanded && "bg-muted/30")}
                      onClick={() => hasDetails && toggleRow(entry.id)}
                    >
                      <TableCell>
                        {hasDetails && (
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(entry.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                              {entry.userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{entry.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px] gap-1", actionColors[entry.action])}>
                          {actionIcons[entry.action]}
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", entityTypeColors[entry.entityType])}>
                          {entry.entityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{entry.entityId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.ipAddress}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (entry.oldValues || entry.newValues) && (
                      <TableRow key={`${entry.id}-expanded`}>
                        <TableCell colSpan={8} className="bg-muted/20 p-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {entry.oldValues && (
                              <div>
                                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                  Old Values
                                </h4>
                                <pre className="rounded-lg bg-red-50 p-3 text-xs text-red-800 overflow-x-auto">
                                  {JSON.stringify(entry.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.newValues && (
                              <div>
                                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                  New Values
                                </h4>
                                <pre className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 overflow-x-auto">
                                  {JSON.stringify(entry.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>

          {filteredEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No audit entries found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEntries.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
