"use client"

import { useState, useMemo } from "react"
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
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
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

const projects = [
  { id: "PRJ-001", name: "Worli Sky Residences Tower A" },
  { id: "PRJ-002", name: "BKC Commercial Hub Phase 1" },
  { id: "PRJ-004", name: "Prestige Lake Ridge Villas" },
  { id: "PRJ-008", name: "Brigade Gateway Commercial Tower" },
]

interface BOQItem {
  id: string
  sno: number
  description: string
  category: string
  unit: string
  qty: number
  rate: number
  amount: number
}

const initialBOQItems: BOQItem[] = [
  { id: "BOQ-001", sno: 1, description: "Earthwork excavation in foundation trenches", category: "Earthwork", unit: "Cum", qty: 4500, rate: 320, amount: 1440000 },
  { id: "BOQ-002", sno: 2, description: "Backfilling with approved soil", category: "Earthwork", unit: "Cum", qty: 2800, rate: 180, amount: 504000 },
  { id: "BOQ-003", sno: 3, description: "PCC 1:4:8 in foundation", category: "Concrete", unit: "Cum", qty: 850, rate: 4200, amount: 3570000 },
  { id: "BOQ-004", sno: 4, description: "RCC M30 in footings", category: "Concrete", unit: "Cum", qty: 1200, rate: 5800, amount: 6960000 },
  { id: "BOQ-005", sno: 5, description: "RCC M35 in columns and beams", category: "Concrete", unit: "Cum", qty: 2400, rate: 6200, amount: 14880000 },
  { id: "BOQ-006", sno: 6, description: "RCC M40 in slabs", category: "Concrete", unit: "Cum", qty: 1800, rate: 6500, amount: 11700000 },
  { id: "BOQ-007", sno: 7, description: "Brickwork in CM 1:6 (9\" thick)", category: "Masonry", unit: "Cum", qty: 3200, rate: 4800, amount: 15360000 },
  { id: "BOQ-008", sno: 8, description: "Partition walls 4.5\" thick", category: "Masonry", unit: "Cum", qty: 1500, rate: 5200, amount: 7800000 },
  { id: "BOQ-009", sno: 9, description: "Cement plaster 12mm thick (internal)", category: "Finishing", unit: "Sqm", qty: 18500, rate: 185, amount: 3422500 },
  { id: "BOQ-010", sno: 10, description: "Cement plaster 20mm thick (external)", category: "Finishing", unit: "Sqm", qty: 8200, rate: 220, amount: 1804000 },
  { id: "BOQ-011", sno: 11, description: "Vitrified tile flooring 600x600", category: "Finishing", unit: "Sqm", qty: 12000, rate: 680, amount: 8160000 },
  { id: "BOQ-012", sno: 12, description: "Marble flooring 20mm thick", category: "Finishing", unit: "Sqm", qty: 3500, rate: 1800, amount: 6300000 },
  { id: "BOQ-013", sno: 13, description: "Water supply piping CPVC 1.25\"", category: "Plumbing", unit: "Rmt", qty: 6500, rate: 285, amount: 1852500 },
  { id: "BOQ-014", sno: 14, description: "SWR drainage piping PVC 4\"", category: "Plumbing", unit: "Rmt", qty: 4200, rate: 245, amount: 1029000 },
  { id: "BOQ-015", sno: 15, description: "CP sanitary fittings (basin, WC, shower)", category: "Plumbing", unit: "Set", qty: 180, rate: 28500, amount: 5130000 },
  { id: "BOQ-016", sno: 16, description: "FRP conduit and wiring", category: "Electrical", unit: "Rmt", qty: 15000, rate: 125, amount: 1875000 },
  { id: "BOQ-017", sno: 17, description: "Copper cable 4-core 3.5sqmm", category: "Electrical", unit: "Mtr", qty: 8500, rate: 380, amount: 3230000 },
  { id: "BOQ-018", sno: 18, description: "Modular switches and sockets", category: "Electrical", unit: "Nos", qty: 2400, rate: 450, amount: 1080000 },
  { id: "BOQ-019", sno: 19, description: "AHU and ducting work", category: "HVAC", unit: "Sqm", qty: 4500, rate: 850, amount: 3825000 },
  { id: "BOQ-020", sno: 20, description: "Split AC units 1.5TR", category: "HVAC", unit: "Nos", qty: 120, rate: 42000, amount: 5040000 },
  { id: "BOQ-021", sno: 21, description: "Fire fighting sprinkler system", category: "Plumbing", unit: "Sqm", qty: 8000, rate: 320, amount: 2560000 },
  { id: "BOQ-022", sno: 22, description: "Lift installation 13-person capacity", category: "HVAC", unit: "Nos", qty: 6, rate: 8500000, amount: 51000000 },
]

export default function BOQPage() {
  const [selectedProject, setSelectedProject] = useState("all")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const cats = [...new Set(initialBOQItems.map((i) => i.category))]
    const initial: Record<string, boolean> = {}
    cats.forEach((c) => { initial[c] = true })
    return initial
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [items, setItems] = useState(initialBOQItems)

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const groupedItems = useMemo(() => {
    const groups: Record<string, BOQItem[]> = {}
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [items])

  const categories = Object.keys(groupedItems)

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    Object.entries(groupedItems).forEach(([cat, catItems]) => {
      totals[cat] = catItems.reduce((sum, item) => sum + item.amount, 0)
    })
    return totals
  }, [groupedItems])

  const grandTotal = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
  const gstAmount = grandTotal * 0.18
  const netTotal = grandTotal + gstAmount

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
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
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print BOQ
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New BOQ Item
            </Button>
          </div>
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
          label="GST (18%)"
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">BOQ Items</CardTitle>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-sm">{category}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {catItems.length} items
                    </Badge>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(catTotal)}</span>
                </button>
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
                      {catItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{item.sno}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{item.qty.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6} className="font-semibold text-right">
                          Subtotal ({category})
                        </TableCell>
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
              <span className="font-semibold">{formatCurrency(grandTotal)}</span>
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
        </CardContent>
      </Card>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add BOQ Item"
        description="Add a new line item to the Bill of Quantities"
        maxWidth="lg"
        onCancel={() => setShowAddModal(false)}
        onConfirm={() => setShowAddModal(false)}
        confirmLabel="Add Item"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Item description" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cum">Cum</SelectItem>
                  <SelectItem value="Sqm">Sqm</SelectItem>
                  <SelectItem value="Rmt">Rmt</SelectItem>
                  <SelectItem value="Nos">Nos</SelectItem>
                  <SelectItem value="Set">Set</SelectItem>
                  <SelectItem value="Mtr">Mtr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Rate (₹)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
