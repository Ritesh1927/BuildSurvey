"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  FileText,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreVertical,
  FolderKanban,
  Receipt,
} from "lucide-react"

import { formatCurrency } from "@/lib/utils"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { showSuccess, showError } from "@/components/ui/toast"

interface Project {
  id: string
  name: string
  code: string
}

interface BOQItem {
  id: string
  serialNumber: number
  description: string
  category: string
  unit: string
  quantity: number
  unitRate: number
  amount: number
  projectId: string
}

interface BOQDraft {
  description: string
  category: string
  unit: string
  quantity: string
  unitRate: string
}

const units = ["Cum", "Sqm", "Rmt", "Nos", "Set", "Mtr"]
const categories = [
  "Earthwork",
  "Concrete Work",
  "Masonry",
  "Reinforcement & Steel",
  "Formwork & Shuttering",
  "Flooring & Tiling",
  "Plastering",
  "Waterproofing",
  "Painting & Finishing",
  "Doors & Windows",
  "Electrical Work",
  "Plumbing & Sanitary",
  "HVAC",
  "Roofing",
  "Miscellaneous",
]
const emptyDraft: BOQDraft = { description: "", category: "", unit: "", quantity: "", unitRate: "" }
const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function BOQPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const canCreate = !!role && CREATE_ROLES.includes(role)
  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalProjectId, setAddModalProjectId] = useState("")
  const [addModalProjectLocked, setAddModalProjectLocked] = useState(false)
  const [boqDrafts, setBoqDrafts] = useState<BOQDraft[]>([{ ...emptyDraft }])
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null)
  const [items, setItems] = useState<BOQItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [gstRatePercent, setGstRatePercent] = useState(18)

  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formUnit, setFormUnit] = useState("")
  const [formQty, setFormQty] = useState("")
  const [formRate, setFormRate] = useState("")

  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteProject, setQuoteProject] = useState<Project | null>(null)
  const [quoteTitle, setQuoteTitle] = useState("")
  const [quoteValidUntil, setQuoteValidUntil] = useState("")
  const [generatingQuote, setGeneratingQuote] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects?limit=200")
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {
      showError("Failed to load projects")
    }
  }, [])

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/boq?limit=1000")
      const data = await res.json()
      if (data.success) setItems(data.data)
    } catch {
      showError("Failed to load BOQ items")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGstRate = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/gst-rate")
      const data = await res.json()
      if (data.success) setGstRatePercent(data.data.gstRate)
    } catch {
      // keep the 18% default
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { fetchGstRate() }, [fetchGstRate])

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  // Only projects that already have at least one BOQ item show up as a
  // section here - a brand new project with nothing yet is set up via the
  // top-level "Add BOQ Items" button (pick it from the dropdown there),
  // and only then does it get its own representation with a 3-dot menu
  // for adding more items later.
  const projectGroups = useMemo(() => {
    return projects
      .map((project) => {
        const projectItems = items.filter((i) => i.projectId === project.id)
        const total = projectItems.reduce((sum, i) => sum + i.amount, 0)
        return { project, items: projectItems, total }
      })
      .filter((g) => g.items.length > 0)
      .sort((a, b) => a.project.name.localeCompare(b.project.name))
  }, [projects, items])

  const grandTotal = items.reduce((sum, i) => sum + i.amount, 0)
  const gstAmount = grandTotal * (gstRatePercent / 100)
  const netTotal = grandTotal + gstAmount

  const openAddModal = (projectId?: string) => {
    setBoqDrafts([{ ...emptyDraft }])
    if (projectId) {
      setAddModalProjectId(projectId)
      setAddModalProjectLocked(true)
    } else {
      setAddModalProjectId("")
      setAddModalProjectLocked(false)
    }
    setShowAddModal(true)
  }

  const addDraftRow = () => setBoqDrafts((prev) => [...prev, { ...emptyDraft }])
  const removeDraftRow = (index: number) => setBoqDrafts((prev) => prev.filter((_, i) => i !== index))
  const updateDraftRow = (index: number, field: keyof BOQDraft, value: string) => {
    setBoqDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)))
  }

  const handleAddItems = async () => {
    if (!addModalProjectId) {
      showError("Please select a project")
      return
    }
    for (const d of boqDrafts) {
      if (!d.description || !d.category || !d.unit || !d.quantity || !d.unitRate) {
        showError("All fields are required for every row")
        return
      }
      const qty = parseFloat(d.quantity)
      const rate = parseFloat(d.unitRate)
      if (isNaN(qty) || qty <= 0 || isNaN(rate) || rate <= 0) {
        showError("Quantity and rate must be positive numbers")
        return
      }
    }

    // Serial numbers are scoped per project's own BOQ, not shared globally.
    const existingForProject = items.filter((i) => i.projectId === addModalProjectId)
    let nextSno = existingForProject.length > 0 ? Math.max(...existingForProject.map((i) => i.serialNumber)) + 1 : 1

    try {
      setSubmitting(true)
      for (const d of boqDrafts) {
        const res = await fetch("/api/boq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: addModalProjectId,
            serialNumber: nextSno,
            description: d.description,
            category: d.category,
            unit: d.unit,
            quantity: parseFloat(d.quantity),
            unitRate: parseFloat(d.unitRate),
          }),
        })
        const data = await res.json()
        if (!data.success) {
          showError(data.error || "Failed to add a BOQ item")
          return
        }
        nextSno += 1
      }
      showSuccess(`${boqDrafts.length} BOQ item${boqDrafts.length > 1 ? "s" : ""} added successfully`)
      setShowAddModal(false)
      setExpandedProjects((prev) => ({ ...prev, [addModalProjectId]: true }))
      fetchItems()
    } catch {
      showError("Failed to add BOQ items")
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
      } else {
        showError(data.error || "Failed to update BOQ item")
        return
      }
      fetchItems()
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

  const openQuoteModal = (project: Project) => {
    setQuoteProject(project)
    setQuoteTitle(`${project.name} — BOQ Invoice`)
    setQuoteValidUntil("")
    setShowQuoteModal(true)
  }

  const handleGenerateQuotation = async () => {
    if (!quoteProject) return
    if (!quoteTitle.trim()) {
      showError("A title is required")
      return
    }
    const projectItems = items.filter((i) => i.projectId === quoteProject.id)
    if (projectItems.length === 0) {
      showError("This project has no BOQ items to base an invoice on")
      return
    }
    try {
      setGeneratingQuote(true)
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quoteTitle.trim(),
          projectId: quoteProject.id,
          validUntil: quoteValidUntil || undefined,
          // BOQ's per-item category doesn't carry over - Quotation line
          // items don't have a category field, only description/unit/
          // quantity/rate, same as the BOQ->Quotation shape everywhere else.
          items: projectItems.map((i) => ({
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitRate: i.unitRate,
          })),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        showError(data.error || "Failed to generate invoice")
        return
      }
      showSuccess("Invoice generated from BOQ")
      setShowQuoteModal(false)
      router.push(`/quotations/${data.data.id}`)
    } catch {
      showError("Failed to generate invoice")
    } finally {
      setGeneratingQuote(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Quantities"
        description="Prepare and manage BOQ for project cost estimation"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "BOQ" },
        ]}
        actions={
          canCreate ? (
            <Button onClick={() => openAddModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Add BOQ Items
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Items"
          value={items.length}
          icon={<FileText className="h-6 w-6" />}
          color="default"
        />
        <StatCard
          label="Total Amount"
          value={formatCurrency(grandTotal)}
          icon={<FileSpreadsheet className="h-6 w-6" />}
          color="info"
        />
        <StatCard
          label={`GST (${gstRatePercent}%)`}
          value={formatCurrency(gstAmount)}
          icon={<FileText className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          label="Grand Total"
          value={formatCurrency(netTotal)}
          icon={<FileSpreadsheet className="h-6 w-6" />}
          color="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">BOQ by Project</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projectGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No BOQ items found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {canCreate ? 'Click "Add BOQ Items" to set up the first project.' : "No BOQ items have been added yet."}
              </p>
            </div>
          ) : (
            projectGroups.map(({ project, items: projectItems, total }) => {
              const isExpanded = expandedProjects[project.id] !== false
              const shareOfTotal = grandTotal > 0 ? Math.round((total / grandTotal) * 1000) / 10 : 0
              return (
                <div key={project.id} className="mb-4 overflow-hidden rounded-xl border border-border/70 shadow-sm">
                  <div className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/40">
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="flex flex-1 items-center gap-3 text-left min-w-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm truncate">{project.name}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {projectItems.length} item{projectItems.length === 1 ? '' : 's'}
                          </Badge>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{project.code}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(total)}</p>
                        <p className="text-[11px] text-muted-foreground">{shareOfTotal}% of total</p>
                      </div>
                      {canCreate && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAddModal(project.id)}>
                              <Plus className="mr-2 h-4 w-4" />Add Item(s)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openQuoteModal(project)}>
                              <Receipt className="mr-2 h-4 w-4" />Generate Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <div className="h-1 w-full bg-muted/60">
                    <div className="h-full bg-primary/60" style={{ width: `${Math.min(shareOfTotal, 100)}%` }} />
                  </div>
                  {isExpanded && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">S.No</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate (₹)</TableHead>
                          <TableHead className="text-right">Amount (₹)</TableHead>
                          <TableHead className="text-center w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.serialNumber}</TableCell>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
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
                          <TableCell colSpan={6} className="font-semibold text-right">
                            Subtotal ({project.name})
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>
              )
            })
          )}

          {!loading && items.length > 0 && (
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between px-4">
                <span className="font-medium">Total Amount</span>
                <span className="font-semibold">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between px-4">
                <span className="font-medium">GST @ {gstRatePercent}%</span>
                <span className="font-semibold">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-primary/5 rounded-lg border-t-2 border-primary">
                <span className="font-bold text-lg">Grand Total (incl. GST)</span>
                <span className="font-bold text-lg">{formatCurrency(netTotal)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add BOQ Items"
        description="Add one or more line items to a project's Bill of Quantities"
        maxWidth="2xl"
        onCancel={() => setShowAddModal(false)}
        onConfirm={handleAddItems}
        confirmLabel={submitting ? "Adding..." : `Add ${boqDrafts.length} Item${boqDrafts.length > 1 ? "s" : ""}`}
        loading={submitting}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={addModalProjectId} onValueChange={setAddModalProjectId} disabled={addModalProjectLocked}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {boqDrafts.map((d, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3">
                <div className="col-span-12 sm:col-span-3 space-y-1">
                  <Label className="text-xs">Description *</Label>
                  <Input placeholder="Item description" value={d.description} onChange={(e) => updateDraftRow(i, "description", e.target.value)} />
                </div>
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Category *</Label>
                  <Select value={d.category} onValueChange={(v) => updateDraftRow(i, "category", v)}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Unit *</Label>
                  <Select value={d.unit} onValueChange={(v) => updateDraftRow(i, "unit", v)}>
                    <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Qty *</Label>
                  <Input type="number" placeholder="0" value={d.quantity} onChange={(e) => updateDraftRow(i, "quantity", e.target.value)} />
                </div>
                <div className="col-span-5 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Rate (₹) *</Label>
                  <Input type="number" placeholder="0" value={d.unitRate} onChange={(e) => updateDraftRow(i, "unitRate", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive"
                    onClick={() => removeDraftRow(i)}
                    disabled={boqDrafts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addDraftRow}>
            <Plus className="mr-1 h-3.5 w-3.5" />Add Another Item
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!editingItem}
        onOpenChange={(open) => { if (!open) setEditingItem(null) }}
        title="Edit BOQ Item"
        description="Update this line item"
        maxWidth="lg"
        onCancel={() => setEditingItem(null)}
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
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={formUnit} onValueChange={setFormUnit}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
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

      <Modal
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
        title="Generate Invoice from BOQ"
        description={quoteProject ? `Creates a new invoice for ${quoteProject.name} using its current BOQ line items` : undefined}
        maxWidth="lg"
        onCancel={() => setShowQuoteModal(false)}
        onConfirm={handleGenerateQuotation}
        confirmLabel={generatingQuote ? "Generating..." : "Generate Invoice"}
        loading={generatingQuote}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Invoice Title *</Label>
            <Input value={quoteTitle} onChange={(e) => setQuoteTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Input type="date" value={quoteValidUntil} onChange={(e) => setQuoteValidUntil(e.target.value)} />
          </div>
          {quoteProject && (
            <p className="text-xs text-muted-foreground">
              {items.filter((i) => i.projectId === quoteProject.id).length} line item(s) from this project's BOQ will be
              copied into the invoice, with {gstRatePercent}% GST applied automatically.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
