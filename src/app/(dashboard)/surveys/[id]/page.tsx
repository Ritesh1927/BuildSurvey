"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft, MapPin, Calendar, Cloud,
  CheckCircle2, Clock, AlertTriangle, Camera,
  Save, Edit, Trash2, X, AlertCircle,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { showSuccess, showError } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"

interface SurveyDetail {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  scheduledDate: string | null
  completedDate: string | null
  gpsLatitude: number | null
  gpsLongitude: number | null
  weatherCondition?: string | null
  siteCondition?: string | null
  accessDetails?: string | null
  notes?: string | null
  projectId: string
  engineerId: string | null
  project: { id: string; name: string; code: string }
  engineer: { id: string; firstName: string; lastName: string; email: string } | null
  checklistItems: { id: string; category: string; item: string; isCompleted: boolean; notes: string | null }[]
}

interface RiskItem {
  id: string
  title: string
  description: string
  level: string
  mitigation: string | null
  createdAt: string
}

const STATUS_META: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}

const TYPE_META: Record<string, string> = {
  INITIAL: "Initial", DETAILED: "Detailed", FOLLOW_UP: "Follow-up", FINAL: "Final", AS_BUILT: "As-Built",
}

const RISK_LEVEL_META: Record<string, { variant: "success" | "warning" | "destructive"; icon: typeof AlertTriangle }> = {
  LOW: { variant: "success", icon: CheckCircle2 },
  MEDIUM: { variant: "warning", icon: AlertCircle },
  HIGH: { variant: "destructive", icon: AlertTriangle },
  CRITICAL: { variant: "destructive", icon: AlertTriangle },
}

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR']
const APPROVE_ROLES = ['SUPER_ADMIN']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const role = session?.user?.role
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<SurveyDetail | null>(null)
  const [risks, setRisks] = useState<RiskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', status: 'DRAFT', scheduledDate: '' })

  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)
  const canApprove = !!role && APPROVE_ROLES.includes(role)

  const fetchSurvey = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/surveys/${surveyId}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load survey')
        return
      }
      setSurvey(data.data)
      setForm({
        title: data.data.title || '',
        description: data.data.description || '',
        status: data.data.status,
        scheduledDate: data.data.scheduledDate ? data.data.scheduledDate.slice(0, 10) : '',
      })
    } catch {
      setError('Network error while loading survey')
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  useEffect(() => {
    fetchSurvey()
  }, [fetchSurvey])

  useEffect(() => {
    fetch(`/api/risks?surveyId=${surveyId}&limit=50`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setRisks(data.data) })
      .catch(() => {})
  }, [surveyId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          status: form.status,
          scheduledDate: form.scheduledDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to save survey')
        return
      }
      showSuccess('Survey updated')
      setIsEditing(false)
      router.replace(`/surveys/${surveyId}`)
      fetchSurvey()
    } catch {
      showError('Network error while saving survey')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!survey || !confirm(`Delete survey "${survey.title}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/surveys/${surveyId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete survey')
        return
      }
      showSuccess('Survey deleted')
      router.push('/surveys')
    } catch {
      showError('Network error while deleting survey')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading survey...</div>
  }

  if (error || !survey) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Survey not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/surveys"><ArrowLeft className="mr-1 h-4 w-4" />Back to Surveys</Link>
        </Button>
      </div>
    )
  }

  const statusMeta = STATUS_META[survey.status] || { label: survey.status, variant: 'secondary' as const }
  const checklistTotal = survey.checklistItems.length
  const checklistCompleted = survey.checklistItems.filter((i) => i.isCompleted).length
  const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0
  const checklistCategories = [...new Set(survey.checklistItems.map((i) => i.category))]

  return (
    <div className="space-y-6">
      <PageHeader
        title={survey.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: survey.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/surveys"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/surveys/${surveyId}`) }}>
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

      {isEditing ? (
        <Card>
          <CardHeader><CardTitle>Edit Survey</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <SelectItem key={value} value={value} disabled={(value === 'APPROVED' || value === 'REJECTED') && !canApprove}>
                        {meta.label}{(value === 'APPROVED' || value === 'REJECTED') && !canApprove ? ' (Super Admin only)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Scheduled Date</Label><Input type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} /></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="risks">Risks {risks.length > 0 && `(${risks.length})`}</TabsTrigger>
            <TabsTrigger value="media">Media &amp; Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Survey Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Project</p><Link href={`/projects/${survey.projectId}`} className="font-medium text-primary hover:underline">{survey.project.name}</Link></div>
                    <div><p className="text-sm text-muted-foreground">Type</p><Badge>{TYPE_META[survey.type] || survey.type}</Badge></div>
                    <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={statusMeta.variant}>{statusMeta.label}</Badge></div>
                    <div><p className="text-sm text-muted-foreground">Scheduled</p><div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" /><p className="font-medium">{survey.scheduledDate ? formatDate(survey.scheduledDate) : 'Not set'}</p></div></div>
                    {survey.completedDate && <div><p className="text-sm text-muted-foreground">Completed</p><p className="font-medium">{formatDate(survey.completedDate)}</p></div>}
                  </div>
                  {survey.description && (
                    <div><p className="text-sm text-muted-foreground mb-1">Description</p><p className="text-sm">{survey.description}</p></div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Assigned Engineer</CardTitle></CardHeader>
                  <CardContent>
                    {survey.engineer ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12"><AvatarFallback>{survey.engineer.firstName[0]}{survey.engineer.lastName[0]}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{survey.engineer.firstName} {survey.engineer.lastName}</p>
                          <p className="text-sm text-muted-foreground">{survey.engineer.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    )}
                  </CardContent>
                </Card>

                {(survey.weatherCondition || survey.siteCondition) && (
                  <Card>
                    <CardHeader><CardTitle>Site Conditions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {survey.weatherCondition && <div className="flex items-center gap-2"><Cloud className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Weather: {survey.weatherCondition}</span></div>}
                      {survey.siteCondition && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Access: {survey.siteCondition}</span></div>}
                    </CardContent>
                  </Card>
                )}

                {survey.gpsLatitude != null && survey.gpsLongitude != null && (
                  <Card>
                    <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 text-center">
                        <MapPin className="h-10 w-10 mx-auto text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Lat: {survey.gpsLatitude}, Lng: {survey.gpsLongitude}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Survey Checklist</span>
                  <Badge variant="secondary">{checklistCompleted}/{checklistTotal} completed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checklistTotal === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No checklist items for this survey</p>
                ) : (
                  <>
                    <Progress value={checklistProgress} className="mb-6 h-3" />
                    <div className="space-y-6">
                      {checklistCategories.map((category) => {
                        const items = survey.checklistItems.filter((i) => i.category === category)
                        const catCompleted = items.filter((i) => i.isCompleted).length
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase">{category}</h4>
                              <span className="text-xs text-muted-foreground">{catCompleted}/{items.length}</span>
                            </div>
                            <Progress value={(catCompleted / items.length) * 100} className="h-1.5 mb-3" />
                            <div className="space-y-1">
                              {items.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    <span className={`text-sm ${item.isCompleted ? "text-muted-foreground line-through" : ""}`}>{item.item}</span>
                                    {item.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.notes}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {risks.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No risks identified for this survey</p>
                ) : (
                  risks.map((risk) => {
                    const meta = RISK_LEVEL_META[risk.level] || RISK_LEVEL_META.MEDIUM
                    const Icon = meta.icon
                    return (
                      <div key={risk.id} className="flex items-start gap-3 p-4 rounded-lg border">
                        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{risk.title}</p>
                            <Badge variant={meta.variant}>{risk.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                          {risk.mitigation && <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Mitigation:</span> {risk.mitigation}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{formatDate(risk.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Photos, videos, voice notes & sketches</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    File uploads aren't wired up yet — this needs storage infrastructure (Vercel Blob/S3, per the project roadmap) before these can be built.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
