"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  Building2,
  Clock,
  Coins,
  DollarSign,
  Edit,
  FileText,
  FolderOpen,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react"

import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { showSuccess, showError } from "@/components/ui/toast"

interface ProjectDetail {
  id: string
  name: string
  code: string
  description: string | null
  type: string
  status: string
  budget: number | null
  actualCost: number
  startDate: string | null
  endDate: string | null
  address: string | null
  city: string | null
  state: string | null
  area: number | null
  floors: number | null
  clientId: string
  managerId: string | null
  client: { id: string; companyName: string; contactPerson: string; email: string; phone: string }
  manager: { id: string; firstName: string; lastName: string; email: string } | null
  surveys: { id: string; title: string; status: string; scheduledDate: string | null }[]
  boqItems: { id: string; serialNumber: number; description: string; category: string; quantity: number; unitRate: number; amount: number }[]
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  PLANNING: { label: "Planning", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "success" },
  ON_HOLD: { label: "On Hold", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const TYPE_META: Record<string, string> = {
  RESIDENTIAL: "Residential", COMMERCIAL: "Commercial", INDUSTRIAL: "Industrial",
  INFRASTRUCTURE: "Infrastructure", INTERIOR: "Interior", MEP: "MEP", RENOVATION: "Renovation",
}

const SURVEY_STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
  APPROVED: "success", IN_PROGRESS: "info", SUBMITTED: "info", UNDER_REVIEW: "warning",
  REJECTED: "destructive", ASSIGNED: "secondary", DRAFT: "secondary",
}

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const role = session?.user?.role
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', status: 'PLANNING', budget: '', startDate: '', endDate: '',
  })

  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)

  const fetchProject = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load project')
        return
      }
      setProject(data.data)
      setForm({
        name: data.data.name || '',
        description: data.data.description || '',
        status: data.data.status,
        budget: data.data.budget != null ? String(data.data.budget) : '',
        startDate: data.data.startDate ? data.data.startDate.slice(0, 10) : '',
        endDate: data.data.endDate ? data.data.endDate.slice(0, 10) : '',
      })
    } catch {
      setError('Network error while loading project')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          status: form.status,
          budget: form.budget !== '' ? form.budget : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to save project')
        return
      }
      showSuccess('Project updated')
      setIsEditing(false)
      router.replace(`/projects/${projectId}`)
      fetchProject()
    } catch {
      showError('Network error while saving project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!project || !confirm(`Delete project "${project.name}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete project')
        return
      }
      showSuccess('Project deleted')
      router.push('/projects')
    } catch {
      showError('Network error while deleting project')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading project...</div>
  }

  if (error || !project) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Project not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/projects"><ArrowLeft className="mr-1 h-4 w-4" />Back to Projects</Link>
        </Button>
      </div>
    )
  }

  const budget = project.budget ?? 0
  const budgetPercentage = budget > 0 ? Math.round((project.actualCost / budget) * 100) : 0
  const remaining = budget - project.actualCost
  const daysLeft = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
  const surveysCompleted = project.surveys.filter((s) => s.status === 'APPROVED').length
  const boqTotal = project.boqItems.reduce((sum, item) => sum + item.amount, 0)
  const statusMeta = STATUS_META[project.status] || { label: project.status, variant: 'secondary' as const }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.code}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/projects/${projectId}`) }}>
                  <X className="mr-2 h-4 w-4" />Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                {canWrite && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />Edit
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {!isEditing && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusMeta.variant} className="text-sm px-3 py-1">{statusMeta.label}</Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">{TYPE_META[project.type] || project.type}</Badge>
            <span className="text-sm text-muted-foreground">{project.client.companyName}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <MetricCard icon={<DollarSign className="h-5 w-5" />} label="Budget" value={project.budget != null ? formatCurrency(project.budget) : 'Not set'} color="text-blue-600 bg-blue-50" />
            <MetricCard icon={<Coins className="h-5 w-5" />} label="Spent" value={formatCurrency(project.actualCost)} subtext={project.budget ? `${budgetPercentage}% utilized` : undefined} color="text-amber-600 bg-amber-50" />
            <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Remaining" value={formatCurrency(remaining)} color="text-emerald-600 bg-emerald-50" />
            <MetricCard icon={<Clock className="h-5 w-5" />} label="Days Left" value={daysLeft != null ? String(daysLeft) : '—'} color="text-rose-600 bg-rose-50" />
            <MetricCard icon={<Target className="h-5 w-5" />} label="Surveys" value={`${surveysCompleted}/${project.surveys.length}`} subtext={`${project.surveys.length - surveysCompleted} pending`} color="text-teal-600 bg-teal-50" />
          </div>
        </>
      )}

      {isEditing ? (
        <Card>
          <CardHeader><CardTitle>Edit Project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Budget (INR)</Label><Input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2"><Building2 className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2"><Target className="h-4 w-4" />Surveys</TabsTrigger>
            <TabsTrigger value="boq" className="gap-2"><FileText className="h-4 w-4" />BOQ</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2"><FolderOpen className="h-4 w-4" />Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Client" value={project.client.companyName} />
                    <InfoItem label="Contact" value={project.client.contactPerson} />
                    {project.area != null && <InfoItem label="Area" value={`${Number(project.area).toLocaleString("en-IN")} sq.ft`} />}
                    {project.floors != null && <InfoItem label="Floors" value={`${project.floors}`} />}
                    <InfoItem label="Start Date" value={project.startDate ? formatDate(project.startDate) : 'Not set'} />
                    <InfoItem label="End Date" value={project.endDate ? formatDate(project.endDate) : 'Not set'} />
                    {(project.address || project.city) && (
                      <InfoItem label="Location" value={[project.address, project.city, project.state].filter(Boolean).join(', ')} />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Project Manager</CardTitle></CardHeader>
                <CardContent>
                  {project.manager ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {project.manager.firstName[0]}{project.manager.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.manager.firstName} {project.manager.lastName}</p>
                        <p className="text-sm text-muted-foreground">{project.manager.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No manager assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {project.budget != null && (
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
                    <Progress value={Math.min(budgetPercentage, 100)} className="h-3" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Approved Budget</p>
                      <p className="text-lg font-bold mt-1">{formatCurrency(project.budget)}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Amount Spent</p>
                      <p className="text-lg font-bold mt-1">{formatCurrency(project.actualCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Surveys ({project.surveys.length})</CardTitle>
                <CardDescription>{surveysCompleted} approved, {project.surveys.length - surveysCompleted} in progress</CardDescription>
              </CardHeader>
              <CardContent>
                {project.surveys.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No surveys yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.surveys.map((survey) => (
                        <TableRow key={survey.id} className="cursor-pointer" onClick={() => router.push(`/surveys/${survey.id}`)}>
                          <TableCell className="font-medium">{survey.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {survey.scheduledDate ? formatDate(survey.scheduledDate) : '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={SURVEY_STATUS_VARIANT[survey.status] || 'secondary'}>{survey.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bill of Quantities (BOQ)</CardTitle>
                <CardDescription>Material and work quantity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {project.boqItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No BOQ items yet</p>
                ) : (
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
                      {project.boqItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">{item.serialNumber}</TableCell>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center text-sm">{item.category}</TableCell>
                          <TableCell className="text-right text-sm">{item.quantity.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right text-sm">{item.unitRate.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-bold">
                        <TableCell colSpan={5}>Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(boqTotal)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No documents uploaded</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Document uploads aren't wired to this page yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, subtext, color }: { icon: React.ReactNode; label: string; value: string; subtext?: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>{icon}</div>
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
