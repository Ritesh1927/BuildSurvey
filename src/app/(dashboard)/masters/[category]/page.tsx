"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Search,
  ArrowLeft,
  GripVertical,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react"
import Link from "next/link"

import { cn, getStatusColor } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MasterItem {
  id: string
  code: string
  name: string
  description: string
  unit: string
  parentCategory: string
  status: "active" | "inactive"
  sortOrder: number
}

const categoryData: Record<
  string,
  {
    name: string
    description: string
    items: MasterItem[]
  }
> = {
  "material-types": {
    name: "Material Types",
    description: "Define all construction material types used across projects",
    items: [
      { id: "1", code: "MAT-001", name: "OPC Cement 43 Grade", description: "Ordinary Portland Cement 43 Grade for general construction", unit: "Bag (50kg)", parentCategory: "Cement", status: "active", sortOrder: 1 },
      { id: "2", code: "MAT-002", name: "OPC Cement 53 Grade", description: "High strength cement for RCC works", unit: "Bag (50kg)", parentCategory: "Cement", status: "active", sortOrder: 2 },
      { id: "3", code: "MAT-003", name: "PPC Cement", description: "Portland Pozzolana Cement for durability", unit: "Bag (50kg)", parentCategory: "Cement", status: "active", sortOrder: 3 },
      { id: "4", code: "MAT-004", name: "TMT Steel Bar 8mm", description: "Fe-500D TMT bars for stirrups", unit: "Kg", parentCategory: "Steel", status: "active", sortOrder: 4 },
      { id: "5", code: "MAT-005", name: "TMT Steel Bar 12mm", description: "Fe-500D TMT bars for beams", unit: "Kg", parentCategory: "Steel", status: "active", sortOrder: 5 },
      { id: "6", code: "MAT-006", name: "TMT Steel Bar 16mm", description: "Fe-500D TMT bars for columns", unit: "Kg", parentCategory: "Steel", status: "active", sortOrder: 6 },
      { id: "7", code: "MAT-007", name: "TMT Steel Bar 20mm", description: "Fe-500D TMT bars for heavy RCC", unit: "Kg", parentCategory: "Steel", status: "active", sortOrder: 7 },
      { id: "8", code: "MAT-008", name: "Red Clay Bricks", description: "Standard size 9x4.5x3 inch", unit: "Nos", parentCategory: "Bricks", status: "active", sortOrder: 8 },
      { id: "9", code: "MAT-009", name: "AAC Blocks", description: "Autoclaved Aerated Concrete Blocks 600x200x100mm", unit: "Nos", parentCategory: "Bricks", status: "active", sortOrder: 9 },
      { id: "10", code: "MAT-010", name: "River Sand (Fine)", description: "Clean river sand for plastering", unit: "Cu Ft", parentCategory: "Sand", status: "active", sortOrder: 10 },
      { id: "11", code: "MAT-011", name: "M-Sand (Manufactured)", description: "Machine-made sand for concrete", unit: "Cu Ft", parentCategory: "Sand", status: "active", sortOrder: 11 },
      { id: "12", code: "MAT-012", name: "20mm Aggregates", description: "Crushed stone 20mm for concrete", unit: "Cu Ft", parentCategory: "Aggregates", status: "active", sortOrder: 12 },
    ],
  },
  "measurement-units": {
    name: "Measurement Units",
    description: "Standard measurement units for BOQ and estimation",
    items: [
      { id: "1", code: "UNT-001", name: "Sq Ft", description: "Square Feet - Area measurement", unit: "Sq Ft", parentCategory: "Area", status: "active", sortOrder: 1 },
      { id: "2", code: "UNT-002", name: "Sq M", description: "Square Meter - SI area unit", unit: "Sq M", parentCategory: "Area", status: "active", sortOrder: 2 },
      { id: "3", code: "UNT-003", name: "Sq Yd", description: "Square Yard - Imperial area unit", unit: "Sq Yd", parentCategory: "Area", status: "active", sortOrder: 3 },
      { id: "4", code: "UNT-004", name: "Cu Ft", description: "Cubic Feet - Volume measurement", unit: "Cu Ft", parentCategory: "Volume", status: "active", sortOrder: 4 },
      { id: "5", code: "UNT-005", name: "Cu M", description: "Cubic Meter - SI volume unit", unit: "Cu M", parentCategory: "Volume", status: "active", sortOrder: 5 },
      { id: "6", code: "UNT-006", name: "Running Ft", description: "Linear measurement in feet", unit: "Rft", parentCategory: "Linear", status: "active", sortOrder: 6 },
      { id: "7", code: "UNT-007", name: "Running M", description: "Linear measurement in meters", unit: "Rmt", parentCategory: "Linear", status: "active", sortOrder: 7 },
      { id: "8", code: "UNT-008", name: "Nos", description: "Number - Count of items", unit: "Nos", parentCategory: "Count", status: "active", sortOrder: 8 },
      { id: "9", code: "UNT-009", name: "Kg", description: "Kilogram - Weight measurement", unit: "Kg", parentCategory: "Weight", status: "active", sortOrder: 9 },
      { id: "10", code: "UNT-010", name: "Quintal", description: "100 Kilograms", unit: "Qtl", parentCategory: "Weight", status: "active", sortOrder: 10 },
      { id: "11", code: "UNT-011", name: "Litre", description: "Volume measurement for liquids", unit: "Ltr", parentCategory: "Volume", status: "active", sortOrder: 11 },
      { id: "12", code: "UNT-012", name: "Bag", description: "Standard bag (50kg for cement)", unit: "Bag", parentCategory: "Count", status: "active", sortOrder: 12 },
      { id: "13", code: "UNT-013", name: "Lot", description: " Lump sum / complete lot", unit: "Lot", parentCategory: "Other", status: "active", sortOrder: 13 },
      { id: "14", code: "UNT-014", name: "Set", description: "Complete set of items", unit: "Set", parentCategory: "Count", status: "active", sortOrder: 14 },
    ],
  },
  "survey-categories": {
    name: "Survey Categories",
    description: "Types of surveys performed during construction",
    items: [
      { id: "1", code: "SRV-001", name: "Topographical Survey", description: "Land mapping and contour analysis", unit: "Sq Ft", parentCategory: "Land Survey", status: "active", sortOrder: 1 },
      { id: "2", code: "SRV-002", name: "Structural Survey", description: "Building structural assessment", unit: "Lot", parentCategory: "Building Survey", status: "active", sortOrder: 2 },
      { id: "3", code: "SRV-003", name: "Electrical Survey", description: "Electrical installation inspection", unit: "Lot", parentCategory: "MEP Survey", status: "active", sortOrder: 3 },
      { id: "4", code: "SRV-004", name: "Plumbing Survey", description: "Plumbing systems inspection", unit: "Lot", parentCategory: "MEP Survey", status: "active", sortOrder: 4 },
      { id: "5", code: "SRV-005", name: "HVAC Survey", description: "Heating, ventilation, AC systems", unit: "Lot", parentCategory: "MEP Survey", status: "active", sortOrder: 5 },
      { id: "6", code: "SRV-006", name: "Fire Safety Survey", description: "Fire protection systems audit", unit: "Lot", parentCategory: "Safety Survey", status: "active", sortOrder: 6 },
      { id: "7", code: "SRV-007", name: "Environmental Survey", description: "Environmental compliance check", unit: "Lot", parentCategory: "Compliance", status: "active", sortOrder: 7 },
      { id: "8", code: "SRV-008", name: "Soil Investigation", description: "Soil testing and bearing capacity", unit: "Nos", parentCategory: "Land Survey", status: "active", sortOrder: 8 },
      { id: "9", code: "SRV-009", name: "Quality Control Survey", description: "Material and workmanship quality", unit: "Lot", parentCategory: "Quality", status: "active", sortOrder: 9 },
      { id: "10", code: "SRV-010", name: "Progress Survey", description: "Construction progress documentation", unit: "Lot", parentCategory: "Progress", status: "active", sortOrder: 10 },
      { id: "11", code: "SRV-011", name: "As-Built Survey", description: "Final as-built documentation", unit: "Lot", parentCategory: "Building Survey", status: "active", sortOrder: 11 },
      { id: "12", code: "SRV-012", name: "GPS Survey", description: "GPS-based location mapping", unit: "Nos", parentCategory: "Land Survey", status: "active", sortOrder: 12 },
    ],
  },
  "project-types": {
    name: "Project Types",
    description: "Categories of construction projects",
    items: [
      { id: "1", code: "PRJ-001", name: "Residential Tower", description: "Multi-story residential buildings", unit: "Nos", parentCategory: "Residential", status: "active", sortOrder: 1 },
      { id: "2", code: "PRJ-002", name: "Villa / Bungalow", description: "Independent residential units", unit: "Nos", parentCategory: "Residential", status: "active", sortOrder: 2 },
      { id: "3", code: "PRJ-003", name: "Commercial Complex", description: "Office buildings and business parks", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 3 },
      { id: "4", code: "PRJ-004", name: "Shopping Mall", description: "Retail and entertainment complexes", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 4 },
      { id: "5", code: "PRJ-005", name: "Highway / Expressway", description: "Road and highway construction", unit: "Km", parentCategory: "Infrastructure", status: "active", sortOrder: 5 },
      { id: "6", code: "PRJ-006", name: "Bridge", description: "Bridge and flyover construction", unit: "Nos", parentCategory: "Infrastructure", status: "active", sortOrder: 6 },
      { id: "7", code: "PRJ-007", name: "Industrial Factory", description: "Manufacturing and industrial facilities", unit: "Nos", parentCategory: "Industrial", status: "active", sortOrder: 7 },
      { id: "8", code: "PRJ-008", name: "Warehouse", description: "Storage and logistics facilities", unit: "Nos", parentCategory: "Industrial", status: "active", sortOrder: 8 },
    ],
  },
  "risk-categories": {
    name: "Risk Categories",
    description: "Risk classification for construction projects",
    items: [
      { id: "1", code: "RSK-001", name: "Safety Hazard", description: "Worker safety and site hazards", unit: "Lot", parentCategory: "Safety", status: "active", sortOrder: 1 },
      { id: "2", code: "RSK-002", name: "Structural Failure", description: "Risk of structural collapse or defect", unit: "Lot", parentCategory: "Technical", status: "active", sortOrder: 2 },
      { id: "3", code: "RSK-003", name: "Material Delay", description: "Supply chain disruption", unit: "Lot", parentCategory: "Operational", status: "active", sortOrder: 3 },
      { id: "4", code: "RSK-004", name: "Weather Impact", description: "Monsoon and extreme weather delays", unit: "Lot", parentCategory: "Environmental", status: "active", sortOrder: 4 },
      { id: "5", code: "RSK-005", name: "Cost Overrun", description: "Budget exceeding projections", unit: "Lot", parentCategory: "Financial", status: "active", sortOrder: 5 },
      { id: "6", code: "RSK-006", name: "Regulatory Non-Compliance", description: "Building code and regulation violations", unit: "Lot", parentCategory: "Legal", status: "active", sortOrder: 6 },
      { id: "7", code: "RSK-007", name: "Soil Instability", description: "Ground condition issues", unit: "Lot", parentCategory: "Technical", status: "active", sortOrder: 7 },
      { id: "8", code: "RSK-008", name: "Labor Shortage", description: "Skilled workforce unavailability", unit: "Lot", parentCategory: "Operational", status: "active", sortOrder: 8 },
      { id: "9", code: "RSK-009", name: "Equipment Breakdown", description: "Machinery failure and maintenance", unit: "Lot", parentCategory: "Operational", status: "active", sortOrder: 9 },
      { id: "10", code: "RSK-010", name: "Environmental Damage", description: "Pollution and ecological impact", unit: "Lot", parentCategory: "Environmental", status: "active", sortOrder: 10 },
    ],
  },
  "document-types": {
    name: "Document Types",
    description: "Document classification for project records",
    items: [
      { id: "1", code: "DOC-001", name: "Invoice", description: "Supplier and vendor invoices", unit: "Nos", parentCategory: "Financial", status: "active", sortOrder: 1 },
      { id: "2", code: "DOC-002", name: "Quotation", description: "Price quotations and proposals", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 2 },
      { id: "3", code: "DOC-003", name: "Bill of Quantities", description: "Detailed BOQ documents", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 3 },
      { id: "4", code: "DOC-004", name: "Contract Agreement", description: "Legal contracts and agreements", unit: "Nos", parentCategory: "Legal", status: "active", sortOrder: 4 },
      { id: "5", code: "DOC-005", name: "Drawing / Blueprint", description: "Architectural and structural drawings", unit: "Nos", parentCategory: "Technical", status: "active", sortOrder: 5 },
      { id: "6", code: "DOC-006", name: "Site Report", description: "Daily and weekly site progress reports", unit: "Nos", parentCategory: "Progress", status: "active", sortOrder: 6 },
      { id: "7", code: "DOC-007", name: "Material Test Report", description: "Lab test results for materials", unit: "Nos", parentCategory: "Quality", status: "active", sortOrder: 7 },
      { id: "8", code: "DOC-008", name: "Photographs", description: "Site progress photographs", unit: "Nos", parentCategory: "Documentation", status: "active", sortOrder: 8 },
      { id: "9", code: "DOC-009", name: "Meeting Minutes", description: "Minutes of project meetings", unit: "Nos", parentCategory: "Communication", status: "active", sortOrder: 9 },
      { id: "10", code: "DOC-010", name: "Payment Receipt", description: "Payment acknowledgements", unit: "Nos", parentCategory: "Financial", status: "active", sortOrder: 10 },
      { id: "11", code: "DOC-011", name: "NOC Certificate", description: "No Objection Certificates", unit: "Nos", parentCategory: "Legal", status: "active", sortOrder: 11 },
      { id: "12", code: "DOC-012", name: "Completion Certificate", description: "Project completion documents", unit: "Nos", parentCategory: "Legal", status: "active", sortOrder: 12 },
      { id: "13", code: "DOC-013", name: "Scope of Work", description: "Detailed SOW documents", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 13 },
      { id: "14", code: "DOC-014", name: "Variation Order", description: "Change order documents", unit: "Nos", parentCategory: "Commercial", status: "active", sortOrder: 14 },
      { id: "15", code: "DOC-015", name: "Safety Checklist", description: "Safety compliance checklists", unit: "Nos", parentCategory: "Safety", status: "active", sortOrder: 15 },
    ],
  },
  "lead-sources": {
    name: "Lead Sources",
    description: "Track where project leads originate from",
    items: [
      { id: "1", code: "LDS-001", name: "Client Referral", description: "Word-of-mouth from existing clients", unit: "Nos", parentCategory: "Referral", status: "active", sortOrder: 1 },
      { id: "2", code: "LDS-002", name: "Professional Referral", description: "Referral from architects, consultants", unit: "Nos", parentCategory: "Referral", status: "active", sortOrder: 2 },
      { id: "3", code: "LDS-003", name: "Website Enquiry", description: "Leads from website contact form", unit: "Nos", parentCategory: "Digital", status: "active", sortOrder: 3 },
      { id: "4", code: "LDS-004", name: "Google Ads", description: "Paid campaigns on Google", unit: "Nos", parentCategory: "Digital", status: "active", sortOrder: 4 },
      { id: "5", code: "LDS-005", name: "Social Media", description: "Leads from social platforms", unit: "Nos", parentCategory: "Digital", status: "active", sortOrder: 5 },
      { id: "6", code: "LDS-006", name: "Walk-in", description: "Direct office visits", unit: "Nos", parentCategory: "Direct", status: "active", sortOrder: 6 },
      { id: "7", code: "LDS-007", name: "Cold Call", description: "Outbound telemarketing", unit: "Nos", parentCategory: "Direct", status: "active", sortOrder: 7 },
      { id: "8", code: "LDS-008", name: "Government Tender", description: "Public sector tenders", unit: "Nos", parentCategory: "Government", status: "active", sortOrder: 8 },
      { id: "9", code: "LDS-009", name: "Property Developer", description: "Direct from real estate developers", unit: "Nos", parentCategory: "Partnership", status: "active", sortOrder: 9 },
    ],
  },
  "payment-terms": {
    name: "Payment Terms",
    description: "Standard payment terms for contracts and quotations",
    items: [
      { id: "1", code: "PAY-001", name: "Net 15", description: "Payment due within 15 days", unit: "Days", parentCategory: "Standard", status: "active", sortOrder: 1 },
      { id: "2", code: "PAY-002", name: "Net 30", description: "Payment due within 30 days", unit: "Days", parentCategory: "Standard", status: "active", sortOrder: 2 },
      { id: "3", code: "PAY-003", name: "Net 60", description: "Payment due within 60 days", unit: "Days", parentCategory: "Standard", status: "active", sortOrder: 3 },
      { id: "4", code: "PAY-004", name: "50% Advance", description: "50% upfront, balance on completion", unit: "%", parentCategory: "Milestone", status: "active", sortOrder: 4 },
      { id: "5", code: "PAY-005", name: "Milestone Based", description: "Payment at project milestones", unit: "%", parentCategory: "Milestone", status: "active", sortOrder: 5 },
      { id: "6", code: "PAY-006", name: "100% Advance", description: "Full payment before work begins", unit: "%", parentCategory: "Milestone", status: "active", sortOrder: 6 },
      { id: "7", code: "PAY-007", name: "COD", description: "Cash on Delivery / Completion", unit: "Lot", parentCategory: "Standard", status: "active", sortOrder: 7 },
    ],
  },
  "tax-codes": {
    name: "Tax Codes",
    description: "GST and other tax configurations",
    items: [
      { id: "1", code: "GST-001", name: "GST 5%", description: "Essential items - food, fuel", unit: "%", parentCategory: "GST", status: "active", sortOrder: 1 },
      { id: "2", code: "GST-002", name: "GST 12%", description: "Processed food, fertilizers", unit: "%", parentCategory: "GST", status: "active", sortOrder: 2 },
      { id: "3", code: "GST-003", name: "GST 18%", description: "Most goods and services", unit: "%", parentCategory: "GST", status: "active", sortOrder: 3 },
      { id: "4", code: "GST-004", name: "GST 28%", description: "Luxury items, cars", unit: "%", parentCategory: "GST", status: "active", sortOrder: 4 },
      { id: "5", code: "GST-005", name: "CGST 9%", description: "Central GST component", unit: "%", parentCategory: "GST Component", status: "active", sortOrder: 5 },
      { id: "6", code: "GST-006", name: "SGST 9%", description: "State GST component", unit: "%", parentCategory: "GST Component", status: "active", sortOrder: 6 },
      { id: "7", code: "GST-007", name: "IGST 18%", description: "Integrated GST for inter-state", unit: "%", parentCategory: "GST Component", status: "active", sortOrder: 7 },
      { id: "8", code: "GST-008", name: "Zero Rated", description: "Export and SEZ supplies", unit: "%", parentCategory: "GST", status: "active", sortOrder: 8 },
      { id: "9", code: "GST-009", name: "Exempt", description: "GST exempt items", unit: "%", parentCategory: "GST", status: "active", sortOrder: 9 },
      { id: "10", code: "GST-010", name: "TDS 1%", description: "Tax Deducted at Source", unit: "%", parentCategory: "TDS", status: "active", sortOrder: 10 },
      { id: "11", code: "GST-011", name: "TDS 2%", description: "TDS on contractor payments", unit: "%", parentCategory: "TDS", status: "active", sortOrder: 11 },
    ],
  },
  locations: {
    name: "City / State / Country",
    description: "Geographic locations with administrative zones",
    items: [
      { id: "1", code: "LOC-001", name: "Maharashtra", description: "State in Western India", unit: "State", parentCategory: "India", status: "active", sortOrder: 1 },
      { id: "2", code: "LOC-002", name: "Mumbai", description: "Financial capital of India", unit: "City", parentCategory: "Maharashtra", status: "active", sortOrder: 2 },
      { id: "3", code: "LOC-003", name: "Pune", description: "IT hub of Maharashtra", unit: "City", parentCategory: "Maharashtra", status: "active", sortOrder: 3 },
      { id: "4", code: "LOC-004", name: "Delhi", description: "National Capital Territory", unit: "State", parentCategory: "India", status: "active", sortOrder: 4 },
      { id: "5", code: "LOC-005", name: "New Delhi", description: "Capital of India", unit: "City", parentCategory: "Delhi", status: "active", sortOrder: 5 },
      { id: "6", code: "LOC-006", name: "Karnataka", description: "State in Southern India", unit: "State", parentCategory: "India", status: "active", sortOrder: 6 },
      { id: "7", code: "LOC-007", name: "Bengaluru", description: "Silicon Valley of India", unit: "City", parentCategory: "Karnataka", status: "active", sortOrder: 7 },
      { id: "8", code: "LOC-008", name: "Gujarat", description: "State in Western India", unit: "State", parentCategory: "India", status: "active", sortOrder: 8 },
      { id: "9", code: "LOC-009", name: "Ahmedabad", description: "Largest city in Gujarat", unit: "City", parentCategory: "Gujarat", status: "active", sortOrder: 9 },
      { id: "10", code: "LOC-010", name: "Tamil Nadu", description: "State in Southern India", unit: "State", parentCategory: "India", status: "active", sortOrder: 10 },
      { id: "11", code: "LOC-011", name: "Chennai", description: "Capital of Tamil Nadu", unit: "City", parentCategory: "Tamil Nadu", status: "active", sortOrder: 11 },
      { id: "12", code: "LOC-012", name: "Rajasthan", description: "Largest state by area", unit: "State", parentCategory: "India", status: "active", sortOrder: 12 },
    ],
  },
}

const fallbackCategory = {
  name: "Category",
  description: "Manage items in this category",
  items: [] as MasterItem[],
}

export default function MasterCategoryPage() {
  const params = useParams()
  const categoryId = params.category as string
  const category = categoryData[categoryId] || fallbackCategory

  const [items, setItems] = useState<MasterItem[]>(category.items)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null)
  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    description: "",
    unit: "",
    parentCategory: "",
  })

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddItem = () => {
    const item: MasterItem = {
      id: String(items.length + 1),
      code: newItem.code,
      name: newItem.name,
      description: newItem.description,
      unit: newItem.unit,
      parentCategory: newItem.parentCategory,
      status: "active",
      sortOrder: items.length + 1,
    }
    setItems([...items, item])
    setNewItem({ code: "", name: "", description: "", unit: "", parentCategory: "" })
    setShowAddModal(false)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "active" ? "inactive" : "active" }
          : item
      )
    )
  }

  const handleEditSave = () => {
    if (!editingItem) return
    setItems(
      items.map((item) => (item.id === editingItem.id ? editingItem : item))
    )
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Masters", href: "/masters" },
          { label: category.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/masters">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredItems.length} of {items.length} items
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-muted-foreground">No items found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {item.code}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[250px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.parentCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "cursor-pointer",
                            item.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                          onClick={() => handleToggleStatus(item.id)}
                        >
                          {item.status === "active" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Item"
        description={`Add a new item to ${category.name}`}
        onConfirm={handleAddItem}
        onCancel={() => {
          setShowAddModal(false)
          setNewItem({ code: "", name: "", description: "", unit: "", parentCategory: "" })
        }}
        confirmLabel="Add Item"
        maxWidth="lg"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input
                placeholder="e.g. MAT-013"
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. Fly Ash"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Brief description of the item"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Input
                placeholder="e.g. Kg, Nos, Lot"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category</label>
              <Input
                placeholder="e.g. Cement, Steel"
                value={newItem.parentCategory}
                onChange={(e) =>
                  setNewItem({ ...newItem, parentCategory: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        title="Edit Item"
        description={`Edit item in ${category.name}`}
        onConfirm={handleEditSave}
        onCancel={() => setEditingItem(null)}
        confirmLabel="Save Changes"
        maxWidth="lg"
      >
        {editingItem && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <Input
                  value={editingItem.code}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={editingItem.unit}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, unit: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <Input
                  value={editingItem.parentCategory}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      parentCategory: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
