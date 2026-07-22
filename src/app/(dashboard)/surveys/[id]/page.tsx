"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft, MapPin, Calendar, Cloud,
  CheckCircle2, Clock, AlertTriangle, Camera,
  Save, Edit, Trash2, X, AlertCircle, Plus, Loader2, LogIn, LogOut,
  XCircle, HelpCircle, Navigation,
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
import { siteStatus } from "@/lib/geo"

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
  checkedInAt: string | null
  checkedOutAt: string | null
  project: { id: string; name: string; code: string; latitude: number | null; longitude: number | null }
  engineer: { id: string; firstName: string; lastName: string; email: string } | null
  checklistItems: { id: string; category: string; item: string; isCompleted: boolean; notes: string | null }[]
  photos: { id: string; url: string; caption: string | null; latitude: number | null; longitude: number | null; takenAt: string | null }[]
  measurements: { id: string; category: string; description: string | null; length: number | null; width: number | null; height: number | null; unit: string; notes: string | null }[]
  materialRequirements: { id: string; materialName: string; specification: string | null; quantity: number; unit: string; estimatedCost: number | null; notes: string | null }[]
}

interface MeasurementDraft {
  category: string; description: string; length: string; width: string; height: string; unit: string
}

interface MaterialDraft {
  materialName: string; specification: string; quantity: string; unit: string; estimatedCost: string
}

// Phone camera photos routinely land at 3-10MB. Storing that raw in the DB
// makes every check-in/check-out write take 8-20s and blow past Prisma's
// transaction timeout. Downscaling to a sane max dimension + JPEG quality
// keeps photos at a few hundred KB while still being clearly legible.
function compressImage(file: File, maxDimension = 1280, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas is not supported by this browser'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to read the photo'))
    }
    img.src = objectUrl
  })
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 })
  })
}

function SiteBadge({ onSite, distanceMeters }: { onSite: boolean | null; distanceMeters: number | null }) {
  if (onSite === null) {
    return <Badge variant="secondary" className="text-[10px] gap-1"><HelpCircle className="h-3 w-3" />Site status unknown</Badge>
  }
  return onSite ? (
    <Badge variant="success" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />On Site</Badge>
  ) : (
    <Badge variant="destructive" className="text-[10px] gap-1"><XCircle className="h-3 w-3" />Off Site ({distanceMeters}m from site)</Badge>
  )
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
  const isAssignedToMe = !!session?.user?.id && survey?.engineerId === session.user.id
  const canCheckInOut = (role === 'ENGINEER' || role === 'SURVEYOR') && isAssignedToMe

  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [resubmittingCheckIn, setResubmittingCheckIn] = useState(false)
  const [checkOutPhoto, setCheckOutPhoto] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [measurementDrafts, setMeasurementDrafts] = useState<MeasurementDraft[]>([])
  const [materialDrafts, setMaterialDrafts] = useState<MaterialDraft[]>([])

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

  const handleCheckInPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCheckInPhoto(await compressImage(file))
  }

  const handleCheckOutPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCheckOutPhoto(await compressImage(file))
  }

  const handleCheckIn = async () => {
    if (!checkInPhoto) {
      showError('Take a check-in photo first')
      return
    }
    setCheckingIn(true)
    try {
      const position = await getCurrentPosition()
      const res = await fetch(`/api/surveys/${surveyId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photo: checkInPhoto,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to check in')
        return
      }
      showSuccess(
        data.onSite === true
          ? 'Checked in successfully — On Site'
          : data.onSite === false
            ? `Checked in — Off Site (${data.distanceMeters}m from the project location)`
            : 'Checked in successfully'
      )
      setCheckInPhoto(null)
      setResubmittingCheckIn(false)
      fetchSurvey()
    } catch (e: any) {
      showError(e?.message?.includes('geolocation') || e?.code === 1
        ? 'Location permission is required to check in'
        : 'Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  const addMeasurementDraft = () => {
    setMeasurementDrafts((prev) => [...prev, { category: '', description: '', length: '', width: '', height: '', unit: 'm' }])
  }
  const removeMeasurementDraft = (index: number) => {
    setMeasurementDrafts((prev) => prev.filter((_, i) => i !== index))
  }
  const updateMeasurementDraft = (index: number, field: keyof MeasurementDraft, value: string) => {
    setMeasurementDrafts((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  const addMaterialDraft = () => {
    setMaterialDrafts((prev) => [...prev, { materialName: '', specification: '', quantity: '', unit: '', estimatedCost: '' }])
  }
  const removeMaterialDraft = (index: number) => {
    setMaterialDrafts((prev) => prev.filter((_, i) => i !== index))
  }
  const updateMaterialDraft = (index: number, field: keyof MaterialDraft, value: string) => {
    setMaterialDrafts((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  const handleCheckOut = async () => {
    if (!checkOutPhoto) {
      showError('Take a check-out photo first')
      return
    }
    const incompleteMeasurement = measurementDrafts.find((m) => !m.category.trim())
    if (incompleteMeasurement) {
      showError('Every measurement needs a category')
      return
    }
    const incompleteMaterial = materialDrafts.find((m) => !m.materialName.trim() || !m.quantity || !m.unit.trim())
    if (incompleteMaterial) {
      showError('Every material needs a name, quantity, and unit')
      return
    }
    setCheckingOut(true)
    try {
      const position = await getCurrentPosition()
      const res = await fetch(`/api/surveys/${surveyId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          photo: checkOutPhoto,
          measurements: measurementDrafts,
          materials: materialDrafts,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to check out')
        return
      }
      showSuccess(
        data.onSite === true
          ? 'Checked out successfully — On Site'
          : data.onSite === false
            ? `Checked out — Off Site (${data.distanceMeters}m from the project location)`
            : 'Checked out successfully'
      )
      setCheckOutPhoto(null)
      setMeasurementDrafts([])
      setMaterialDrafts([])
      fetchSurvey()
    } catch (e: any) {
      showError(e?.message?.includes('geolocation') || e?.code === 1
        ? 'Location permission is required to check out'
        : 'Failed to check out')
    } finally {
      setCheckingOut(false)
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

  const checkInPhotoRecord = survey.photos.find((p) => p.caption === 'Check-In')
  const checkInSiteCheck = checkInPhotoRecord
    ? siteStatus(checkInPhotoRecord.latitude, checkInPhotoRecord.longitude, survey.project.latitude, survey.project.longitude)
    : { onSite: null, distanceMeters: null }

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
        <Tabs defaultValue={canCheckInOut && !survey.checkedOutAt ? "site-visit" : "overview"}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="site-visit">
              Site Visit {survey.checkedInAt && !survey.checkedOutAt && <Badge variant="info" className="ml-1.5 text-[10px]">In Progress</Badge>}
              {survey.checkedOutAt && <CheckCircle2 className="ml-1.5 h-3.5 w-3.5 text-emerald-500" />}
            </TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="measurements">Measurements {survey.measurements.length > 0 && `(${survey.measurements.length})`}</TabsTrigger>
            <TabsTrigger value="materials">Materials {survey.materialRequirements.length > 0 && `(${survey.materialRequirements.length})`}</TabsTrigger>
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

              </div>
            </div>
          </TabsContent>

          <TabsContent value="site-visit" className="space-y-6 mt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5" />Check-In</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {survey.checkedInAt && !resubmittingCheckIn ? (
                    <div className="space-y-3">
                      {checkInPhotoRecord && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={checkInPhotoRecord.url}
                          alt="Check-in"
                          className="w-full max-w-xs rounded-lg border object-cover"
                        />
                      )}
                      <div className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Checked in {formatDate(survey.checkedInAt)}</div>
                      {checkInPhotoRecord && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Lat: {checkInPhotoRecord.latitude}, Lng: {checkInPhotoRecord.longitude}</p>
                          <SiteBadge onSite={checkInSiteCheck.onSite} distanceMeters={checkInSiteCheck.distanceMeters} />
                        </div>
                      )}
                      {checkInSiteCheck.onSite === false && canCheckInOut && !survey.checkedOutAt && (
                        <Button variant="outline" onClick={() => setResubmittingCheckIn(true)}>
                          <LogIn className="mr-2 h-4 w-4" />Resubmit Check-In
                        </Button>
                      )}
                    </div>
                  ) : canCheckInOut ? (
                    <div className="space-y-3">
                      {survey.project.latitude != null && survey.project.longitude != null && (
                        <Button variant="outline" className="w-full" asChild>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${survey.project.latitude},${survey.project.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="mr-2 h-4 w-4" />Get Directions to Site
                          </a>
                        </Button>
                      )}
                      <p className="text-sm text-muted-foreground">Take a photo of yourself at the site to check in. Your location will be captured automatically.</p>
                      {checkInPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={checkInPhoto} alt="Check-in preview" className="w-full max-w-xs rounded-lg border object-cover" />
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Tap to take a photo</span>
                          <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleCheckInPhoto} />
                        </label>
                      )}
                      <div className="flex gap-2">
                        {checkInPhoto && (
                          <Button variant="outline" onClick={() => setCheckInPhoto(null)} disabled={checkingIn}>Retake</Button>
                        )}
                        {resubmittingCheckIn && (
                          <Button variant="ghost" onClick={() => { setResubmittingCheckIn(false); setCheckInPhoto(null) }} disabled={checkingIn}>Cancel</Button>
                        )}
                        <Button className="flex-1" onClick={handleCheckIn} disabled={!checkInPhoto || checkingIn}>
                          {checkingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                          {checkingIn ? 'Checking in...' : resubmittingCheckIn ? 'Resubmit Check In' : 'Check In'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not checked in yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><LogOut className="h-5 w-5" />Check-Out</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {survey.checkedOutAt ? (
                    <div className="space-y-3">
                      {survey.photos.find((p) => p.caption === 'Check-Out') && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={survey.photos.find((p) => p.caption === 'Check-Out')!.url}
                          alt="Check-out"
                          className="w-full max-w-xs rounded-lg border object-cover"
                        />
                      )}
                      <div className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Checked out {formatDate(survey.checkedOutAt)}</div>
                      {survey.photos.find((p) => p.caption === 'Check-Out') && (() => {
                        const p = survey.photos.find((p) => p.caption === 'Check-Out')!
                        const { onSite, distanceMeters } = siteStatus(p.latitude, p.longitude, survey.project.latitude, survey.project.longitude)
                        return <SiteBadge onSite={onSite} distanceMeters={distanceMeters} />
                      })()}
                      <p className="text-xs text-muted-foreground">{survey.measurements.length} measurement(s), {survey.materialRequirements.length} material(s) submitted — see the Measurements and Materials tabs.</p>
                    </div>
                  ) : !survey.checkedInAt ? (
                    <p className="text-sm text-muted-foreground">Check in first before you can check out.</p>
                  ) : checkInSiteCheck.onSite === false ? (
                    <p className="text-sm text-amber-600">Your check-in was off-site — resubmit your check-in from the project location before you can check out.</p>
                  ) : canCheckInOut ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Take a checkout photo, then record what you measured and what materials are needed.</p>
                      {checkOutPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={checkOutPhoto} alt="Check-out preview" className="w-full max-w-xs rounded-lg border object-cover" />
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Tap to take a photo</span>
                          <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleCheckOutPhoto} />
                        </label>
                      )}
                      {checkOutPhoto && (
                        <Button variant="outline" size="sm" onClick={() => setCheckOutPhoto(null)} disabled={checkingOut}>Retake</Button>
                      )}

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Measurements</Label>
                          <Button variant="outline" size="sm" onClick={addMeasurementDraft}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button>
                        </div>
                        {measurementDrafts.map((m, i) => (
                          <div key={i} className="grid grid-cols-6 gap-2 items-end rounded-lg border p-2">
                            <Input className="col-span-2" placeholder="Category *" value={m.category} onChange={(e) => updateMeasurementDraft(i, 'category', e.target.value)} />
                            <Input className="col-span-2" placeholder="Description" value={m.description} onChange={(e) => updateMeasurementDraft(i, 'description', e.target.value)} />
                            <Input placeholder="L" type="number" value={m.length} onChange={(e) => updateMeasurementDraft(i, 'length', e.target.value)} />
                            <div className="flex gap-1">
                              <Input placeholder="W" type="number" value={m.width} onChange={(e) => updateMeasurementDraft(i, 'width', e.target.value)} />
                              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeMeasurementDraft(i)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label>Material Requirements</Label>
                          <Button variant="outline" size="sm" onClick={addMaterialDraft}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button>
                        </div>
                        {materialDrafts.map((m, i) => (
                          <div key={i} className="grid grid-cols-6 gap-2 items-end rounded-lg border p-2">
                            <Input className="col-span-2" placeholder="Material *" value={m.materialName} onChange={(e) => updateMaterialDraft(i, 'materialName', e.target.value)} />
                            <Input placeholder="Qty *" type="number" value={m.quantity} onChange={(e) => updateMaterialDraft(i, 'quantity', e.target.value)} />
                            <Input placeholder="Unit *" value={m.unit} onChange={(e) => updateMaterialDraft(i, 'unit', e.target.value)} />
                            <Input placeholder="Est. Cost" type="number" value={m.estimatedCost} onChange={(e) => updateMaterialDraft(i, 'estimatedCost', e.target.value)} />
                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeMaterialDraft(i)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full" onClick={handleCheckOut} disabled={!checkOutPhoto || checkingOut}>
                        {checkingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        {checkingOut ? 'Checking out...' : 'Check Out'}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Checked in, not checked out yet.</p>
                  )}
                </CardContent>
              </Card>
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

          <TabsContent value="measurements" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle>Measurements</CardTitle></CardHeader>
              <CardContent>
                {survey.measurements.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No measurements recorded yet — submitted at checkout</p>
                ) : (
                  <div className="space-y-2">
                    {survey.measurements.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{m.category}{m.description ? ` — ${m.description}` : ''}</p>
                          <p className="text-xs text-muted-foreground">
                            {[m.length && `L: ${m.length}`, m.width && `W: ${m.width}`, m.height && `H: ${m.height}`].filter(Boolean).join(' · ') || 'No dimensions'} {m.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle>Material Requirements</CardTitle></CardHeader>
              <CardContent>
                {survey.materialRequirements.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No material requirements recorded yet — submitted at checkout</p>
                ) : (
                  <div className="space-y-2">
                    {survey.materialRequirements.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{m.materialName}{m.specification ? ` (${m.specification})` : ''}</p>
                          <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}{m.estimatedCost ? ` · est. ₹${m.estimatedCost.toLocaleString('en-IN')}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
              <CardHeader><CardTitle>Photos ({survey.photos.length})</CardTitle></CardHeader>
              <CardContent>
                {survey.photos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No photos yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md">Check-in/check-out photos will show up here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {survey.photos.map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <div key={photo.id} className="space-y-1">
                        <img src={photo.url} alt={photo.caption || 'Survey photo'} className="w-full aspect-square rounded-lg border object-cover" />
                        <p className="text-xs font-medium">{photo.caption || 'Photo'}</p>
                        {photo.takenAt && <p className="text-[10px] text-muted-foreground">{formatDate(photo.takenAt)}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">Videos, voice notes, and sketches aren't wired up yet — same storage infra, not yet built for those media types.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
