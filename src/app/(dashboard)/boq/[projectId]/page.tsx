"use client"

import { useState, useEffect, useMemo, useCallback, use } from "react"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  FileSpreadsheet,
  Printer,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import Link from "next/link"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showSuccess, showError } from "@/components/ui/toast"

function exportToCSV(items: BOQItem[], grandTotal: number, gstAmount: number, netTotal: number, projectCode: string) {
  const headers = ["S.No", "Description", "Unit", "Quantity", "Rate (₹)", "Amount (₹)"]
  const rows = items.map(i => [i.serialNumber, i.description, i.unit, i.quantity, i.unitRate, i.amount])
  const totals = ["", "", "", "", "Total", grandTotal]
  const gst = ["", "", "", "", "GST 18%", gstAmount]
  const grand = ["", "", "", "", "Grand Total", netTotal]
  const csv = [headers, ...rows, totals, gst, grand].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `boq-${projectCode}-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showSuccess("BOQ exported as CSV")
}

const units = ["Cum", "Sqm", "Rmt", "Nos", "Set", "Mtr"]

interface BOQItem {
  id: string
  serialNumber: number
  description: string
  category: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
}

interface ProjectInfo {
  id: string
  name: string
  code: string
  budget: number | null
  client: { companyName: string } | null
}

const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function ProjectBOQPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)
  const { data: session } = useSession()
  const role = session?.user?.role
  const canCreate = !!role && CREATE_ROLES.includes(role)
  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null)
  const [items, setItems] = useState<BOQItem[]>([])
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formUnit, setFormUnit] = useState("")
  const [formQty, setFormQty] = useState("")
  const [formRate, setFormRate] = useState("")

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      if (data.success) setProject(data.data)
    } catch {
      showError("Failed to load project details")
    }
  }, [projectId])

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/boq?projectId=${projectId}&limit=500`)
      const data = await res.json()
      if (data.success) setItems(data.data)
    } catch {
      showError("Failed to load BOQ items")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchProject() }, [fetchProject])
  useEffect(() => { fetchItems() }, [fetchItems])

  useEffect(() => {
    if (items.length > 0) {
      const cats = [...new Set(items.map((i) => i.category))]
      setExpandedCategories((prev) => {
        const merged = { ...prev }
        cats.forEach((c) => { if (!(c in merged)) merged[c] = true })
        return merged
      })
    }
  }, [items])

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const groupedItems: Record<string, BOQItem[]> = {}
  items.forEach((item) => {
    if (!groupedItems[item.category]) groupedItems[item.category] = []
    groupedItems[item.category].push(item)
  })
  const categories = Object.keys(groupedItems)

  const categoryTotals: Record<string, number> = {}
  Object.entries(groupedItems).forEach(([cat, catItems]) => {
    categoryTotals[cat] = catItems.reduce((s, i) => s + i.amount, 0)
  })

  const totalEstimated = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
  const gstAmount = totalEstimated * 0.18
  const netTotal = totalEstimated + gstAmount

  const resetForm = () => {
    setFormDescription("")
    setFormCategory("")
    setFormUnit("")
    setFormQty("")
    setFormRate("")
  }

  const handleAddItem = async () => {
    if (!formDescription || !formCategory || !formUnit || !formQty || !formRate) {
      showError("All fields are required")
      return
    }
    const qty = parseFloat(formQty)
    const rate = parseFloat(formRate)
    if (isNaN(qty) || qty <= 0 || isNaN(rate) || rate <= 0) {
      showError("Quantity and rate must be positive numbers")
      return
    }
    const nextSno = items.length > 0 ? Math.max(...items.map((i) => i.serialNumber)) + 1 : 1
    try {
      setSubmitting(true)
      const res = await fetch("/api/boq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          serialNumber: nextSno,
          description: formDescription,
          category: formCategory,
          unit: formUnit,
          quantity: qty,
          unitRate: rate,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess("BOQ item added successfully")
        setShowAddModal(false)
        resetForm()
        fetchItems()
      } else {
        showError(data.error || "Failed to add BOQ item")
      }
    } catch {
      showError("Failed to add BOQ item")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (item: BOQItem) => {
    setEditingItem(item)
    setFormDescription(item.description)
    setFormCategory(item.category)
    setFormUnit(item.unit)
    setFormQty(String(item.quantity))
    setFormRate(String(item.unitRate))
  }

  const handleEditItem = async () => {
    if (!editingItem) return
    if (!formDescription || !formCategory || !formUnit || !formQty || !formRate) {
      showError("All fields are required")
      return
    }
    const qty = parseFloat(formQty)
    const rate = parseFloat(formRate)
    if (isNaN(qty) || qty <= 0 || isNaN(rate) || rate <= 0) {
      showError("Quantity and rate must be positive numbers")
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch(`/api/boq/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formDescription,
          category: formCategory,
          unit: formUnit,
          quantity: qty,
          unitRate: rate,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess("BOQ item updated")
        setEditingItem(null)
        resetForm()
        fetchItems()
      } else {
        showError(data.error || "Failed to update BOQ item")
      }
    } catch {
      showError("Failed to update BOQ item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/boq/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showSuccess("BOQ item deleted")
        fetchItems()
      } else {
        showError(data.error || "Failed to delete BOQ item")
      }
    } catch {
      showError("Failed to delete BOQ item")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project ? `${project.name} — BOQ` : "Project BOQ"}
        description={
          project
            ? `Client: ${project.client?.companyName || "N/A"} · Budget: ${formatCurrency(project.budget || 0)}`
            : "Loading project details..."
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "BOQ", href: "/boq" },
          { label: project?.name || "Project" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/boq">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to BOQ
              </Link>
            </Button>
            <Button variant="outline" onClick={() => exportToCSV(items, totalEstimated, gstAmount, netTotal, projectId)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {canCreate && (
              <Button onClick={() => { resetForm(); setShowAddModal(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Items" value={items.length} icon={<FileText className="h-6 w-6" />} color="default" />
        <StatCard label="Total Amount" value={formatCurrency(totalEstimated)} icon={<FileSpreadsheet className="h-6 w-6" />} color="info" />
        <StatCard label="GST (18%)" value={formatCurrency(gstAmount)} icon={<FileText className="h-6 w-6" />} color="warning" />
        <StatCard label="Grand Total" value={formatCurrency(netTotal)} icon={<FileSpreadsheet className="h-6 w-6" />} color="success" />
      </div>

      <Tabs defaultValue="boq">
        <TabsList>
          <TabsTrigger value="boq">BOQ Items</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="boq">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No BOQ items</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add your first BOQ item for this project</p>
                </div>
              ) : (
                <>
                  {categories.map((category) => {
                    const catItems = groupedItems[category]
                    const catTotal = categoryTotals[category]
                    const isExpanded = expandedCategories[category] !== false
                    return (
                      <div key={category} className="mb-4">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 rounded-t-lg hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="font-semibold text-sm">{category}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{catItems.length} items</Badge>
                          </div>
                          <span className="font-semibold text-sm">{formatCurrency(catTotal)}</span>
                        </button>
                        {isExpanded && (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[60px]">S.No</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Rate (₹)</TableHead>
                                <TableHead className="text-right">Amount (₹)</TableHead>
                                <TableHead className="text-center w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {catItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-mono text-xs">{item.serialNumber}</TableCell>
                                  <TableCell className="font-medium">{item.description}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell className="text-right">{item.quantity.toLocaleString("en-IN")}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.unitRate)}</TableCell>
                                  <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {canWrite && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(item)}>
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {canDelete && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteItem(item.id)}
                                          disabled={deletingId === item.id}
                                        >
                                          {deletingId === item.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={5} className="font-semibold text-right">Subtotal ({category})</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(catTotal)}</TableCell>
                                <TableCell />
                              </TableRow>
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    )
                  })}
                  <div className="mt-6 border-t pt-4 space-y-2">
                    <div className="flex justify-between px-4">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-semibold">{formatCurrency(totalEstimated)}</span>
                    </div>
                    <div className="flex justify-between px-4">
                      <span className="font-medium">GST @ 18%</span>
                      <span className="font-semibold">{formatCurrency(gstAmount)}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 bg-primary/5 rounded-lg border-t-2 border-primary">
                      <span className="font-bold text-lg">Grand Total (incl. GST)</span>
                      <span className="font-bold text-lg">{formatCurrency(netTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Version history will be available when the system tracks BOQ revisions.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add BOQ Item"
        description="Add a new line item to this project's BOQ"
        maxWidth="lg"
        onCancel={() => setShowAddModal(false)}
        onConfirm={handleAddItem}
        confirmLabel={submitting ? "Adding..." : "Add Item"}
        loading={submitting}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="Item description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                placeholder="e.g. Foundation, Structure"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={formUnit} onValueChange={setFormUnit}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                placeholder="0"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rate (₹) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={formRate}
                onChange={(e) => setFormRate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editingItem}
        onOpenChange={(open) => { if (!open) { setEditingItem(null); resetForm() } }}
        title="Edit BOQ Item"
        description="Update this line item"
        maxWidth="lg"
        onCancel={() => { setEditingItem(null); resetForm() }}
        onConfirm={handleEditItem}
        confirmLabel={submitting ? "Saving..." : "Save Changes"}
        loading={submitting}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input placeholder="Item description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input placeholder="e.g. Foundation, Structure" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={formUnit} onValueChange={setFormUnit}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" placeholder="0" value={formQty} onChange={(e) => setFormQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rate (₹) *</Label>
              <Input type="number" placeholder="0" value={formRate} onChange={(e) => setFormRate(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
