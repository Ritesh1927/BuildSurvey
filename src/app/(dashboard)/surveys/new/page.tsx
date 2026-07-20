"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight, ChevronLeft, Plus, Trash2, GripVertical,
  MapPin, Calendar, CheckCircle2,
  ClipboardCheck, Send, Building2,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const steps = [
  { id: 1, title: "Project & Type", icon: Building2 },
  { id: 2, title: "Schedule & Assignment", icon: Calendar },
  { id: 3, title: "Site Details", icon: MapPin },
  { id: 4, title: "Checklist", icon: ClipboardCheck },
  { id: 5, title: "Review & Submit", icon: CheckCircle2 },
]

const SURVEY_TYPES = [
  { value: "INITIAL", label: "Initial Survey" },
  { value: "DETAILED", label: "Detailed Survey" },
  { value: "FOLLOW_UP", label: "Follow-up Survey" },
  { value: "FINAL", label: "Final Survey" },
  { value: "AS_BUILT", label: "As-Built Survey" },
]

interface ProjectOption { id: string; name: string }
interface EngineerOption { id: string; firstName: string; lastName: string; role: string }

const defaultChecklistItems = [
  { id: 1, category: "Structural", item: "Foundation condition assessment", checked: false, notes: "" },
  { id: 2, category: "Structural", item: "Column and beam inspection", checked: false, notes: "" },
  { id: 3, category: "Structural", item: "Load-bearing wall evaluation", checked: false, notes: "" },
  { id: 4, category: "Electrical", item: "Main distribution panel inspection", checked: false, notes: "" },
  { id: 5, category: "Electrical", item: "Wiring and conduit assessment", checked: false, notes: "" },
  { id: 6, category: "Plumbing", item: "Water supply line inspection", checked: false, notes: "" },
  { id: 7, category: "Plumbing", item: "Drainage system assessment", checked: false, notes: "" },
  { id: 8, category: "Safety", item: "Fire exit accessibility check", checked: false, notes: "" },
  { id: 9, category: "Safety", item: "PPE availability check", checked: false, notes: "" },
]

export default function NewSurveyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [formData, setFormData] = useState({
    project: "", surveyType: "", title: "", description: "",
    scheduledDate: "", engineer: "",
    latitude: "", longitude: "", weatherCondition: "", siteCondition: "",
    accessDetails: "",
  })
  const [checklistItems, setChecklistItems] = useState(defaultChecklistItems)
  const [newItemCategory, setNewItemCategory] = useState("Structural")
  const [newItemText, setNewItemText] = useState("")
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [engineers, setEngineers] = useState<EngineerOption[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [engineersLoading, setEngineersLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/projects?limit=200')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setProjects(data.data)
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false))

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.users || []
        setEngineers(list.filter((u: EngineerOption) => u.role === 'ENGINEER' || u.role === 'SURVEYOR'))
      })
      .catch(() => {})
      .finally(() => setEngineersLoading(false))
  }, [])

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleChecklistItem = (id: number) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const updateChecklistNotes = (id: number, notes: string) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item))
  }

  const addChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklistItems(prev => [...prev, { id: Date.now(), category: newItemCategory, item: newItemText.trim(), checked: false, notes: "" }])
      setNewItemText("")
    }
  }

  const removeChecklistItem = (id: number) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const groupedChecklist = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof checklistItems>)

  const checklistProgress = checklistItems.length > 0
    ? Math.round((checklistItems.filter(i => i.checked).length / checklistItems.length) * 100)
    : 0

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError("Geolocation is not supported by your browser")
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData("latitude", position.coords.latitude.toFixed(6))
        updateFormData("longitude", position.coords.longitude.toFixed(6))
        setGpsLoading(false)
      },
      (error) => {
        setSubmitError(`Unable to get location: ${error.message}`)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!(formData.project && formData.surveyType && formData.title)
      case 2: return !!(formData.scheduledDate && formData.engineer)
      default: return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: formData.project,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          type: formData.surveyType,
          scheduledDate: formData.scheduledDate || undefined,
          engineerId: formData.engineer || undefined,
          weatherCondition: formData.weatherCondition || undefined,
          siteCondition: formData.siteCondition || undefined,
          accessDetails: formData.accessDetails || undefined,
          gpsLatitude: formData.latitude || undefined,
          gpsLongitude: formData.longitude || undefined,
          checklistItems: checklistItems.map((i) => ({
            category: i.category,
            item: i.item,
            notes: i.notes || undefined,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || "Failed to create survey")
        setIsSubmitting(false)
        return
      }
      setShowSuccess(true)
      setTimeout(() => router.push("/surveys"), 2000)
    } catch {
      setSubmitError("Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Survey"
        description="Set up a new site survey with checklist and assignment"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: "New Survey" },
        ]}
      />

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Survey created successfully! Redirecting...</span>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
          {submitError}
        </div>
      )}

      {/* Step Indicator */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 relative flex flex-col items-center gap-2 py-4 px-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isActive ? "border-primary-foreground bg-primary-foreground/20" :
                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                    "border-muted-foreground/30"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="hidden md:block text-xs">{step.title}</span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 hidden lg:block" />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => { const Icon = steps[currentStep - 1].icon; return <Icon className="h-5 w-5" /> })()}
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Project & Type */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select value={formData.project} onValueChange={(v) => updateFormData("project", v)}>
                      <SelectTrigger><SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select a project"} /></SelectTrigger>
                      <SelectContent>
                        {projectsLoading ? (
                          <SelectItem value="__loading" disabled>Loading projects...</SelectItem>
                        ) : projects.length === 0 ? (
                          <SelectItem value="__none" disabled>No projects found</SelectItem>
                        ) : (
                          projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Survey Type *</Label>
                    <Select value={formData.surveyType} onValueChange={(v) => updateFormData("surveyType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select survey type" /></SelectTrigger>
                      <SelectContent>
                        {SURVEY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Survey Title *</Label>
                    <Input placeholder="e.g., Foundation Inspection - Phase 1" value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Provide a detailed description of the survey objectives and scope..." rows={4} value={formData.description} onChange={(e) => updateFormData("description", e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 2: Schedule & Assignment */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Scheduled Date *</Label>
                    <Input type="date" value={formData.scheduledDate} onChange={(e) => updateFormData("scheduledDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Engineer *</Label>
                    <Select value={formData.engineer} onValueChange={(v) => updateFormData("engineer", v)}>
                      <SelectTrigger><SelectValue placeholder={engineersLoading ? "Loading engineers..." : "Select engineer"} /></SelectTrigger>
                      <SelectContent>
                        {engineersLoading ? (
                          <SelectItem value="__loading" disabled>Loading engineers...</SelectItem>
                        ) : engineers.length === 0 ? (
                          <SelectItem value="__none" disabled>No engineers found</SelectItem>
                        ) : (
                          engineers.map(e => (
                            <SelectItem key={e.id} value={e.id}>
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                  {e.firstName[0]}{e.lastName[0]}
                                </div>
                                <span>{e.firstName} {e.lastName}</span>
                                <span className="text-xs text-muted-foreground">({e.role})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Site Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Location</Label>
                    <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={gpsLoading}>
                      {gpsLoading ? (
                        <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Getting Location...</>
                      ) : (
                        <><MapPin className="h-4 w-4 mr-2" />Get Current Location</>
                      )}
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Latitude</Label>
                        <Input placeholder="e.g., 19.0760" value={formData.latitude} onChange={(e) => updateFormData("latitude", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Longitude</Label>
                        <Input placeholder="e.g., 72.8777" value={formData.longitude} onChange={(e) => updateFormData("longitude", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weather Condition</Label>
                      <Input placeholder="e.g., Clear sky" value={formData.weatherCondition} onChange={(e) => updateFormData("weatherCondition", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Site Condition</Label>
                      <Input placeholder="e.g., Accessible" value={formData.siteCondition} onChange={(e) => updateFormData("siteCondition", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Access Details</Label>
                    <Textarea placeholder="Describe site access: gate codes, parking, restricted areas..." rows={3} value={formData.accessDetails} onChange={(e) => updateFormData("accessDetails", e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 4: Checklist */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      <span className="font-medium">Checklist Items ({checklistItems.length})</span>
                    </div>
                    <Badge variant="secondary">{checklistItems.filter(i => i.checked).length}/{checklistItems.length} checked</Badge>
                  </div>

                  <Progress value={checklistProgress} showValue className="h-3" />

                  {Object.entries(groupedChecklist).map(([category, items]) => {
                    const catChecked = items.filter(i => i.checked).length
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{category}</h4>
                          <span className="text-xs text-muted-foreground">{catChecked}/{items.length}</span>
                        </div>
                        <div className="space-y-1">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move mt-0.5 shrink-0" />
                              <Checkbox checked={item.checked} onCheckedChange={() => toggleChecklistItem(item.id)} className="mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.item}</span>
                                <Input
                                  placeholder="Add notes..."
                                  className="mt-1 h-8 text-xs"
                                  value={item.notes}
                                  onChange={(e) => updateChecklistNotes(item.id, e.target.value)}
                                />
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeChecklistItem(item.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex gap-2 pt-4 border-t">
                    <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Structural">Structural</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Add new checklist item..." value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} />
                    <Button onClick={addChecklistItem}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Project & Type</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{projects.find(p => p.id === formData.project)?.name || "—"}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{SURVEY_TYPES.find(t => t.value === formData.surveyType)?.label || "—"}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Title:</span> <span className="font-medium">{formData.title || "—"}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Schedule & Assignment</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formData.scheduledDate || "—"}</span></div>
                        <div><span className="text-muted-foreground">Engineer:</span> <span className="font-medium">{(() => { const eng = engineers.find(e => e.id === formData.engineer); return eng ? `${eng.firstName} ${eng.lastName}` : "—"; })()}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Site Details</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : "—"}</span></div>
                        <div><span className="text-muted-foreground">Weather:</span> <span className="font-medium">{formData.weatherCondition || "—"}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Checklist</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>Edit</Button>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={checklistProgress} className="h-2 flex-1" />
                          <span className="text-muted-foreground">{checklistProgress}% complete</span>
                        </div>
                        <p className="text-muted-foreground">{checklistItems.length} items across {Object.keys(groupedChecklist).length} categories</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep === 5 ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Creating...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" /> Create Survey</>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))} disabled={!canProceed()}>
                      Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Survey Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(currentStep / 5) * 100} showValue className="h-2" />
              <div className="space-y-2">
                {steps.map(step => {
                  const Icon = step.icon
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                        currentStep === step.id ? "bg-primary text-primary-foreground" :
                        currentStep > step.id ? "bg-primary/10 text-primary" :
                        "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      {step.title}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
