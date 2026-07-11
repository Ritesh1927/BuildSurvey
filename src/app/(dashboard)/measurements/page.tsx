"use client"

import { useState } from "react"
import { 
  Ruler, Plus, Search, Download, Trash2, Edit, 
  MoreHorizontal, Calculator, FileText, Filter, 
  ChevronDown, Link2, AlertCircle
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Modal } from "@/components/ui/modal"

const measurements = [
  { id: 1, category: "Room", description: "Living Room - Main Hall", length: 8.5, width: 6.2, height: 3.0, area: 52.7, volume: 158.1, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Main living area with open floor plan" },
  { id: 2, category: "Room", description: "Master Bedroom", length: 5.5, width: 4.8, height: 3.0, area: 26.4, volume: 79.2, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Includes walk-in closet area" },
  { id: 3, category: "Room", description: "Kitchen", length: 4.2, width: 3.8, height: 3.0, area: 15.96, volume: 47.88, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Galley style layout" },
  { id: 4, category: "Room", description: "Bathroom - Master", length: 3.5, width: 2.8, height: 3.0, area: 9.8, volume: 29.4, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "En-suite with shower and bathtub" },
  { id: 5, category: "Room", description: "Office Space", length: 4.0, width: 3.5, height: 3.0, area: 14.0, volume: 42.0, unit: "m", survey: "SUR-002", project: "Green Valley Office Park", notes: "Ground floor office unit" },
  { id: 6, category: "Floor", description: "Ground Floor Slab", length: 45.0, width: 30.0, height: 0.3, area: 1350.0, volume: 405.0, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Reinforced concrete slab, M30 grade" },
  { id: 7, category: "Floor", description: "First Floor Slab", length: 45.0, width: 30.0, height: 0.25, area: 1350.0, volume: 337.5, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Post-tensioned slab" },
  { id: 8, category: "Wall", description: "External Wall - North", length: 45.0, width: 0.3, height: 3.5, area: 157.5, volume: 47.25, unit: "m", survey: "SUR-007", project: "Heritage Building Renovation", notes: "Load-bearing masonry wall" },
  { id: 9, category: "Wall", description: "Internal Partition - Type A", length: 6.0, width: 0.15, height: 3.0, area: 18.0, volume: 2.7, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Gypsum board partition" },
  { id: 10, category: "Ceiling", description: "Ground Floor Ceiling", length: 45.0, width: 30.0, height: 0.02, area: 1350.0, volume: 27.0, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Suspended ceiling system" },
  { id: 11, category: "Door", description: "Main Entrance", length: 1.8, width: 0.05, height: 2.4, area: 4.32, volume: 0.216, unit: "m", survey: "SUR-004", project: "Downtown Mall Expansion", notes: "Double leaf aluminum door" },
  { id: 12, category: "Door", description: "Interior Door - Standard", length: 0.9, width: 0.04, height: 2.1, area: 1.89, volume: 0.0756, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Flush door, 35mm thick" },
  { id: 13, category: "Window", description: "Living Room Window", length: 2.4, width: 0.02, height: 1.5, area: 3.6, volume: 0.072, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "UPVC sliding window" },
  { id: 14, category: "Window", description: "Bedroom Window", length: 1.8, width: 0.02, height: 1.2, area: 2.16, volume: 0.0432, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "UPVC casement window" },
  { id: 15, category: "External", description: "Parking Area", length: 25.0, width: 15.0, height: 0.15, area: 375.0, volume: 56.25, unit: "m", survey: "SUR-001", project: "Riverside Tower Complex", notes: "Paved parking surface" },
]

const categories = ["All Categories", "Room", "Floor", "Wall", "Ceiling", "Door", "Window", "External"]

const categoryColors: Record<string, string> = {
  Room: "bg-blue-100 text-blue-800",
  Floor: "bg-emerald-100 text-emerald-800",
  Wall: "bg-amber-100 text-amber-800",
  Ceiling: "bg-purple-100 text-purple-800",
  Door: "bg-cyan-100 text-cyan-800",
  Window: "bg-pink-100 text-pink-800",
  External: "bg-orange-100 text-orange-800",
}

export default function MeasurementsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState({
    category: "",
    description: "",
    length: "",
    width: "",
    height: "",
    unit: "m",
    notes: "",
  })

  const filteredMeasurements = measurements.filter((m) => {
    const matchesSearch = m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || m.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalArea = filteredMeasurements.reduce((sum, m) => sum + m.area, 0)
  const totalVolume = filteredMeasurements.reduce((sum, m) => sum + m.volume, 0)

  const exportToCSV = () => {
    const headers = ["Category", "Description", "Length", "Width", "Height", "Area", "Volume", "Unit", "Notes"]
    const rows = filteredMeasurements.map((m) => [
      m.category, m.description, m.length, m.width, m.height, m.area, m.volume, m.unit, m.notes
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "measurements.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Measurements"
        description="Track and manage all construction measurements"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Measurements" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Measurement
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Ruler className="h-6 w-6" />}
          label="Total Measurements"
          value={filteredMeasurements.length}
          color="default"
        />
        <StatCard
          icon={<Calculator className="h-6 w-6" />}
          label="Total Area"
          value={`${totalArea.toFixed(1)} m²`}
          color="info"
        />
        <StatCard
          icon={<Calculator className="h-6 w-6" />}
          label="Total Volume"
          value={`${totalVolume.toFixed(1)} m³`}
          color="success"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label="Categories"
          value={new Set(filteredMeasurements.map((m) => m.category)).size}
          color="warning"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search measurements..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredMeasurements.length} measurements
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Length (m)</TableHead>
                <TableHead className="text-right">Width (m)</TableHead>
                <TableHead className="text-right">Height (m)</TableHead>
                <TableHead className="text-right">Area (m²)</TableHead>
                <TableHead className="text-right">Volume (m³)</TableHead>
                <TableHead>Survey</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeasurements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${categoryColors[m.category]}`}>
                      {m.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{m.description}</p>
                      <p className="text-xs text-muted-foreground max-w-[200px] truncate">{m.notes}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{m.length}</TableCell>
                  <TableCell className="text-right font-mono">{m.width}</TableCell>
                  <TableCell className="text-right font-mono">{m.height}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{m.area}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{m.volume}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      <Link2 className="h-3 w-3 mr-1" />
                      {m.survey}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 className="h-4 w-4 mr-2" />
                          View Survey
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add Measurement"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={newMeasurement.category} onValueChange={(v) => setNewMeasurement({ ...newMeasurement, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room">Room</SelectItem>
                  <SelectItem value="Floor">Floor</SelectItem>
                  <SelectItem value="Wall">Wall</SelectItem>
                  <SelectItem value="Ceiling">Ceiling</SelectItem>
                  <SelectItem value="Door">Door</SelectItem>
                  <SelectItem value="Window">Window</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="e.g., Living Room - Main Hall"
                value={newMeasurement.description}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, description: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Length *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newMeasurement.length}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, length: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Width *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newMeasurement.width}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, width: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Height *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newMeasurement.height}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, height: e.target.value })}
              />
            </div>
          </div>
          {newMeasurement.length && newMeasurement.width && newMeasurement.height && (
            <div className="p-3 rounded-lg bg-muted/50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="font-medium">
                  {(parseFloat(newMeasurement.length) * parseFloat(newMeasurement.width)).toFixed(2)} m²
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="font-medium">
                  {(parseFloat(newMeasurement.length) * parseFloat(newMeasurement.width) * parseFloat(newMeasurement.height)).toFixed(2)} m³
                </p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Additional notes..."
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
