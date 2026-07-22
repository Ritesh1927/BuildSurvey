"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Plus,
  Save,
  Send,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { showSuccess, showError } from "@/components/ui/toast"

interface Project {
  id: string
  name: string
  code: string
}

interface LineItem {
  id: string
  description: string
  unit: string
  qty: number
  rate: number
  amount: number
}

const defaultLineItems: LineItem[] = [
  { id: "LI-1", description: "Earthwork excavation in foundation trenches", unit: "Cum", qty: 4500, rate: 320, amount: 1440000 },
  { id: "LI-2", description: "PCC 1:4:8 in foundation", unit: "Cum", qty: 850, rate: 4200, amount: 3570000 },
  { id: "LI-3", description: "RCC M30 in footings and columns", unit: "Cum", qty: 1200, rate: 5800, amount: 6960000 },
]

const defaultTerms = `1. This quotation is valid for 90 days from the date of issue.
2. Prices are inclusive of all taxes (GST @ 18%).
3. Payment Terms: 30% advance, 40% at mid-stage, 30% on completion.
4. Material delivery within 2-3 weeks from date of order.
5. Warranty: 12 months from date of commissioning.
6. Price escalation clause: Rates are subject to change after 90 days as per market conditions.
7. All disputes subject to Mumbai jurisdiction.
8. Workmanship guarantee as per IS standards.`

export default function NewQuotationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedProject, setSelectedProject] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>(defaultLineItems)
  const [gstPercent, setGstPercent] = useState(18)
  const [discount, setDiscount] = useState(0)
  const [terms, setTerms] = useState(defaultTerms)
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true)
      const res = await fetch("/api/projects?limit=100")
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {
      showError("Failed to load projects")
    } finally {
      setLoadingProjects(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0)
  const discountAmount = (subtotal * discount) / 100
  const afterDiscount = subtotal - discountAmount
  const gstAmount = (afterDiscount * gstPercent) / 100
  const grandTotal = afterDiscount + gstAmount

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "qty" || field === "rate") {
          updated.amount = updated.qty * updated.rate
        }
        return updated
      })
    )
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `LI-${Date.now()}`,
      description: "",
      unit: "Nos",
      qty: 0,
      rate: 0,
      amount: 0,
    }
    setLineItems((prev) => [...prev, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id))
  }

  const buildPayload = () => ({
    title,
    projectId: selectedProject,
    items: lineItems.map((li) => ({
      description: li.description,
      unit: li.unit,
      quantity: li.qty,
      unitRate: li.rate,
    })),
    terms,
    notes: description,
  })

  const handleSaveDraft = async () => {
    if (!selectedProject || !title) {
      showError("Project and title are required")
      return
    }
    if (lineItems.length === 0 || lineItems.every((li) => !li.description)) {
      showError("Add at least one line item with a description")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (data.success) {
        if (discount > 0) {
          const patchRes = await fetch(`/api/quotations/${data.data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ discountAmount }),
          })
          const patchData = await patchRes.json()
          if (!patchData.success) {
            showError(patchData.error || "Quotation saved, but discount could not be applied")
          }
        }
        showSuccess("Quotation saved as draft")
        router.push("/quotations")
      } else {
        showError(data.error || "Failed to save quotation")
      }
    } catch {
      showError("Failed to save quotation")
    } finally {
      setSaving(false)
    }
  }

  const handleSendQuotation = async () => {
    if (!selectedProject || !title) {
      showError("Project and title are required")
      return
    }
    if (lineItems.length === 0 || lineItems.every((li) => !li.description)) {
      showError("Add at least one line item with a description")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (data.success) {
        const patchRes = await fetch(`/api/quotations/${data.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quotationStatus: "SENT", discountAmount: discount > 0 ? discountAmount : undefined }),
        })
        const patchData = await patchRes.json()
        if (patchData.success) {
          showSuccess("Quotation sent successfully")
        } else {
          showSuccess("Quotation saved, but status could not be updated")
          showError(patchData.error || "Failed to update quotation status")
        }
        router.push("/quotations")
      } else {
        showError(data.error || "Failed to send quotation")
      }
    } catch {
      showError("Failed to send quotation")
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { number: 1, label: "Project & Details" },
    { number: 2, label: "Line Items" },
    { number: 3, label: "Tax & Terms" },
    { number: 4, label: "Review" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Quotation"
        description="Prepare a new quotation for client submission"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Quotations", href: "/quotations" },
          { label: "New Quotation" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/quotations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotations
            </Link>
          </Button>
        }
      />

      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.number)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                step === s.number
                  ? "bg-primary text-primary-foreground"
                  : step > s.number
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.number ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold">
                  {s.number}
                </span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn("h-px w-8", step > s.number ? "bg-emerald-300" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1: Project & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Project *</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quotation Title *</Label>
                <Input
                  placeholder="e.g. Interior Fit-out Works - Phase 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the quotation scope..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Line Items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Step 2: Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_100px_100px_120px_140px_40px] gap-2 text-xs font-medium text-muted-foreground px-2">
                <span>Description</span>
                <span>Unit</span>
                <span>Qty</span>
                <span>Rate (₹)</span>
                <span className="text-right">Amount (₹)</span>
                <span />
              </div>
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_100px_100px_120px_140px_40px] gap-2 items-center p-2 rounded-lg border bg-background">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    className="h-8"
                  />
                  <Select value={item.unit} onValueChange={(v) => updateLineItem(item.id, "unit", v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nos">Nos</SelectItem>
                      <SelectItem value="Cum">Cum</SelectItem>
                      <SelectItem value="Sqm">Sqm</SelectItem>
                      <SelectItem value="Rmt">Rmt</SelectItem>
                      <SelectItem value="Set">Set</SelectItem>
                      <SelectItem value="Mtr">Mtr</SelectItem>
                      <SelectItem value="Bags">Bags</SelectItem>
                      <SelectItem value="Tonnes">Tonnes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={item.qty || ""}
                    onChange={(e) => updateLineItem(item.id, "qty", Number(e.target.value))}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    value={item.rate || ""}
                    onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))}
                    className="h-8"
                  />
                  <div className="text-right font-medium text-sm pr-2">
                    {formatCurrency(item.amount)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeLineItem(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-lg font-bold">{formatCurrency(subtotal)}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Tax & Terms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 3: Tax, Discount & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>GST % </Label>
                <Select value={String(gstPercent)} onValueChange={(v) => setGstPercent(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount After Discount</Label>
                <div className="h-9 flex items-center px-3 text-sm font-medium border rounded-md bg-muted/50">
                  {formatCurrency(afterDiscount)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                rows={8}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Next: Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 4: Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold">BuildRight Construction Pvt Ltd</h3>
                  <p className="text-sm text-muted-foreground">Survey & Estimation Division</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-lg px-3 py-1">QUOTATION</Badge>
                  <p className="text-sm text-muted-foreground mt-1">Date: {new Date().toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Project</p>
                  <p className="font-medium">{projects.find((p) => p.id === selectedProject)?.name || "Not selected"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Title</p>
                  <p className="font-medium">{title || "Not specified"}</p>
                </div>
              </div>

              {description && (
                <div className="text-sm">
                  <p className="font-medium text-muted-foreground">Description</p>
                  <p>{description}</p>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.description || "—"}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{item.qty.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>GST @ {gstPercent}%</span>
                  <span className="font-medium">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
                <p className="font-medium">Terms & Conditions:</p>
                <pre className="whitespace-pre-wrap font-sans">{terms}</pre>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save as Draft
                </Button>
                <Button onClick={handleSendQuotation} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Quotation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
