"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package,
  Ruler,
  ClipboardList,
  Building2,
  AlertTriangle,
  FileText,
  Users,
  CreditCard,
  Receipt,
  MapPin,
  Search,
  Download,
  Upload,
  ArrowRight,
  FolderOpen,
  Plus,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"

interface MasterCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  count: number
  color: string
  bgColor: string
}

const masterCategories: MasterCategory[] = [
  {
    id: "material-types",
    name: "Material Types",
    description: "Cement, Steel, Bricks, Sand, Aggregates, Tiles, Pipes, etc.",
    icon: <Package className="h-6 w-6" />,
    count: 24,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "measurement-units",
    name: "Measurement Units",
    description: "Sq Ft, Sq M, Cu Ft, Cu M, Nos, Kg, Litre, Rmt, etc.",
    icon: <Ruler className="h-6 w-6" />,
    count: 18,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    id: "survey-categories",
    name: "Survey Categories",
    description: "Structural, Electrical, Plumbing, HVAC, Fire Safety, etc.",
    icon: <ClipboardList className="h-6 w-6" />,
    count: 12,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    id: "project-types",
    name: "Project Types",
    description: "Residential, Commercial, Infrastructure, Industrial, etc.",
    icon: <Building2 className="h-6 w-6" />,
    count: 8,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: "risk-categories",
    name: "Risk Categories",
    description: "Safety, Environmental, Financial, Legal, Technical, etc.",
    icon: <AlertTriangle className="h-6 w-6" />,
    count: 10,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "document-types",
    name: "Document Types",
    description: "Invoice, Quotation, BOQ, Contract, Drawing, Report, etc.",
    icon: <FileText className="h-6 w-6" />,
    count: 15,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    id: "lead-sources",
    name: "Lead Sources",
    description: "Referral, Website, Walk-in, Social Media, Cold Call, etc.",
    icon: <Users className="h-6 w-6" />,
    count: 9,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  {
    id: "payment-terms",
    name: "Payment Terms",
    description: "Net 30, Net 60, Advance, Milestone-based, etc.",
    icon: <CreditCard className="h-6 w-6" />,
    count: 7,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    id: "tax-codes",
    name: "Tax Codes",
    description: "GST 5%, 12%, 18%, 28%, CGST, SGST, IGST, etc.",
    icon: <Receipt className="h-6 w-6" />,
    count: 11,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "locations",
    name: "City / State / Country",
    description: "States, Cities, Countries with Pin Codes and Zones",
    icon: <MapPin className="h-6 w-6" />,
    count: 156,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
]

export default function MastersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = masterCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Management"
        description="Manage reference data, categories, and system-wide configurations"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Masters" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search master categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCategories.map((category) => (
          <Link key={category.id} href={`/masters/${category.id}`}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      category.bgColor,
                      category.color
                    )}
                  >
                    {category.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} items
                  </Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage Items
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No categories found
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{masterCategories.length}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {masterCategories.reduce((sum, cat) => sum + cat.count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
