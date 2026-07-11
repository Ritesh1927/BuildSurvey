"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Upload,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Search,
  Filter,
  Calendar,
  Layers,
} from "lucide-react"

import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"

const folders = [
  {
    id: "root",
    name: "All Documents",
    icon: <HardDrive className="h-4 w-4" />,
    children: [
      {
        id: "drawings",
        name: "Drawings",
        icon: <Layers className="h-4 w-4" />,
        count: 5,
        children: [],
      },
      {
        id: "specifications",
        name: "Specifications",
        icon: <FileText className="h-4 w-4" />,
        count: 3,
        children: [],
      },
      {
        id: "contracts",
        name: "Contracts",
        icon: <FileText className="h-4 w-4" />,
        count: 2,
        children: [],
      },
      {
        id: "reports",
        name: "Reports",
        icon: <FileText className="h-4 w-4" />,
        count: 4,
        children: [],
      },
      {
        id: "invoices",
        name: "Invoices",
        icon: <FileSpreadsheet className="h-4 w-4" />,
        count: 3,
        children: [],
      },
      {
        id: "correspondence",
        name: "Correspondence",
        icon: <FileText className="h-4 w-4" />,
        count: 3,
        children: [],
      },
    ],
  },
]

const mockDocuments = [
  { id: "DOC-001", name: "Architectural Drawing - Floor Plan A3.pdf", type: "PDF", category: "Drawings", folder: "drawings", size: "15.2 MB", uploadedBy: "Amit Deshmukh", date: "2026-07-10", version: "3.1", project: "Worli Sky Residences Tower A" },
  { id: "DOC-002", name: "Structural Layout - Foundation.pdf", type: "PDF", category: "Drawings", folder: "drawings", size: "12.8 MB", uploadedBy: "Priya Nair", date: "2026-07-09", version: "2.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-003", name: "MEP Coordination Drawing.pdf", type: "PDF", category: "Drawings", folder: "drawings", size: "18.5 MB", uploadedBy: "Vikram Desai", date: "2026-07-08", version: "1.2", project: "BKC Commercial Hub Phase 1" },
  { id: "DOC-004", name: "Site Layout Drawing - Revised.dwg", type: "DWG", category: "Drawings", folder: "drawings", size: "8.4 MB", uploadedBy: "Amit Kumar", date: "2026-07-05", version: "2.1", project: "Delhi-Meerut Expressway Section 3" },
  { id: "DOC-005", name: "Elevation Drawing - North Face.pdf", type: "PDF", category: "Drawings", folder: "drawings", size: "6.3 MB", uploadedBy: "Priya Nair", date: "2026-07-03", version: "1.0", project: "Prestige Lake Ridge Villas" },
  { id: "DOC-006", name: "Material Specification - Concrete Grade M40.pdf", type: "PDF", category: "Specifications", folder: "specifications", size: "2.1 MB", uploadedBy: "Raj Mehta", date: "2026-07-07", version: "1.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-007", name: "Rebar Specification IS 1786.pdf", type: "PDF", category: "Specifications", folder: "specifications", size: "1.8 MB", uploadedBy: "Sanjay Kulkarni", date: "2026-07-06", version: "1.1", project: "Godrej Platinum Towers" },
  { id: "DOC-008", name: "Waterproofing System Spec.pdf", type: "PDF", category: "Specifications", folder: "specifications", size: "3.2 MB", uploadedBy: "Deepak Nair", date: "2026-07-04", version: "1.0", project: "Mumbai Metro Line 4 Extension" },
  { id: "DOC-009", name: "Main Construction Contract - L&T Realty.pdf", type: "PDF", category: "Contracts", folder: "contracts", size: "4.5 MB", uploadedBy: "Saurabh Patil", date: "2026-06-15", version: "1.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-010", name: "Subcontract Agreement - Civil Works.pdf", type: "PDF", category: "Contracts", folder: "contracts", size: "3.8 MB", uploadedBy: "Saurabh Patil", date: "2026-06-10", version: "1.0", project: "BKC Commercial Hub Phase 1" },
  { id: "DOC-011", name: "Monthly Progress Report - June 2026.pdf", type: "PDF", category: "Reports", folder: "reports", size: "5.1 MB", uploadedBy: "Priya Nair", date: "2026-07-05", version: "1.0", project: "BKC Commercial Hub Phase 1" },
  { id: "DOC-012", name: "Topographical Survey Report.pdf", type: "PDF", category: "Reports", folder: "reports", size: "2.4 MB", uploadedBy: "Raj Mehta", date: "2026-07-10", version: "1.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-013", name: "Quality Inspection Report - Q2.pdf", type: "PDF", category: "Reports", folder: "reports", size: "3.6 MB", uploadedBy: "Meera Rao", date: "2026-07-02", version: "1.0", project: "All Projects" },
  { id: "DOC-014", name: "Environmental Assessment Report.pdf", type: "PDF", category: "Reports", folder: "reports", size: "4.8 MB", uploadedBy: "Vikram Desai", date: "2026-06-28", version: "1.0", project: "Adani Ahmedabad Airport Expansion" },
  { id: "DOC-015", name: "Invoice #INV-2026-042 - July 2026.xlsx", type: "Excel", category: "Invoices", folder: "invoices", size: "1.2 MB", uploadedBy: "Saurabh Patil", date: "2026-07-10", version: "1.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-016", name: "Invoice #INV-2026-038 - June 2026.xlsx", type: "Excel", category: "Invoices", folder: "invoices", size: "1.1 MB", uploadedBy: "Saurabh Patil", date: "2026-07-05", version: "1.0", project: "Delhi-Meerut Expressway Section 3" },
  { id: "DOC-017", name: "Tax Invoice - GST Component.xlsx", type: "Excel", category: "Invoices", folder: "invoices", size: "0.8 MB", uploadedBy: "Saurabh Patil", date: "2026-06-30", version: "1.0", project: "All Projects" },
  { id: "DOC-018", name: "Client Communication - Phase 2 Approval.pdf", type: "PDF", category: "Correspondence", folder: "correspondence", size: "0.5 MB", uploadedBy: "Amit Deshmukh", date: "2026-07-09", version: "1.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-019", name: "NHAI Progress Update Letter.pdf", type: "PDF", category: "Correspondence", folder: "correspondence", size: "0.3 MB", uploadedBy: "Ravi Shankar", date: "2026-07-08", version: "1.0", project: "Delhi-Meerut Expressway Section 3" },
  { id: "DOC-020", name: "Site Access Request - Metro Phase 4.pdf", type: "PDF", category: "Correspondence", folder: "correspondence", size: "0.4 MB", uploadedBy: "Deepak Nair", date: "2026-07-06", version: "1.0", project: "Mumbai Metro Line 4 Extension" },
  { id: "DOC-021", name: "BoQ - Worli Sky Residences.xlsx", type: "Excel", category: "Reports", folder: "reports", size: "2.8 MB", uploadedBy: "Priya Nair", date: "2026-07-03", version: "2.0", project: "Worli Sky Residences Tower A" },
  { id: "DOC-022", name: "Safety Audit Report - May 2026.pdf", type: "PDF", category: "Reports", folder: "reports", size: "3.1 MB", uploadedBy: "Meera Rao", date: "2026-06-18", version: "1.0", project: "All Projects" },
]

const fileTypeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-red-500" />,
  Excel: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  DWG: <File className="h-5 w-5 text-blue-500" />,
  Image: <Image className="h-5 w-5 text-violet-500" />,
}

const fileTypeColors: Record<string, string> = {
  PDF: "bg-red-50",
  Excel: "bg-emerald-50",
  DWG: "bg-blue-50",
  Image: "bg-violet-50",
}

const categoryFilters = [
  "All Categories",
  "Drawings",
  "Specifications",
  "Contracts",
  "Reports",
  "Invoices",
  "Correspondence",
]

const projectFilters = [
  "All Projects",
  "Worli Sky Residences Tower A",
  "BKC Commercial Hub Phase 1",
  "Delhi-Meerut Expressway Section 3",
  "Prestige Lake Ridge Villas",
  "Godrej Platinum Towers",
  "Mumbai Metro Line 4 Extension",
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [selectedFolder, setSelectedFolder] = useState("root")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["root"])
  const [currentPage, setCurrentPage] = useState(1)
  const [isDragOver, setIsDragOver] = useState(false)
  const pageSize = 10

  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === "All Categories" || doc.category === categoryFilter
      const matchesProject =
        projectFilter === "All Projects" || doc.project === projectFilter
      const matchesFolder =
        selectedFolder === "root" || doc.folder === selectedFolder
      return matchesSearch && matchesCategory && matchesProject && matchesFolder
    })
  }, [searchQuery, categoryFilter, projectFilter, selectedFolder])

  const totalPages = Math.ceil(filteredDocuments.length / pageSize)
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    )
    setSelectedFolder(folderId)
  }

  const storageUsed = 847
  const storageTotal = 2000
  const storagePercent = (storageUsed / storageTotal) * 100

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management"
        description="Organize, manage, and access all project documents"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Documents" },
        ]}
        actions={
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Storage Used</span>
                <span className="text-muted-foreground">
                  {storageUsed} GB of {storageTotal} GB ({Math.round(storagePercent)}%)
                </span>
              </div>
              <Progress value={storagePercent} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Folder Tree */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[500px]">
              {folders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  selectedFolder={selectedFolder}
                  expandedFolders={expandedFolders}
                  onToggle={toggleFolder}
                  level={0}
                />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document List */}
        <div className="space-y-4">
          {/* Upload Drop Zone */}
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
            }}
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports PDF, Excel, DWG, Images up to 50MB each
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="Search documents..."
                  className="w-[250px]"
                  onSearch={setSearchQuery}
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryFilters.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectFilters.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Document Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", fileTypeColors[doc.type])}>
                            {fileTypeIcons[doc.type] || <File className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div>
                            <Link
                              href={`/documents/${doc.id}`}
                              className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                            >
                              {doc.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{doc.project}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                      <TableCell className="text-sm">{doc.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(doc.date)}
                      </TableCell>
                      <TableCell className="text-sm font-mono">v{doc.version}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/documents/${doc.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocuments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              <div className="p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredDocuments.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FolderItem({
  folder,
  selectedFolder,
  expandedFolders,
  onToggle,
  level,
}: {
  folder: (typeof folders)[0] & { count?: number }
  selectedFolder: string
  expandedFolders: string[]
  onToggle: (id: string) => void
  level: number
}) {
  const isExpanded = expandedFolders.includes(folder.id)
  const isSelected = selectedFolder === folder.id
  const hasChildren = folder.children && folder.children.length > 0

  return (
    <div>
      <button
        onClick={() => onToggle(folder.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
          isSelected && "bg-muted font-medium",
          level > 0 && "ml-4"
        )}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {folder.icon}
        <span className="flex-1 text-left">{folder.name}</span>
        {folder.count !== undefined && (
          <span className="text-xs text-muted-foreground">{folder.count}</span>
        )}
      </button>
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              selectedFolder={selectedFolder}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
