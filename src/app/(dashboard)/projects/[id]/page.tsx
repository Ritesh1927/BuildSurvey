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
  Navigation,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react"

import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { hasPermission, hasRole } from "@/lib/permissions"
import { INDIAN_STATES } from "@/lib/constants"
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
import { SiteVisitTab } from "./site-visit-tab"
import { isPositiveNumber, isValidLatitude, isValidLongitude, isEndDateBeforeStart } from "@/lib/validation"

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
  latitude: number | null
  longitude: number | null
  area: number | null
  floors: number | null
  clientId: string
  managerId: string | null
  leadUserId: string | null
  client: { id: string; companyName: string; contactPerson: string; email: string; phone: string }
  manager: { id: string; firstName: string; lastName: string; email: string } | null
  leadUser: { id: string; firstName: string; lastName: string; email: string } | null
  surveys: { id: string; title: string; status: string; scheduledDate: string | null }[]
  boqItems: { id: string; serialNumber: number; description: string; category: string; quantity: number; unitRate: number; amount: number }[]
}

interface UserOption { id: string; firstName: string; lastName: string; role: string; roleName?: string; secondaryRole?: string | null }

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
  APPROVED: "success", IN_PROGRESS: "info", SUBMITTED: "info",
  REJECTED: "destructive", ASSIGNED: "secondary",
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [managerOptions, setManagerOptions] = useState<UserOption[]>([])
  const [engineerOptions, setEngineerOptions] = useState<UserOption[]>([])
  const [form, setForm] = useState({
    name: '', description: '', type: 'RESIDENTIAL', status: 'PLANNING',
    address: '', city: '', state: '', latitude: '', longitude: '', area: '', floors: '',
    budget: '', startDate: '', endDate: '', managerId: '', leadUserId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (form.latitude && !isValidLatitude(form.latitude)) e.latitude = 'Latitude must be between -90 and 90'
    if (form.longitude && !isValidLongitude(form.longitude)) e.longitude = 'Longitude must be between -180 and 180'
    if (form.area && !isPositiveNumber(form.area)) e.area = 'Area must be a positive number'
    if (form.floors && !isPositiveNumber(form.floors)) e.floors = 'Floors must be a positive number'
    if (form.budget && !isPositiveNumber(form.budget)) e.budget = 'Budget must be a positive number'
    if (form.startDate && form.endDate && isEndDateBeforeStart(form.startDate, form.endDate)) {
      e.endDate = 'End date cannot be before start date'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canWrite = hasPermission(session?.user, 'projects:write:all', 'projects:write:own')
  const canDelete = hasPermission(session?.user, 'projects:delete')
  // Matches the backend's ENGINEER_ALLOWED_FIELDS — staffing/budget calls
  // aren't an Engineer's to make even on a project they lead.
  const canEditRestricted = hasPermission(session?.user, 'projects:write:all')
  const isLeadEngineer = hasRole(session?.user, 'ENGINEER') && !!session?.user?.id && project?.leadUserId === session.user.id
  const canViewSiteVisits = isLeadEngineer || hasPermission(session?.user, 'site_visits:read:all')

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
        type: data.data.type,
        status: data.data.status,
        address: data.data.address || '',
        city: data.data.city || '',
        state: data.data.state || '',
        latitude: data.data.latitude != null ? String(data.data.latitude) : '',
        longitude: data.data.longitude != null ? String(data.data.longitude) : '',
        area: data.data.area != null ? String(data.data.area) : '',
        floors: data.data.floors != null ? String(data.data.floors) : '',
        budget: data.data.budget != null ? String(data.data.budget) : '',
        startDate: data.data.startDate ? data.data.startDate.slice(0, 10) : '',
        endDate: data.data.endDate ? data.data.endDate.slice(0, 10) : '',
        managerId: data.data.managerId || '',
        leadUserId: data.data.leadUserId || '',
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

  useEffect(() => {
    Promise.all([
      fetch('/api/users/assignable?permission=projects:assignable:manager').then((res) => res.json()),
      fetch('/api/users/assignable?permission=projects:assignable:engineer').then((res) => res.json()),
    ])
      .then(([managers, engineers]) => {
        if (managers.success && Array.isArray(managers.data)) setManagerOptions(managers.data)
        if (engineers.success && Array.isArray(engineers.data)) setEngineerOptions(engineers.data)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          type: form.type,
          status: form.status,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          latitude: form.latitude !== '' ? form.latitude : null,
          longitude: form.longitude !== '' ? form.longitude : null,
          area: form.area !== '' ? form.area : null,
          floors: form.floors !== '' ? form.floors : null,
          budget: form.budget !== '' ? form.budget : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          ...(canEditRestricted ? { managerId: form.managerId || null, leadUserId: form.leadUserId || null } : {}),
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
                <Button variant="outline" onClick={() => { setIsEditing(false); setErrors({}); router.replace(`/projects/${projectId}`) }}>
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
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Name</Label><Input value={form.name} disabled={!canEditRestricted} onChange={(e) => updateField('name', e.target.value)} />{errors.name && <p className="text-sm text-destructive">{errors.name}</p>}</div>
                <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} disabled={!canEditRestricted} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_META).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location & Site Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Site Address</Label><Input value={form.address} disabled={!canEditRestricted} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={form.city} disabled={!canEditRestricted} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={form.state} disabled={!canEditRestricted} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} disabled={!canEditRestricted} onChange={(e) => updateField('latitude', e.target.value)} />{errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}</div>
                <div className="space-y-2"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} disabled={!canEditRestricted} onChange={(e) => updateField('longitude', e.target.value)} />{errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}</div>
                <div className="space-y-2"><Label>Total Area (sq.ft)</Label><Input type="number" value={form.area} onChange={(e) => updateField('area', e.target.value)} />{errors.area && <p className="text-sm text-destructive">{errors.area}</p>}</div>
                <div className="space-y-2"><Label>Number of Floors</Label><Input type="number" value={form.floors} onChange={(e) => updateField('floors', e.target.value)} />{errors.floors && <p className="text-sm text-destructive">{errors.floors}</p>}</div>
              </div>
              <p className="text-xs text-muted-foreground">Latitude/longitude are the geofence center used to judge whether a surveyor's check-in/check-out is on-site.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Financial & Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {canEditRestricted && (
                  <div className="space-y-2"><Label>Budget (INR)</Label><Input type="number" value={form.budget} onChange={(e) => updateField('budget', e.target.value)} />{errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}</div>
                )}
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} disabled={!canEditRestricted} onChange={(e) => updateField('startDate', e.target.value)} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} disabled={!canEditRestricted} onChange={(e) => updateField('endDate', e.target.value)} />{errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}</div>
              </div>
            </CardContent>
          </Card>

          {canEditRestricted && (
            <Card>
              <CardHeader><CardTitle>Assignment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Project Manager</Label>
                    <Select value={form.managerId || '__none'} onValueChange={(v) => setForm((f) => ({ ...f, managerId: v === '__none' ? '' : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select project manager" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Unassigned</SelectItem>
                        {managerOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Engineer</Label>
                    <Select value={form.leadUserId || '__none'} onValueChange={(v) => setForm((f) => ({ ...f, leadUserId: v === '__none' ? '' : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select lead engineer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Unassigned</SelectItem>
                        {engineerOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The Engineer who can see and manage this project.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2"><Building2 className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2"><Target className="h-4 w-4" />Surveys</TabsTrigger>
            {canViewSiteVisits && (
              <TabsTrigger value="site-visits" className="gap-2"><Navigation className="h-4 w-4" />Site Visits</TabsTrigger>
            )}
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
                    {project.latitude != null && project.longitude != null && (
                      <InfoItem label="GPS Coordinates" value={`${project.latitude}, ${project.longitude}`} />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
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

                <Card>
                  <CardHeader><CardTitle className="text-base">Lead Engineer</CardTitle></CardHeader>
                  <CardContent>
                    {project.leadUser ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {project.leadUser.firstName[0]}{project.leadUser.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.leadUser.firstName} {project.leadUser.lastName}</p>
                          <p className="text-sm text-muted-foreground">{project.leadUser.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No lead engineer assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>
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

          {canViewSiteVisits && (
            <TabsContent value="site-visits">
              <SiteVisitTab
                projectId={project.id}
                isLeadEngineer={isLeadEngineer}
                canViewAll={hasPermission(session?.user, 'site_visits:read:all')}
                projectLatitude={project.latitude}
                projectLongitude={project.longitude}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
              />
            </TabsContent>
          )}

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
