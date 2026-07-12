"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight, ChevronLeft, Plus, Trash2, GripVertical,
  MapPin, Calendar, User, Cloud, FileText, CheckCircle2,
  ClipboardCheck, AlertCircle, Upload, Mic, Video, Camera,
  Pencil, Save, Send, Star, X, CircleDot, Building2,
  Zap, Droplets, Flame, Home, Map
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const steps = [
  { id: 1, title: "Project Selection", icon: Building2 },
  { id: 2, title: "Schedule & Assignment", icon: Calendar },
  { id: 3, title: "Site Information", icon: MapPin },
  { id: 4, title: "Infrastructure", icon: Zap },
  { id: 5, title: "Checklist", icon: ClipboardCheck },
  { id: 6, title: "Media & Docs", icon: Camera },
  { id: 7, title: "Review & Submit", icon: CheckCircle2 },
]

const mockProjects = [
  "Riverside Tower Complex", "Green Valley Office Park", "Metro Residential Towers",
  "Downtown Mall Expansion", "Heritage Building Renovation", "Lakeside Villa Community",
]

const mockEngineers = [
  { name: "Rajesh Kumar", initials: "RK", specialties: ["Structural", "Foundation"] },
  { name: "Priya Sharma", initials: "PS", specialties: ["Electrical", "HVAC"] },
  { name: "Amit Patel", initials: "AP", specialties: ["Plumbing", "Environmental"] },
  { name: "Neha Gupta", initials: "NG", specialties: ["Safety", "Interior"] },
  { name: "Suresh Reddy", initials: "SR", specialties: ["Structural", "Environmental"] },
]

const defaultChecklistItems = [
  { id: 1, category: "Structural", item: "Foundation condition assessment", checked: false, notes: "" },
  { id: 2, category: "Structural", item: "Column and beam inspection", checked: false, notes: "" },
  { id: 3, category: "Structural", item: "Load-bearing wall evaluation", checked: false, notes: "" },
  { id: 4, category: "Structural", item: "Slab thickness verification", checked: false, notes: "" },
  { id: 5, category: "Structural", item: "Rebar placement verification", checked: false, notes: "" },
  { id: 6, category: "Electrical", item: "Main distribution panel inspection", checked: false, notes: "" },
  { id: 7, category: "Electrical", item: "Wiring and conduit assessment", checked: false, notes: "" },
  { id: 8, category: "Electrical", item: "Grounding system verification", checked: false, notes: "" },
  { id: 9, category: "Electrical", item: "Lighting fixture evaluation", checked: false, notes: "" },
  { id: 10, category: "Plumbing", item: "Water supply line inspection", checked: false, notes: "" },
  { id: 11, category: "Plumbing", item: "Drainage system assessment", checked: false, notes: "" },
  { id: 12, category: "Plumbing", item: "Fire sprinkler system check", checked: false, notes: "" },
  { id: 13, category: "Safety", item: "Fire exit accessibility check", checked: false, notes: "" },
  { id: 14, category: "Safety", item: "Emergency lighting verification", checked: false, notes: "" },
  { id: 15, category: "Safety", item: "PPE availability check", checked: false, notes: "" },
  { id: 16, category: "Environmental", item: "Air quality assessment", checked: false, notes: "" },
  { id: 17, category: "Environmental", item: "Noise level measurement", checked: false, notes: "" },
  { id: 18, category: "Environmental", item: "Dust control measures", checked: false, notes: "" },
]

export default function NewSurveyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [formData, setFormData] = useState({
    project: "", surveyType: "", title: "", description: "",
    scheduledDate: "", engineer: "", estimatedDuration: "", priority: "medium",
    latitude: "", longitude: "", weatherCondition: "", siteCondition: "Accessible",
    accessDetails: "", buildingType: "", constructionStage: "", floors: "",
    roadWidth: "", parking: false, boundaryType: "",
    electricityAvailable: false, electricityType: "", electricityLoad: "",
    waterAvailable: false, waterSource: "", drainageConnected: false, drainageType: "",
    fireSafetyAvailable: false, extinguishers: "", sprinklers: "", alarmSystem: "",
    structureCondition: 0,
  })
  const [checklistItems, setChecklistItems] = useState(defaultChecklistItems)
  const [newItemCategory, setNewItemCategory] = useState("Structural")
  const [newItemText, setNewItemText] = useState("")
  const [photos, setPhotos] = useState<{ name: string; size: string }[]>([])
  const [videos, setVideos] = useState<{ name: string; size: string }[]>([])
  const [documents, setDocuments] = useState<{ name: string; size: string }[]>([])

  const updateFormData = (field: string, value: string | boolean | number) => {
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

  const simulateLocation = () => {
    updateFormData("latitude", "19.0760")
    updateFormData("longitude", "72.8777")
  }

  const addMockFiles = (type: "photo" | "video" | "doc") => {
    const mockData = {
      photo: [
        { name: "site_entrance.jpg", size: "2.4 MB" },
        { name: "foundation_area.jpg", size: "3.1 MB" },
        { name: "electrical_panel.jpg", size: "1.8 MB" },
      ],
      video: [
        { name: "site_walkthrough.mp4", size: "45 MB" },
        { name: "crack_measurement.mp4", size: "18 MB" },
      ],
      doc: [
        { name: "site_permission.pdf", size: "1.2 MB" },
        { name: "structural_drawings.pdf", size: "5.6 MB" },
      ],
    }
    const existing = type === "photo" ? photos : type === "video" ? videos : documents
    const available = mockData[type].filter(f => !existing.find(e => e.name === f.name))
    if (available.length > 0) {
      const file = available[0]
      if (type === "photo") setPhotos(prev => [...prev, file])
      else if (type === "video") setVideos(prev => [...prev, file])
      else setDocuments(prev => [...prev, file])
    }
  }

  const removeFile = (type: "photo" | "video" | "doc", index: number) => {
    if (type === "photo") setPhotos(prev => prev.filter((_, i) => i !== index))
    else if (type === "video") setVideos(prev => prev.filter((_, i) => i !== index))
    else setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.project && formData.surveyType && formData.title
      case 2: return formData.scheduledDate && formData.engineer
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
          notes: undefined,
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
      router.push("/surveys")
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
        {/* Step Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => { const Icon = steps[currentStep - 1].icon; return <Icon className="h-5 w-5" /> })()}
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Project Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select value={formData.project} onValueChange={(v) => updateFormData("project", v)}>
                      <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                      <SelectContent>
                        {mockProjects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Survey Type *</Label>
                    <Select value={formData.surveyType} onValueChange={(v) => updateFormData("surveyType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select survey type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Initial">Initial Survey</SelectItem>
                        <SelectItem value="Detailed">Detailed Survey</SelectItem>
                        <SelectItem value="Follow-up">Follow-up Survey</SelectItem>
                        <SelectItem value="Final">Final Survey</SelectItem>
                        <SelectItem value="As-Built">As-Built Survey</SelectItem>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheduled Date *</Label>
                      <Input type="date" value={formData.scheduledDate} onChange={(e) => updateFormData("scheduledDate", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Duration</Label>
                      <Input placeholder="e.g., 4 hours" value={formData.estimatedDuration} onChange={(e) => updateFormData("estimatedDuration", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Engineer *</Label>
                    <Select value={formData.engineer} onValueChange={(v) => updateFormData("engineer", v)}>
                      <SelectTrigger><SelectValue placeholder="Select engineer" /></SelectTrigger>
                      <SelectContent>
                        {mockEngineers.map(e => (
                          <SelectItem key={e.name} value={e.name}>
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{e.initials}</div>
                              <span>{e.name}</span>
                              <span className="text-xs text-muted-foreground">({e.specialties.join(", ")})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                      {["low", "medium", "high", "critical"].map(p => (
                        <Button key={p} variant={formData.priority === p ? "default" : "outline"} size="sm" onClick={() => updateFormData("priority", p)} className="capitalize">
                          {p === "critical" && <span className="h-2 w-2 rounded-full bg-red-500 mr-1" />}
                          {p === "high" && <span className="h-2 w-2 rounded-full bg-orange-500 mr-1" />}
                          {p === "medium" && <span className="h-2 w-2 rounded-full bg-amber-400 mr-1" />}
                          {p === "low" && <span className="h-2 w-2 rounded-full bg-green-500 mr-1" />}
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Site Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Location</Label>
                    <div className="rounded-xl border border-dashed p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                      <div className="text-center space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Map className="h-8 w-8 text-primary" />
                        </div>
                        <p className="font-medium">Map Integration Area</p>
                        <p className="text-sm text-muted-foreground">Google Maps / Leaflet will be integrated here</p>
                        <Button variant="outline" size="sm" onClick={simulateLocation}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Current Location
                        </Button>
                      </div>
                    </div>
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
                      <Select value={formData.weatherCondition} onValueChange={(v) => updateFormData("weatherCondition", v)}>
                        <SelectTrigger><SelectValue placeholder="Select weather" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Clear">Clear Sky</SelectItem>
                          <SelectItem value="Cloudy">Cloudy</SelectItem>
                          <SelectItem value="Rainy">Rainy</SelectItem>
                          <SelectItem value="Stormy">Stormy</SelectItem>
                          <SelectItem value="Foggy">Foggy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Site Condition</Label>
                      <Select value={formData.siteCondition} onValueChange={(v) => updateFormData("siteCondition", v)}>
                        <SelectTrigger><SelectValue placeholder="Site access" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accessible">Accessible</SelectItem>
                          <SelectItem value="Partially Accessible">Partially Accessible</SelectItem>
                          <SelectItem value="Restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Access Details</Label>
                    <Textarea placeholder="Describe site access: gate codes, parking, restricted areas..." rows={3} value={formData.accessDetails} onChange={(e) => updateFormData("accessDetails", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Building Type</Label>
                      <Select value={formData.buildingType} onValueChange={(v) => updateFormData("buildingType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Construction Stage</Label>
                      <Select value={formData.constructionStage} onValueChange={(v) => updateFormData("constructionStage", v)}>
                        <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Foundation">Foundation</SelectItem>
                          <SelectItem value="Structure">Structure</SelectItem>
                          <SelectItem value="Finishing">Finishing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Floors</Label>
                      <Input type="number" placeholder="e.g., 12" value={formData.floors} onChange={(e) => updateFormData("floors", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Road Width (m)</Label>
                      <Input type="number" placeholder="e.g., 12" value={formData.roadWidth} onChange={(e) => updateFormData("roadWidth", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Boundary Type</Label>
                      <Select value={formData.boundaryType} onValueChange={(v) => updateFormData("boundaryType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Compound Wall">Compound Wall</SelectItem>
                          <SelectItem value="Fence">Fence</SelectItem>
                          <SelectItem value="Natural">Natural Barrier</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="mb-2 block">Parking</Label>
                      <div className="flex items-center gap-3">
                        <Switch checked={formData.parking} onCheckedChange={(v) => updateFormData("parking", v)} />
                        <span className="text-sm">{formData.parking ? "Available" : "Not Available"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Infrastructure Assessment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Electricity */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">Electricity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.electricityAvailable} onCheckedChange={(v) => updateFormData("electricityAvailable", v)} />
                        <span className="text-sm">{formData.electricityAvailable ? "Available" : "Not Available"}</span>
                      </div>
                    </div>
                    {formData.electricityAvailable && (
                      <div className="grid grid-cols-2 gap-4 pl-7">
                        <div className="space-y-2">
                          <Label className="text-sm">Connection Type</Label>
                          <Select value={formData.electricityType} onValueChange={(v) => updateFormData("electricityType", v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3-Phase">3-Phase</SelectItem>
                              <SelectItem value="1-Phase">1-Phase</SelectItem>
                              <SelectItem value="HT">HT Connection</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Load Capacity (kVA)</Label>
                          <Input type="number" placeholder="e.g., 500" value={formData.electricityLoad} onChange={(e) => updateFormData("electricityLoad", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Water Supply */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Water Supply</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.waterAvailable} onCheckedChange={(v) => updateFormData("waterAvailable", v)} />
                        <span className="text-sm">{formData.waterAvailable ? "Available" : "Not Available"}</span>
                      </div>
                    </div>
                    {formData.waterAvailable && (
                      <div className="pl-7">
                        <Label className="text-sm">Source</Label>
                        <Select value={formData.waterSource} onValueChange={(v) => updateFormData("waterSource", v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select source" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Municipal">Municipal Supply</SelectItem>
                            <SelectItem value="Borewell">Borewell</SelectItem>
                            <SelectItem value="Tanker">Water Tanker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Drainage */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-cyan-500" />
                        <span className="font-semibold">Drainage System</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.drainageConnected} onCheckedChange={(v) => updateFormData("drainageConnected", v)} />
                        <span className="text-sm">{formData.drainageConnected ? "Connected" : "Not Connected"}</span>
                      </div>
                    </div>
                    {formData.drainageConnected && (
                      <div className="pl-7">
                        <Label className="text-sm">Drainage Type</Label>
                        <Select value={formData.drainageType} onValueChange={(v) => updateFormData("drainageType", v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Storm">Storm Water</SelectItem>
                            <SelectItem value="Sewage">Sewage</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Fire Safety */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">Fire Safety</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.fireSafetyAvailable} onCheckedChange={(v) => updateFormData("fireSafetyAvailable", v)} />
                        <span className="text-sm">{formData.fireSafetyAvailable ? "Available" : "Not Available"}</span>
                      </div>
                    </div>
                    {formData.fireSafetyAvailable && (
                      <div className="grid grid-cols-3 gap-4 pl-7">
                        <div className="space-y-2">
                          <Label className="text-sm">Extinguishers</Label>
                          <Input type="number" placeholder="Qty" value={formData.extinguishers} onChange={(e) => updateFormData("extinguishers", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Sprinklers</Label>
                          <Input type="number" placeholder="Qty" value={formData.sprinklers} onChange={(e) => updateFormData("sprinklers", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Alarm System</Label>
                          <Select value={formData.alarmSystem} onValueChange={(v) => updateFormData("alarmSystem", v)}>
                            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="Automatic">Automatic</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Structure Condition Rating */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <Label className="font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-500" />
                      Structure Condition Rating
                    </Label>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => updateFormData("structureCondition", star)} className="transition-transform hover:scale-110">
                          <Star className={`h-8 w-8 ${star <= formData.structureCondition ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                      <span className="ml-3 text-sm text-muted-foreground">
                        {formData.structureCondition === 0 && "Not rated"}
                        {formData.structureCondition === 1 && "Poor"}
                        {formData.structureCondition === 2 && "Fair"}
                        {formData.structureCondition === 3 && "Good"}
                        {formData.structureCondition === 4 && "Very Good"}
                        {formData.structureCondition === 5 && "Excellent"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Checklist */}
              {currentStep === 5 && (
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

              {/* Step 6: Media & Documentation */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  {/* Photos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold flex items-center gap-2"><Camera className="h-4 w-4" /> Photos</Label>
                      <Button variant="outline" size="sm" onClick={() => addMockFiles("photo")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
                    </div>
                    <div className="rounded-lg border-2 border-dashed p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => addMockFiles("photo")}>
                      <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Click or drag photos here to upload</p>
                    </div>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {photos.map((photo, i) => (
                          <div key={i} className="relative group rounded-lg border overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center"><Camera className="h-8 w-8 text-muted-foreground" /></div>
                            <div className="p-2">
                              <p className="text-xs font-medium truncate">{photo.name}</p>
                              <p className="text-xs text-muted-foreground">{photo.size}</p>
                            </div>
                            <button onClick={() => removeFile("photo", i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold flex items-center gap-2"><Video className="h-4 w-4" /> Videos</Label>
                      <Button variant="outline" size="sm" onClick={() => addMockFiles("video")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
                    </div>
                    {videos.map((video, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-12 w-16 bg-muted rounded flex items-center justify-center"><Video className="h-5 w-5 text-muted-foreground" /></div>
                        <div className="flex-1"><p className="text-sm font-medium">{video.name}</p><p className="text-xs text-muted-foreground">{video.size}</p></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile("video", i)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>

                  {/* Voice Notes */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2"><Mic className="h-4 w-4" /> Voice Notes</Label>
                    <div className="rounded-lg border p-6 text-center">
                      <Button variant="outline" size="lg" className="rounded-full h-16 w-16 mx-auto">
                        <Mic className="h-6 w-6" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-3">Tap to record voice note</p>
                      <div className="flex items-center justify-center gap-0.5 mt-3 h-8">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div key={i} className="w-1 bg-primary/20 rounded-full" style={{ height: `${Math.random() * 24 + 8}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Documents & Drawings</Label>
                      <Button variant="outline" size="sm" onClick={() => addMockFiles("doc")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
                    </div>
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div className="flex-1"><p className="text-sm font-medium">{doc.name}</p><p className="text-xs text-muted-foreground">{doc.size}</p></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile("doc", i)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7: Review & Submit */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  {/* Summary Sections */}
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Project & Type</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{formData.project || "—"}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{formData.surveyType || "—"}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Title:</span> <span className="font-medium">{formData.title || "—"}</span></div>
                        {formData.description && <div className="col-span-2"><span className="text-muted-foreground">Description:</span> <span className="font-medium">{formData.description}</span></div>}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Schedule & Assignment</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formData.scheduledDate || "—"}</span></div>
                        <div><span className="text-muted-foreground">Engineer:</span> <span className="font-medium">{formData.engineer || "—"}</span></div>
                        <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{formData.priority}</span></div>
                        <div><span className="text-muted-foreground">Duration:</span> <span className="font-medium">{formData.estimatedDuration || "—"}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Site Information</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : "—"}</span></div>
                        <div><span className="text-muted-foreground">Weather:</span> <span className="font-medium">{formData.weatherCondition || "—"}</span></div>
                        <div><span className="text-muted-foreground">Building Type:</span> <span className="font-medium">{formData.buildingType || "—"}</span></div>
                        <div><span className="text-muted-foreground">Stage:</span> <span className="font-medium">{formData.constructionStage || "—"}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Checklist</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
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

                  {/* Digital Signature */}
                  <div className="rounded-lg border p-4">
                    <Label className="font-semibold mb-3 block">Digital Signature</Label>
                    <div className="rounded-lg border-2 border-dashed p-8 text-center bg-muted/30">
                      <Pencil className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Click to sign digitally</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Ready to submit?</p>
                      <p className="text-amber-700">The survey will be created and the assigned engineer will be notified via email and SMS.</p>
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
                  {currentStep === 7 ? (
                    <>
                      <Button variant="outline" onClick={() => router.push("/surveys")}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Creating...</>
                        ) : (
                          <><Send className="h-4 w-4 mr-2" /> Create & Submit</>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))} disabled={!canProceed()}>
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
              <Progress value={(currentStep / 7) * 100} showValue className="h-2" />
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
