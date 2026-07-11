"use client"

import { useState } from "react"
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

const projectData: Record<string, {
  id: string
  name: string
  client: string
  budget: number
  boqItems: {
    id: string
    sno: number
    description: string
    category: string
    unit: string
    qty: number
    rate: number
    estimatedAmount: number
    actualAmount: number
  }[]
  versions: { version: string; date: string; author: string; changes: string }[]
}> = {
  "PRJ-001": {
    id: "PRJ-001",
    name: "Worli Sky Residences Tower A",
    client: "L&T Realty",
    budget: 12500000,
    boqItems: [
      { id: "B1-001", sno: 1, description: "Pile foundation 600mm dia", category: "Foundation", unit: "Rmt", qty: 3200, rate: 4800, estimatedAmount: 15360000, actualAmount: 14880000 },
      { id: "B1-002", sno: 2, description: "Pile cap RCC M35", category: "Foundation", unit: "Cum", qty: 850, rate: 5600, estimatedAmount: 4760000, actualAmount: 4520000 },
      { id: "B1-003", sno: 3, description: "RCC columns M40", category: "Structure", unit: "Cum", qty: 2100, rate: 6200, estimatedAmount: 13020000, actualAmount: 13540000 },
      { id: "B1-004", sno: 4, description: "RCC beams M35", category: "Structure", unit: "Cum", qty: 1800, rate: 5800, estimatedAmount: 10440000, actualAmount: 10120000 },
      { id: "B1-005", sno: 5, description: "RCC slabs M40", category: "Structure", unit: "Cum", qty: 3200, rate: 6500, estimatedAmount: 20800000, actualAmount: 21200000 },
      { id: "B1-006", sno: 6, description: "Brickwork 9 inch thick", category: "Masonry", unit: "Cum", qty: 4500, rate: 4800, estimatedAmount: 21600000, actualAmount: 20700000 },
      { id: "B1-007", sno: 7, description: "Internal plaster 12mm", category: "Finishing", unit: "Sqm", qty: 22000, rate: 185, estimatedAmount: 4070000, actualAmount: 3850000 },
      { id: "B1-008", sno: 8, description: "Vitrified tile flooring", category: "Finishing", unit: "Sqm", qty: 15000, rate: 680, estimatedAmount: 10200000, actualAmount: 9600000 },
      { id: "B1-009", sno: 9, description: "CPVC water supply piping", category: "Plumbing", unit: "Rmt", qty: 8000, rate: 285, estimatedAmount: 2280000, actualAmount: 2150000 },
      { id: "B1-010", sno: 10, description: "FRP electrical conduit wiring", category: "Electrical", unit: "Rmt", qty: 18000, rate: 125, estimatedAmount: 2250000, actualAmount: 2180000 },
      { id: "B1-011", sno: 11, description: "AHU and ducting system", category: "HVAC", unit: "Sqm", qty: 5500, rate: 850, estimatedAmount: 4675000, actualAmount: 4500000 },
      { id: "B1-012", sno: 12, description: "Fire sprinkler system", category: "Plumbing", unit: "Sqm", qty: 10000, rate: 320, estimatedAmount: 3200000, actualAmount: 3050000 },
    ],
    versions: [
      { version: "v3.2", date: "2024-11-20", author: "Amit Deshmukh", changes: "Updated HVAC rates based on revised specifications" },
      { version: "v3.1", date: "2024-11-10", author: "Priya Nair", changes: "Added fire sprinkler system items" },
      { version: "v3.0", date: "2024-10-15", author: "Amit Deshmukh", changes: "Major revision - updated all rates per Q3 market prices" },
      { version: "v2.0", date: "2024-06-01", author: "Rajesh Kumar", changes: "Revised quantities after structural design update" },
      { version: "v1.0", date: "2024-01-15", author: "Amit Deshmukh", changes: "Initial BOQ preparation" },
    ],
  },
}

const defaultProject = projectData["PRJ-001"]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProjectBOQPage({ params: _params }: { params: Promise<{ projectId: string }> }) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const cats = [...new Set(defaultProject.boqItems.map((i) => i.category))]
    const initial: Record<string, boolean> = {}
    cats.forEach((c) => { initial[c] = true })
    return initial
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [items, setItems] = useState(defaultProject.boqItems)

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const groupedItems: Record<string, typeof items> = {}
  items.forEach((item) => {
    if (!groupedItems[item.category]) groupedItems[item.category] = []
    groupedItems[item.category].push(item)
  })
  const categories = Object.keys(groupedItems)

  const categoryTotals: Record<string, { estimated: number; actual: number }> = {}
  Object.entries(groupedItems).forEach(([cat, catItems]) => {
    categoryTotals[cat] = {
      estimated: catItems.reduce((s, i) => s + i.estimatedAmount, 0),
      actual: catItems.reduce((s, i) => s + i.actualAmount, 0),
    }
  })

  const totalEstimated = Object.values(categoryTotals).reduce((s, v) => s + v.estimated, 0)
  const totalActual = Object.values(categoryTotals).reduce((s, v) => s + v.actual, 0)
  const variance = totalEstimated - totalActual
  const variancePercent = ((variance / totalEstimated) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${defaultProject.name} — BOQ`}
        description={`Client: ${defaultProject.client} · Budget: ${formatCurrency(defaultProject.budget)}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "BOQ", href: "/boq" },
          { label: defaultProject.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/boq">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to BOQ
              </Link>
            </Button>
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Items" value={items.length} icon={<FileText className="h-6 w-6" />} color="default" />
        <StatCard label="Estimated Amount" value={formatCurrency(totalEstimated)} icon={<FileSpreadsheet className="h-6 w-6" />} color="info" />
        <StatCard label="Actual Amount" value={formatCurrency(totalActual)} icon={<FileSpreadsheet className="h-6 w-6" />} color="warning" />
        <StatCard
          label="Variance"
          value={`${variance >= 0 ? "+" : ""}${formatCurrency(variance)}`}
          icon={<FileText className="h-6 w-6" />}
          color={variance >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Variance %"
          value={`${variance >= 0 ? "+" : ""}${variancePercent}%`}
          icon={<Clock className="h-6 w-6" />}
          color={variance >= 0 ? "success" : "danger"}
        />
      </div>

      <Tabs defaultValue="boq">
        <TabsList>
          <TabsTrigger value="boq">BOQ Items</TabsTrigger>
          <TabsTrigger value="comparison">Est. vs Actual</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="boq">
          <Card>
            <CardContent className="pt-6">
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
                      <span className="font-semibold text-sm">{formatCurrency(catTotal.estimated)}</span>
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
                              <TableCell className="font-mono text-xs">{item.sno}</TableCell>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell className="text-right">{item.qty.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(item.estimatedAmount)}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={5} className="font-semibold text-right">Subtotal ({category})</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(catTotal.estimated)}</TableCell>
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
                  <span className="font-semibold">{formatCurrency(totalEstimated * 0.18)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-primary/5 rounded-lg border-t-2 border-primary">
                  <span className="font-bold text-lg">Grand Total (incl. GST)</span>
                  <span className="font-bold text-lg">{formatCurrency(totalEstimated * 1.18)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estimated vs Actual Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Estimated (₹)</TableHead>
                    <TableHead className="text-right">Actual (₹)</TableHead>
                    <TableHead className="text-right">Variance (₹)</TableHead>
                    <TableHead className="text-right">Variance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => {
                    const est = categoryTotals[cat].estimated
                    const act = categoryTotals[cat].actual
                    const v = est - act
                    const vp = ((v / est) * 100).toFixed(1)
                    const isOver = v < 0
                    return (
                      <TableRow key={cat}>
                        <TableCell className="font-medium">{cat}</TableCell>
                        <TableCell className="text-right">{formatCurrency(est)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(act)}</TableCell>
                        <TableCell className={cn("text-right font-medium", isOver ? "text-red-600" : "text-emerald-600")}>
                          {v >= 0 ? "+" : ""}{formatCurrency(v)}
                        </TableCell>
                        <TableCell className={cn("text-right font-medium", isOver ? "text-red-600" : "text-emerald-600")}>
                          {v >= 0 ? "+" : ""}{vp}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={isOver ? "destructive" : "success"}>
                            {isOver ? "Over Budget" : "Under Budget"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalEstimated)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalActual)}</TableCell>
                    <TableCell className={cn("text-right", variance < 0 ? "text-red-600" : "text-emerald-600")}>
                      {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                    </TableCell>
                    <TableCell className={cn("text-right", variance < 0 ? "text-red-600" : "text-emerald-600")}>
                      {variance >= 0 ? "+" : ""}{variancePercent}%
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defaultProject.versions.map((v, i) => (
                  <div key={v.version} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {v.version}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{v.version}</span>
                        <span className="text-sm text-muted-foreground">· {v.author}</span>
                        <span className="text-sm text-muted-foreground">
                          · {new Date(v.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{v.changes}</p>
                    </div>
                    {i === 0 && <Badge variant="success">Current</Badge>}
                  </div>
                ))}
              </div>
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
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cum">Cum</SelectItem>
                  <SelectItem value="Sqm">Sqm</SelectItem>
                  <SelectItem value="Rmt">Rmt</SelectItem>
                  <SelectItem value="Nos">Nos</SelectItem>
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
