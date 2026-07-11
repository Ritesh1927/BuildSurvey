"use client"

import { useState, use } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Download,
  Edit,
  FileText,
  FolderOpen,
  GitBranch,
  MapPin,
  MoreHorizontal,
  Settings,
  Target,
  TrendingUp,
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
import { Input } from "@/components/ui/input"
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

const projectData = {
  id: "PRJ-001",
  name: "Worli Sky Residences Tower A",
  code: "PRJ-2024-001",
  status: "In Progress",
  type: "Residential Tower",
  description:
    "Premium 42-floor residential tower with 240 luxury apartments, 3-level basement parking, rooftop amenities, and ground-floor retail space. Located in the heart of Worli, Mumbai with panoramic sea views.",
  client: {
    id: "CLT-001",
    name: "L&T Realty",
    contactPerson: "Rajesh Kumar",
  },
  manager: {
    name: "Amit Deshmukh",
    initials: "AD",
    role: "Senior Project Manager",
  },
  team: [
    { name: "Priya Nair", initials: "PN", role: "Site Engineer" },
    { name: "Ravi Shankar", initials: "RS", role: "Surveyor" },
    { name: "Neha Kulkarni", initials: "NK", role: "Architect" },
    { name: "Vikram Desai", initials: "VD", role: "Quality Manager" },
  ],
  budget: 12500000,
  spent: 8125000,
  estimatedCost: 11800000,
  progress: 65,
  startDate: "2024-01-15",
  endDate: "2025-06-30",
  daysLeft: 345,
  area: 285000,
  floors: 42,
  location: {
    address: "Plot No. B-16, Worli Sea Face, Worli",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    lat: "19.0035",
    lng: "72.8146",
  },
  surveys: {
    total: 12,
    completed: 8,
    pending: 4,
  },
}

const surveyData = [
  { id: "SRV-001", name: "Topographic Survey", status: "Completed", date: "2024-01-20", surveyor: "Ravi Shankar" },
  { id: "SRV-002", name: "Soil Investigation", status: "Completed", date: "2024-01-25", surveyor: "Ravi Shankar" },
  { id: "SRV-003", name: "Boundary Survey", status: "Completed", date: "2024-02-01", surveyor: "Ravi Shankar" },
  { id: "SRV-004", name: "Level Survey - Foundation", status: "Completed", date: "2024-03-10", surveyor: "Sanjay Kulkarni" },
  { id: "SRV-005", name: "Structural Load Survey", status: "Completed", date: "2024-04-05", surveyor: "Ravi Shankar" },
  { id: "SRV-006", name: "Utility Mapping", status: "Completed", date: "2024-04-20", surveyor: "Sanjay Kulkarni" },
  { id: "SRV-007", name: "Level Survey - Podium", status: "Completed", date: "2024-05-15", surveyor: "Ravi Shankar" },
  { id: "SRV-008", name: "As-Built Survey - Basement", status: "Completed", date: "2024-06-01", surveyor: "Sanjay Kulkarni" },
  { id: "SRV-009", name: "Level Survey - Floor 12", status: "In Progress", date: "2024-07-15", surveyor: "Ravi Shankar" },
  { id: "SRV-010", name: "Progress Photogrammetry", status: "In Progress", date: "2024-07-20", surveyor: "Sanjay Kulkarni" },
  { id: "SRV-011", name: "Level Survey - Floor 24", status: "Scheduled", date: "2024-09-01", surveyor: "Ravi Shankar" },
  { id: "SRV-012", name: "Final As-Built Survey", status: "Scheduled", date: "2025-05-01", surveyor: "Ravi Shankar" },
]

const boqItems = [
  { id: 1, item: "Earthwork Excavation", unit: "Cum", qty: 45000, rate: 350, amount: 15750000 },
  { id: 2, item: "PCC (1:4:8)", unit: "Cum", qty: 2800, rate: 4500, amount: 12600000 },
  { id: 3, item: "RCC (M30)", unit: "Cum", qty: 18500, rate: 6500, amount: 120250000 },
  { id: 4, item: "Steel Reinforcement", unit: "MT", qty: 3200, rate: 72000, amount: 230400000 },
  { id: 5, item: "Formwork (Scaffolding)", unit: "Sq.m", qty: 95000, rate: 850, amount: 80750000 },
  { id: 6, item: "Brickwork", unit: "Cum", qty: 12000, rate: 5200, amount: 62400000 },
  { id: 7, item: "Plastering", unit: "Sq.m", qty: 180000, rate: 280, amount: 50400000 },
  { id: 8, item: "Flooring (Vitrified)", unit: "Sq.m", qty: 75000, rate: 1200, amount: 90000000 },
]

const activityTimeline = [
  { date: "2024-07-10", action: "Floor 12 slab casting completed", user: "Amit Deshmukh", type: "milestone" },
  { date: "2024-07-08", action: "Survey SRV-009 started - Level Survey Floor 12", user: "Ravi Shankar", type: "survey" },
  { date: "2024-07-05", action: "Monthly progress report submitted to client", user: "Amit Deshmukh", type: "report" },
  { date: "2024-07-01", action: "Material procurement: 500 MT steel ordered", user: "Procurement Team", type: "procurement" },
  { date: "2024-06-28", action: "Quality audit passed for basement levels", user: "Vikram Desai", type: "quality" },
  { date: "2024-06-25", action: "Safety inspection completed", user: "Safety Officer", type: "safety" },
  { date: "2024-06-20", action: "Client review meeting - design changes approved", user: "Rajesh Kumar", type: "meeting" },
  { date: "2024-06-15", action: "Invoice INV-003 raised - Phase 2 payment", user: "Accounts Team", type: "finance" },
  { date: "2024-06-10", action: "Floor 10 slab casting completed", user: "Amit Deshmukh", type: "milestone" },
  { date: "2024-06-05", action: "Survey SRV-008 completed - As-Built Basement", user: "Sanjay Kulkarni", type: "survey" },
]

const statusVariantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
  "In Progress": "success",
  Planning: "info",
  "On Hold": "warning",
  Completed: "secondary",
  Cancelled: "destructive",
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("overview")

  const budgetPercentage = Math.round((projectData.spent / projectData.budget) * 100)
  const remaining = projectData.budget - projectData.spent

  return (
    <div className="space-y-6">
      <PageHeader
        title={projectData.name}
        description={projectData.code}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: projectData.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={statusVariantMap[projectData.status] || "secondary"} className="text-sm px-3 py-1">
          {projectData.status}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {projectData.type}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {projectData.client.name}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Budget"
          value={formatCurrency(projectData.budget)}
          color="text-blue-600 bg-blue-50"
        />
        <MetricCard
          icon={<Coins className="h-5 w-5" />}
          label="Spent"
          value={formatCurrency(projectData.spent)}
          subtext={`${budgetPercentage}% utilized`}
          color="text-amber-600 bg-amber-50"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Remaining"
          value={formatCurrency(remaining)}
          color="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          icon={<Target className="h-5 w-5" />}
          label="Progress"
          value={`${projectData.progress}%`}
          color="text-violet-600 bg-violet-50"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Days Left"
          value={String(projectData.daysLeft)}
          color="text-rose-600 bg-rose-50"
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Surveys"
          value={`${projectData.surveys.completed}/${projectData.surveys.total}`}
          subtext={`${projectData.surveys.pending} pending`}
          color="text-teal-600 bg-teal-50"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="surveys" className="gap-2">
            <Target className="h-4 w-4" />
            Surveys
          </TabsTrigger>
          <TabsTrigger value="boq" className="gap-2">
            <FileText className="h-4 w-4" />
            BOQ
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {projectData.description}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem label="Client" value={projectData.client.name} />
                  <InfoItem label="Contact" value={projectData.client.contactPerson} />
                  <InfoItem label="Area" value={`${Number(projectData.area).toLocaleString("en-IN")} sq.ft`} />
                  <InfoItem label="Floors" value={`${projectData.floors} floors`} />
                  <InfoItem label="Start Date" value={formatDate(projectData.startDate)} />
                  <InfoItem label="End Date" value={formatDate(projectData.endDate)} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {projectData.manager.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{projectData.manager.name}</p>
                      <p className="text-sm text-muted-foreground">{projectData.manager.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projectData.team.map((member) => (
                    <div key={member.initials} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Budget utilization and cost tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget Utilization</span>
                  <span className="font-medium">{budgetPercentage}%</span>
                </div>
                <Progress value={budgetPercentage} className="h-3" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Approved Budget</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(projectData.budget)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Amount Spent</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(projectData.spent)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(projectData.estimatedCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6 pl-6">
                  {[
                    { date: "2024-01-15", event: "Project Kickoff", status: "completed" },
                    { date: "2024-03-01", event: "Foundation Work Started", status: "completed" },
                    { date: "2024-06-01", event: "Basement Levels Completed", status: "completed" },
                    { date: "2024-07-10", event: "Floor 12 Slab Completed", status: "current" },
                    { date: "2024-09-01", event: "Floor 24 Target", status: "upcoming" },
                    { date: "2025-01-01", event: "Superstructure Completion", status: "upcoming" },
                    { date: "2025-04-01", event: "Interior Finishing", status: "upcoming" },
                    { date: "2025-06-30", event: "Project Handover", status: "upcoming" },
                  ].map((item, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          "absolute left-[-26px] h-3 w-3 rounded-full border-2 bg-background",
                          item.status === "completed" && "border-primary bg-primary",
                          item.status === "current" && "border-primary bg-primary/50",
                          item.status === "upcoming" && "border-muted-foreground/30"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{item.event}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Surveys ({surveyData.length})</CardTitle>
                  <CardDescription>
                    {projectData.surveys.completed} completed, {projectData.surveys.pending} pending
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Target className="mr-2 h-4 w-4" />
                  New Survey
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Surveyor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveyData.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-mono text-sm">{survey.id}</TableCell>
                      <TableCell className="font-medium">{survey.name}</TableCell>
                      <TableCell className="text-sm">{survey.surveyor}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(survey.date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={survey.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bill of Quantities (BOQ)</CardTitle>
                  <CardDescription>Material and work quantity breakdown</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export BOQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate (INR)</TableHead>
                    <TableHead className="text-right">Amount (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boqItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell className="text-center text-sm">{item.unit}</TableCell>
                      <TableCell className="text-right text-sm">
                        {item.qty.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {item.rate.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell colSpan={5}>Total</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(boqItems.reduce((sum, item) => sum + item.amount, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No documents uploaded</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload drawings, specifications, contracts, and other project documents
                </p>
                <Button className="mt-4" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No active workflows</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set up approval workflows for this project
                </p>
                <Button className="mt-4" size="sm">
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative space-y-6">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {activityTimeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background",
                        item.type === "milestone" && "border-primary bg-primary/10",
                        item.type === "survey" && "border-blue-400 bg-blue-50",
                        item.type === "quality" && "border-emerald-400 bg-emerald-50",
                        item.type === "safety" && "border-amber-400 bg-amber-50",
                        item.type === "finance" && "border-violet-400 bg-violet-50",
                      )}
                    >
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Manage project configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Code</label>
                  <Input value={projectData.code} disabled className="font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select defaultValue="in-progress">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button>Save Changes</Button>
                <Button variant="destructive">Archive Project</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
          {icon}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{label}</p>
        <p className="text-lg font-bold mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
    Completed: "success",
    "In Progress": "info",
    Scheduled: "secondary",
    Cancelled: "destructive",
  }
  return (
    <Badge variant={variantMap[status] || "secondary"}>
      {status}
    </Badge>
  )
}
