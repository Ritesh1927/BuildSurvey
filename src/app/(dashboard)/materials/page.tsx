"use client"

import { useState, useMemo } from "react"
import {
  Box,
  Download,
  MoreHorizontal,
  Package,
  Plus,
  ShoppingCart,
  Truck,
} from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

const categories = ["Construction", "Electrical", "Plumbing", "Finishing", "Safety"] as const

const mockMaterials = [
  { id: "MAT-001", name: "OPC 53 Grade Cement", specification: "UltraTech 50kg bag, IS 12269", survey: "SRY-2024-003", category: "Construction", quantity: 2500, unit: "Bags", estimatedCost: 1875000, actualCost: 1837500, supplier: "UltraTech Cement Ltd", status: "Ordered", project: "Worli Sky Residences Tower A" },
  { id: "MAT-002", name: "TMT Steel Bars Fe-500D", specification: "Tata Tiscon 12mm, IS 1786", survey: "SRY-2024-003", category: "Construction", quantity: 180, unit: "Tonnes", estimatedCost: 12600000, actualCost: 12150000, supplier: "Tata Steel Ltd", status: "Ordered", project: "Worli Sky Residences Tower A" },
  { id: "MAT-003", name: "Red Clay Bricks", specification: "Class A, 230x115x75mm, IS 1077", survey: "SRY-2024-005", category: "Construction", quantity: 150000, unit: "Nos", estimatedCost: 1125000, actualCost: 0, supplier: "Lodha Bricks", status: "Pending", project: "Prestige Lake Ridge Villas" },
  { id: "MAT-004", name: "M-Sand (Manufactured Sand)", specification: "Zone II, IS 383", survey: "SRY-2024-008", category: "Construction", quantity: 500, unit: "Cum", estimatedCost: 2500000, actualCost: 2375000, supplier: "Arihant Mines Pvt Ltd", status: "Ordered", project: "Delhi-Meerut Expressway Section 3" },
  { id: "MAT-005", name: "Ready Mix Concrete M30", specification: "IS 4926, 28-day strength 30 MPa", survey: "SRY-2024-003", category: "Construction", quantity: 1200, unit: "Cum", estimatedCost: 9600000, actualCost: 8400000, supplier: "UltraTech RMC", status: "Ordered", project: "Worli Sky Residences Tower A" },
  { id: "MAT-006", name: "FRP Electrical Conduits", specification: "25mm heavy duty, IS 14827", survey: "SRY-2024-001", category: "Electrical", quantity: 8000, unit: "Rmt", estimatedCost: 640000, actualCost: 0, supplier: "Havells India Ltd", status: "Pending", project: "BKC Commercial Hub Phase 1" },
  { id: "MAT-007", name: "4-Core Copper Cable", specification: "3.5 sq mm, FR-LSH, IS 694", survey: "SRY-2024-001", category: "Electrical", quantity: 5000, unit: "Meters", estimatedCost: 1750000, actualCost: 1662500, supplier: "Polycab Wires Ltd", status: "Ordered", project: "BKC Commercial Hub Phase 1" },
  { id: "MAT-008", name: "MCB Distribution Board", specification: "12-Way, 100A, IS 8828", survey: "SRY-2024-010", category: "Electrical", quantity: 48, unit: "Nos", estimatedCost: 288000, actualCost: 0, supplier: "Schneider Electric", status: "Pending", project: "Oberoi Three Sixty West" },
  { id: "MAT-009", name: "CPVC Pipes 1.25 inch", specification: "ASTM F442, SDR 11, IS 15778", survey: "SRY-2024-005", category: "Plumbing", quantity: 2400, unit: "Rmt", estimatedCost: 360000, actualCost: 342000, supplier: "Astral Pipes", status: "Ordered", project: "Prestige Lake Ridge Villas" },
  { id: "MAT-010", name: "PVC Soil Pipe 4 inch", specification: "SWR, IS 13592, 6kg/cm²", survey: "SRY-2024-005", category: "Plumbing", quantity: 1800, unit: "Rmt", estimatedCost: 270000, actualCost: 0, supplier: "Supreme Industries", status: "Pending", project: "Prestige Lake Ridge Villas" },
  { id: "MAT-011", name: "Griffon Waterproofing Compound", specification: "Cementitious, 2-component, IS 2690", survey: "SRY-2024-007", category: "Construction", quantity: 320, unit: "Kgs", estimatedCost: 480000, actualCost: 456000, supplier: "Fosroc India", status: "Ordered", project: "Adani Ahmedabad Airport Expansion" },
  { id: "MAT-012", name: "Asian Paints Apex Ultima", specification: "Exterior, weatherproof, 20L", survey: "SRY-2024-006", category: "Finishing", quantity: 120, unit: "Buckets", estimatedCost: 720000, actualCost: 0, supplier: "Asian Paints Ltd", status: "Pending", project: "Brigade Gateway Commercial Tower" },
  { id: "MAT-013", name: "Vitrified Floor Tiles", specification: "600x600mm, Grade A3, IS 15622", survey: "SRY-2024-006", category: "Finishing", quantity: 8500, unit: "Sqft", estimatedCost: 2125000, actualCost: 2018750, supplier: "Kajaria Ceramics", status: "Ordered", project: "Brigade Gateway Commercial Tower" },
  { id: "MAT-014", name: "Scaffold Safety Helmets", specification: "IS 15652, Class C, Yellow", survey: "SRY-2024-010", category: "Safety", quantity: 200, unit: "Nos", estimatedCost: 100000, actualCost: 96000, supplier: "3M India Ltd", status: "Ordered", project: "Oberoi Three Sixty West" },
  { id: "MAT-015", name: "Fire Extinguisher ABC Type", specification: "9kg, IS 15683, BIS Certified", survey: "SRY-2024-011", category: "Safety", quantity: 24, unit: "Nos", estimatedCost: 72000, actualCost: 0, supplier: "Godrej Fire Fighting", status: "Pending", project: "Ircon Bridge Reconstruction - Bihar" },
  { id: "MAT-016", name: "HVAC Copper Tubing", specification: "12.7mm, Type L, IS 15457", survey: "SRY-2024-012", category: "Construction", quantity: 350, unit: "Rmt", estimatedCost: 525000, actualCost: 498750, supplier: "Hindustan Copper Ltd", status: "Ordered", project: "DLF Cyber City Phase 2" },
  { id: "MAT-017", name: "Marble Slabs Italian", specification: "Statuario White, 20mm thick", survey: "SRY-2024-014", category: "Finishing", quantity: 650, unit: "Sqft", estimatedCost: 5850000, actualCost: 0, supplier: "Classic Marble Company", status: "Pending", project: "Tata Housing Primanti Floors" },
]

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  Ordered: "success",
  Pending: "warning",
  Delivered: "info",
  Cancelled: "destructive",
  "Partially Received": "secondary",
}

export default function MaterialsPage() {
  const [showModal, setShowModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter((m) => {
      const matchesCategory = categoryFilter === "all" || m.category === categoryFilter
      const matchesStatus = statusFilter === "all" || m.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.specification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [categoryFilter, statusFilter, searchQuery])

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, typeof filteredMaterials> = {}
    filteredMaterials.forEach((m) => {
      if (!groups[m.category]) groups[m.category] = []
      groups[m.category].push(m)
    })
    return groups
  }, [filteredMaterials])

  const totalEstimatedCost = mockMaterials.reduce((sum, m) => sum + m.estimatedCost, 0)
  const pendingCount = mockMaterials.filter((m) => m.status === "Pending").length
  const orderedCount = mockMaterials.filter((m) => m.status === "Ordered").length

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Specification", "Category", "Quantity", "Unit", "Estimated Cost", "Supplier", "Status"]
    const rows = filteredMaterials.map((m) =>
      [m.id, m.name, m.specification, m.category, m.quantity, m.unit, m.estimatedCost, m.supplier, m.status].join(",")
    )
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "materials.csv"
    a.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Requirements"
        description="Manage and track all material requirements across projects"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Materials" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Items"
          value={mockMaterials.length}
          icon={<Package className="h-6 w-6" />}
          color="default"
        />
        <StatCard
          label="Total Estimated Cost"
          value={formatCurrency(totalEstimatedCost)}
          icon={<Box className="h-6 w-6" />}
          color="info"
        />
        <StatCard
          label="Items Pending"
          value={pendingCount}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          label="Items Ordered"
          value={orderedCount}
          icon={<Truck className="h-6 w-6" />}
          color="success"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                placeholder="Search materials..."
                className="w-[220px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedMaterials).map(([category, items]) => {
            const categoryTotal = items.reduce((sum, m) => sum + m.estimatedCost, 0)
            return (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3 px-2 py-2 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-sm">{category}</h3>
                  <span className="text-sm text-muted-foreground">
                    {items.length} items · {formatCurrency(categoryTotal)}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Specification</TableHead>
                      <TableHead>Survey</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Est. Cost</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{material.id}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {material.specification}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{material.survey}</TableCell>
                        <TableCell className="text-right font-medium">
                          {material.quantity.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm">{material.unit}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(material.estimatedCost)}
                        </TableCell>
                        <TableCell className="text-sm">{material.supplier}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[material.status] || "secondary"}>
                            {material.status}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Material</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })}
          {filteredMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No materials found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title="Add Material Requirement"
        description="Enter material details for procurement"
        maxWidth="lg"
        onCancel={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        confirmLabel="Add Material"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material Name</Label>
              <Input placeholder="e.g. OPC 53 Grade Cement" />
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
          <div className="space-y-2">
            <Label>Specification</Label>
            <Input placeholder="e.g. UltraTech 50kg bag, IS 12269" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bags">Bags</SelectItem>
                  <SelectItem value="Tonnes">Tonnes</SelectItem>
                  <SelectItem value="Nos">Nos</SelectItem>
                  <SelectItem value="Cum">Cum</SelectItem>
                  <SelectItem value="Rmt">Rmt</SelectItem>
                  <SelectItem value="Meters">Meters</SelectItem>
                  <SelectItem value="Sqft">Sqft</SelectItem>
                  <SelectItem value="Kgs">Kgs</SelectItem>
                  <SelectItem value="Buckets">Buckets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost (₹)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input placeholder="e.g. UltraTech Cement Ltd" />
            </div>
            <div className="space-y-2">
              <Label>Related Survey</Label>
              <Input placeholder="e.g. SRY-2024-003" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Additional requirements or notes..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}
