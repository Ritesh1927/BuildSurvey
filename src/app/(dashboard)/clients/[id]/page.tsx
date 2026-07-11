"use client"

import { useState, use } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react"

import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const clientData = {
  id: "CLT-001",
  companyName: "L&T Realty",
  contactPerson: "Rajesh Kumar",
  email: "rajesh.kumar@lntrealty.com",
  phone: "+91 98765 43210",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  address: "12th Floor, L&T Technology Centre, Plot No. B-16, MIDC, Navi Mumbai - 400710",
  gstNumber: "27AABCL1234F1ZP",
  panNumber: "AABCL1234F",
  website: "https://www.lntrealty.com",
  type: "Real Estate Developer",
  status: "Active",
  rating: 4.8,
  totalRevenue: 42500000,
  projectsCount: 5,
  createdAt: "2023-06-15",
}

const clientProjects = [
  {
    id: "PRJ-001",
    name: "Worli Sky Residences",
    code: "PRJ-2024-001",
    status: "In Progress",
    type: "Residential Tower",
    progress: 65,
    budget: 12500000,
    managerName: "Amit Deshmukh",
    managerInitials: "AD",
    startDate: "2024-01-15",
    endDate: "2025-06-30",
  },
  {
    id: "PRJ-002",
    name: "BKC Commercial Hub",
    code: "PRJ-2024-002",
    status: "Planning",
    type: "Commercial Complex",
    progress: 15,
    budget: 8900000,
    managerName: "Priya Nair",
    managerInitials: "PN",
    startDate: "2024-06-01",
    endDate: "2026-03-31",
  },
  {
    id: "PRJ-003",
    name: "Navi Mumbai Township",
    code: "PRJ-2023-015",
    status: "Completed",
    type: "Residential Tower",
    progress: 100,
    budget: 6700000,
    managerName: "Suresh Patil",
    managerInitials: "SP",
    startDate: "2023-03-01",
    endDate: "2024-08-30",
  },
  {
    id: "PRJ-004",
    name: "Powai Lake View Apartments",
    code: "PRJ-2024-004",
    status: "In Progress",
    type: "Residential Tower",
    progress: 42,
    budget: 9800000,
    managerName: "Neha Kulkarni",
    managerInitials: "NK",
    startDate: "2024-03-15",
    endDate: "2025-12-31",
  },
  {
    id: "PRJ-005",
    name: "Thane Industrial Park",
    code: "PRJ-2023-020",
    status: "On Hold",
    type: "Industrial",
    progress: 30,
    budget: 4600000,
    managerName: "Vikram Desai",
    managerInitials: "VD",
    startDate: "2023-09-01",
    endDate: "2025-04-30",
  },
]

const invoices = [
  { id: "INV-001", amount: 2500000, status: "Paid", date: "2024-01-15", description: "Initial Advance - Worli Sky Residences" },
  { id: "INV-002", amount: 1800000, status: "Paid", date: "2024-03-20", description: "Phase 1 Completion - Worli Sky Residences" },
  { id: "INV-003", amount: 3200000, status: "Pending", date: "2024-06-10", description: "Phase 2 Progress - Worli Sky Residences" },
  { id: "INV-004", amount: 900000, status: "Paid", date: "2024-04-05", description: "Survey & Design - BKC Commercial Hub" },
]

const activityTimeline = [
  { date: "2024-07-10", action: "Invoice INV-003 generated", user: "Accounts Team", type: "finance" },
  { date: "2024-07-08", action: "Site survey completed for BKC Hub", user: "Survey Team", type: "survey" },
  { date: "2024-07-05", action: "Project milestone achieved - Floor 12 slab", user: "Amit Deshmukh", type: "project" },
  { date: "2024-07-01", action: "Monthly progress report shared", user: "Project Manager", type: "report" },
  { date: "2024-06-28", action: "Material procurement order placed", user: "Procurement Team", type: "procurement" },
  { date: "2024-06-25", action: "Quality inspection passed", user: "QC Team", type: "quality" },
  { date: "2024-06-20", action: "Client meeting - reviewed design changes", user: "Rajesh Kumar", type: "meeting" },
  { date: "2024-06-15", action: "Contract renewal signed", user: "Legal Team", type: "contract" },
]

const statusVariantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
  "In Progress": "success",
  Planning: "info",
  "On Hold": "warning",
  Completed: "secondary",
  Cancelled: "destructive",
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title={clientData.companyName}
        description={`Client ID: ${clientData.id}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: clientData.companyName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {clientData.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{clientData.companyName}</h2>
                  <p className="text-sm text-muted-foreground">{clientData.type}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(clientData.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        )}
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium">{clientData.rating}</span>
                  </div>
                </div>
              </div>
              <Badge variant="success" className="text-sm">{clientData.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="text-sm font-medium">{clientData.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{clientData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{clientData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{clientData.city}, {clientData.state}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="text-sm">{clientData.address}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">GST Number</p>
                <p className="text-sm font-mono font-medium mt-1">{clientData.gstNumber}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">PAN Number</p>
                <p className="text-sm font-mono font-medium mt-1">{clientData.panNumber}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Website</p>
                <a href={clientData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">
                  {clientData.website}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-lg font-bold">{formatCurrency(clientData.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Projects</span>
                <span className="text-lg font-bold">{clientData.projectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Client Since</span>
                <span className="text-sm font-medium">{formatDate(clientData.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Project Value</span>
                <span className="text-sm font-medium">
                  {formatCurrency(clientData.totalRevenue / clientData.projectsCount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Create Proposal
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Receipt className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FolderOpen className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/projects/${project.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{project.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{project.code}</p>
                    </div>
                    <Badge variant={statusVariantMap[project.status] || "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {project.managerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{project.managerName}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload contracts, proposals, and other client documents
                </p>
                <Button className="mt-4" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              <div className="relative space-y-6">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {activityTimeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm">{item.action}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.user}</span>
                        <span>&bull;</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
