"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
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
import { showSuccess, showError } from "@/components/ui/toast"
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

interface QuotationRow {
  id: string
  quotationNumber: string
  title: string
  totalAmount: number
  taxAmount: number
  grandTotal: number
  validUntil: string | null
  quotationStatus: string
  project: { id: string; name: string; code: string }
}

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Sent", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function QuotationsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  const [quotations, setQuotations] = useState<QuotationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  const fetchQuotations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/quotations?limit=200')
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load quotations')
        setQuotations([])
        return
      }
      setQuotations(data.data)
    } catch {
      setError('Network error while loading quotations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  const projectList = useMemo(
    () => [...new Set(quotations.map((q) => q.project?.name).filter(Boolean))].sort(),
    [quotations]
  )

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesStatus = statusFilter === "all" || q.quotationStatus === statusFilter
      const matchesProject = projectFilter === "all" || q.project?.name === projectFilter
      return matchesStatus && matchesProject
    })
  }, [quotations, statusFilter, projectFilter])

  const handleDelete = async (quotation: QuotationRow) => {
    if (!confirm(`Delete quotation "${quotation.quotationNumber}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/quotations/${quotation.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete quotation')
        return
      }
      showSuccess('Quotation deleted')
      setQuotations((prev) => prev.filter((q) => q.id !== quotation.id))
    } catch {
      showError('Network error while deleting quotation')
    }
  }

  const handleExport = () => {
    const headers = ["Quotation #", "Title", "Project", "Total Amount", "Tax", "Grand Total", "Valid Until", "Status"]
    const rows = filteredQuotations.map(q => [
      q.quotationNumber, q.title, q.project?.name || '', q.totalAmount, q.taxAmount, q.grandTotal, q.validUntil || '', q.quotationStatus
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

  const totalValue = quotations.reduce((s, q) => s + q.grandTotal, 0)
  const draftCount = quotations.filter((q) => q.quotationStatus === "DRAFT").length
  const sentCount = quotations.filter((q) => q.quotationStatus === "SENT").length
  const acceptedCount = quotations.filter((q) => q.quotationStatus === "ACCEPTED").length

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
            {role && CREATE_ROLES.includes(role) && (
              <Link href="/quotations/new">
                <Button><Plus className="mr-2 h-4 w-4" />New Quotation</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Quotations" value={quotations.length} icon={<FileText className="h-6 w-6" />} color="default" />
        <StatCard label="Draft" value={draftCount} icon={<Pencil className="h-6 w-6" />} color="warning" />
        <StatCard label="Sent" value={sentCount} icon={<Send className="h-6 w-6" />} color="info" />
        <StatCard label="Accepted" value={acceptedCount} icon={<Eye className="h-6 w-6" />} color="success" />
        <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<FileText className="h-6 w-6" />} color="default" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectList.length > 0 && (
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[280px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectList.map((p) => (
                    <SelectItem key={p} value={p as string}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading quotations...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : (
            <>
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
                  {filteredQuotations.map((quotation) => {
                    const statusMeta = STATUS_META[quotation.quotationStatus] || { label: quotation.quotationStatus, variant: 'secondary' as const }
                    return (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-mono text-xs font-medium">{quotation.quotationNumber}</TableCell>
                        <TableCell>
                          <Link href={`/quotations/${quotation.id}`} className="font-medium hover:text-primary transition-colors">
                            {quotation.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{quotation.project?.name}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(quotation.totalAmount)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(quotation.taxAmount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(quotation.grandTotal)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : '—'}
                        </TableCell>
                        <TableCell><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/quotations/${quotation.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link>
                              </DropdownMenuItem>
                              {role && DELETE_ROLES.includes(role) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(quotation)}>
                                    <Trash2 className="mr-2 h-4 w-4" />Delete
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
              {filteredQuotations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No quotations found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
