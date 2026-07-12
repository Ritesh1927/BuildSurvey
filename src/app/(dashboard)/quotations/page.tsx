"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Send,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { showSuccess } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

const mockQuotations = [
  { id: "QUO-2024-001", title: "Interior Fit-out Works - Worli Sky Residences", project: "Worli Sky Residences Tower A", totalAmount: 18500000, tax: 3330000, grandTotal: 21830000, validUntil: "2025-01-15", status: "Accepted", createdAt: "2024-10-15" },
  { id: "QUO-2024-002", title: "Electrical Works Phase 1 - BKC Hub", project: "BKC Commercial Hub Phase 1", totalAmount: 12000000, tax: 2160000, grandTotal: 14160000, validUntil: "2025-02-28", status: "Sent", createdAt: "2024-11-01" },
  { id: "QUO-2024-003", title: "Plumbing & Sanitary - Lake Ridge Villas", project: "Prestige Lake Ridge Villas", totalAmount: 6800000, tax: 1224000, grandTotal: 8024000, validUntil: "2025-01-31", status: "Draft", createdAt: "2024-11-10" },
  { id: "QUO-2024-004", title: "HVAC Installation - Brigade Gateway", project: "Brigade Gateway Commercial Tower", totalAmount: 9500000, tax: 1710000, grandTotal: 11210000, validUntil: "2025-03-15", status: "Sent", createdAt: "2024-11-05" },
  { id: "QUO-2024-005", title: "Fire Safety Systems - Metro Line 4", project: "Mumbai Metro Line 4 Extension", totalAmount: 15200000, tax: 2736000, grandTotal: 17936000, validUntil: "2025-04-30", status: "Accepted", createdAt: "2024-09-20" },
  { id: "QUO-2024-006", title: "Foundation & Piling - Expressway S3", project: "Delhi-Meerut Expressway Section 3", totalAmount: 42000000, tax: 7560000, grandTotal: 49560000, validUntil: "2025-06-30", status: "Accepted", createdAt: "2024-08-10" },
  { id: "QUO-2024-007", title: "Marble & Stone Works - Oberoi 360", project: "Oberoi Three Sixty West", totalAmount: 28000000, tax: 5040000, grandTotal: 33040000, validUntil: "2025-02-15", status: "Draft", createdAt: "2024-11-18" },
  { id: "QUO-2024-008", title: "Road Construction - Bridge Reconstruction", project: "Ircon Bridge Reconstruction - Bihar", totalAmount: 35000000, tax: 6300000, grandTotal: 41300000, validUntil: "2025-05-31", status: "Rejected", createdAt: "2024-10-01" },
  { id: "QUO-2024-009", title: "Landscaping & External Works - Cyber City", project: "DLF Cyber City Phase 2", totalAmount: 4800000, tax: 864000, grandTotal: 5664000, validUntil: "2025-03-31", status: "Sent", createdAt: "2024-11-22" },
  { id: "QUO-2024-010", title: "Structural Audit & Remediation - Selinium", project: "HCC Selinium Tower B", totalAmount: 2200000, tax: 396000, grandTotal: 2596000, validUntil: "2025-01-31", status: "Cancelled", createdAt: "2024-11-08" },
  { id: "QUO-2024-011", title: "Waterproofing Works - Primanti Floors", project: "Tata Housing Primanti Floors", totalAmount: 3500000, tax: 630000, grandTotal: 4130000, validUntil: "2025-02-28", status: "Draft", createdAt: "2024-11-25" },
]

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  Accepted: "success",
  Sent: "info",
  Draft: "secondary",
  Rejected: "destructive",
  Cancelled: "destructive",
}

const projectList = [...new Set(mockQuotations.map((q) => q.project))].sort()

export default function QuotationsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  const filteredQuotations = useMemo(() => {
    return mockQuotations.filter((q) => {
      const matchesStatus = statusFilter === "all" || q.status === statusFilter
      const matchesProject = projectFilter === "all" || q.project === projectFilter
      return matchesStatus && matchesProject
    })
  }, [statusFilter, projectFilter])

  const handleExport = () => {
    const headers = ["Quotation #", "Title", "Project", "Total Amount", "Tax", "Grand Total", "Valid Until", "Status"]
    const rows = filteredQuotations.map(q => [
      q.id, q.title, q.project, q.totalAmount, q.tax, q.grandTotal, q.validUntil, q.status
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quotations-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showSuccess("Quotation data exported as CSV")
  }

  const totalValue = mockQuotations.reduce((s, q) => s + q.grandTotal, 0)
  const draftCount = mockQuotations.filter((q) => q.status === "Draft").length
  const sentCount = mockQuotations.filter((q) => q.status === "Sent").length
  const acceptedCount = mockQuotations.filter((q) => q.status === "Accepted").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Create, manage and track project quotations"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Quotations" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/quotations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Quotation
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Quotations" value={mockQuotations.length} icon={<FileText className="h-6 w-6" />} color="default" />
        <StatCard label="Draft" value={draftCount} icon={<Pencil className="h-6 w-6" />} color="warning" />
        <StatCard label="Sent" value={sentCount} icon={<Send className="h-6 w-6" />} color="info" />
        <StatCard label="Accepted" value={acceptedCount} icon={<Eye className="h-6 w-6" />} color="success" />
        <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<FileText className="h-6 w-6" />} color="default" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectList.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-mono text-xs font-medium">{quotation.id}</TableCell>
                  <TableCell>
                    <Link href={`/quotations/${quotation.id}`} className="font-medium hover:text-primary transition-colors">
                      {quotation.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{quotation.project}</TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(quotation.totalAmount)}</TableCell>
                  <TableCell className="text-right text-sm">{formatCurrency(quotation.tax)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(quotation.grandTotal)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(quotation.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[quotation.status] || "secondary"}>
                      {quotation.status}
                    </Badge>
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
                          <Link href={`/quotations/${quotation.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/quotations/new`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send to Client
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
          {filteredQuotations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No quotations found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
