"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, MapPin, Calendar, User, Cloud, FileText,
  CheckCircle2, Clock, AlertTriangle, Camera, Video,
  Mic, Pencil, Ruler, ChevronRight, Edit, MoreHorizontal,
  Play, Pause, Download, Eye, Trash2, Upload, X, Plus,
  AlertCircle, Star, Zap, Droplets, Flame, Building2, Route,
  Copy
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const surveyData = {
  id: "SUR-001",
  title: "Foundation Inspection - Phase 1",
  project: "Riverside Tower Complex",
  projectId: "PRJ-001",
  type: "Initial",
  status: "in_progress",
  description: "Comprehensive foundation inspection covering structural integrity, load distribution, and soil conditions for the first phase of the Riverside Tower Complex development.",
  priority: "high",
  engineer: { name: "Rajesh Kumar", initials: "RK", avatar: "", email: "rajesh.kumar@company.com", phone: "+91 98765 43210" },
  scheduledDate: "2026-07-08",
  startDate: "2026-07-08",
  createdAt: "2026-07-01",
  location: { latitude: 19.0760, longitude: 72.8777, address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051" },
  conditions: { weather: "Clear Sky", siteCondition: "Accessible", buildingType: "Commercial", constructionStage: "Foundation", floors: 12 },
  infrastructure: {
    electricity: { available: true, type: "3-Phase", load: "500 kVA" },
    water: { available: true, source: "Municipal" },
    drainage: { connected: true, type: "Both" },
    fireSafety: { available: true, extinguishers: 8, sprinklers: 24, alarm: "Automatic" },
    structureCondition: 4,
  },
  checklist: {
    total: 18,
    completed: 11,
    items: [
      { id: 1, category: "Structural", item: "Foundation condition assessment", completed: true, notes: "Found minor cracks on east side" },
      { id: 2, category: "Structural", item: "Column and beam inspection", completed: true, notes: "" },
      { id: 3, category: "Structural", item: "Load-bearing wall evaluation", completed: true, notes: "" },
      { id: 4, category: "Structural", item: "Slab thickness verification", completed: true, notes: "Measured 200mm, within spec" },
      { id: 5, category: "Structural", item: "Rebar placement verification", completed: true, notes: "" },
      { id: 6, category: "Electrical", item: "Main distribution panel inspection", completed: true, notes: "" },
      { id: 7, category: "Electrical", item: "Wiring and conduit assessment", completed: true, notes: "" },
      { id: 8, category: "Electrical", item: "Grounding system verification", completed: true, notes: "" },
      { id: 9, category: "Electrical", item: "Lighting fixture evaluation", completed: true, notes: "" },
      { id: 10, category: "Plumbing", item: "Water supply line inspection", completed: true, notes: "" },
      { id: 11, category: "Plumbing", item: "Drainage system assessment", completed: true, notes: "" },
      { id: 12, category: "Plumbing", item: "Fire sprinkler system check", completed: false, notes: "" },
      { id: 13, category: "Safety", item: "Fire exit accessibility check", completed: false, notes: "" },
      { id: 14, category: "Safety", item: "Emergency lighting verification", completed: false, notes: "" },
      { id: 15, category: "Safety", item: "PPE availability check", completed: false, notes: "" },
      { id: 16, category: "Environmental", item: "Air quality assessment", completed: false, notes: "" },
      { id: 17, category: "Environmental", item: "Noise level measurement", completed: false, notes: "" },
      { id: 18, category: "Environmental", item: "Dust control measures", completed: false, notes: "" },
    ],
  },
  photos: [
    { id: 1, caption: "Foundation cracks - East side", date: "2026-07-08" },
    { id: 2, caption: "Rebar inspection detail", date: "2026-07-08" },
    { id: 3, caption: "Column base connection", date: "2026-07-08" },
    { id: 4, caption: "Drainage pipe alignment", date: "2026-07-08" },
    { id: 5, caption: "Electrical panel close-up", date: "2026-07-08" },
  ],
  videos: [
    { id: 1, title: "Foundation walkthrough", duration: "5:32", date: "2026-07-08", size: "45 MB" },
    { id: 2, title: "Crack measurement recording", duration: "2:15", date: "2026-07-08", size: "18 MB" },
  ],
  voiceNotes: [
    { id: 1, title: "Observation notes - East section", duration: "1:45", date: "2026-07-08", transcription: "Noticed hairline cracks along the east foundation wall, approximately 2mm width. Need further investigation with crack monitoring gauges. Recommend structural engineer review before next concrete pour." },
    { id: 2, title: "Safety concerns", duration: "0:58", date: "2026-07-08", transcription: "Temporary shoring appears adequate but recommend additional bracing before next concrete pour. PPE compliance is good across all workers on site." },
  ],
  measurements: [
    { id: 1, category: "Foundation", description: "Main foundation depth", length: 12.5, width: 8.0, height: 2.0, unit: "m" },
    { id: 2, category: "Foundation", description: "Footing width", length: 1.2, width: 0.6, height: 0.3, unit: "m" },
    { id: 3, category: "Column", description: "C1 Column section", length: 0.6, width: 0.6, height: 3.2, unit: "m" },
    { id: 4, category: "Slab", description: "First floor slab", length: 25.0, width: 15.0, height: 0.2, unit: "m" },
  ],
  risks: [
    { id: 1, title: "Potential Foundation Settlement", description: "Minor cracks observed on east side. Recommend monitoring and further structural analysis.", severity: "medium", date: "2026-07-08" },
    { id: 2, title: "Load Distribution Normal", description: "All load-bearing elements within acceptable parameters.", severity: "low", date: "2026-07-08" },
    { id: 3, title: "Water Table Concern", description: "High water table detected at 3.2m depth. Dewatering may be required.", severity: "high", date: "2026-07-08" },
  ],
  materials: [
    { id: 1, material: "Ready-Mix Concrete", specification: "M30 Grade", quantity: "45 m³", cost: "₹2,70,000", status: "approved" },
    { id: 2, material: "Steel Rebar", specification: "Fe 500D, 16mm", quantity: "2.5 tonnes", cost: "₹2,12,500", status: "approved" },
    { id: 3, material: "Waterproofing Membrane", specification: "Bituminous, 4mm", quantity: "200 m²", cost: "₹96,000", status: "pending" },
    { id: 4, material: "PVC Pipes", specification: "110mm, Class 4", quantity: "120 m", cost: "₹18,000", status: "pending" },
  ],
}

const statusWorkflow = [
  { status: "Draft", completed: true },
  { status: "Assigned", completed: true },
  { status: "In Progress", completed: false, current: true },
  { status: "Submitted", completed: false },
  { status: "Under Review", completed: false },
  { status: "Approved", completed: false },
]

const checklistCategories = ["Structural", "Electrical", "Plumbing", "Safety", "Environmental"]

export default function SurveyDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [newRiskTitle, setNewRiskTitle] = useState("")
  const [newRiskDesc, setNewRiskDesc] = useState("")
  const [newRiskSeverity, setNewRiskSeverity] = useState("medium")
  const [newMaterialName, setNewMaterialName] = useState("")
  const [newMaterialSpec, setNewMaterialSpec] = useState("")
  const [newMaterialQty, setNewMaterialQty] = useState("")
  const [newMeasurementCategory, setNewMeasurementCategory] = useState("Foundation")
  const [newMeasurementDesc, setNewMeasurementDesc] = useState("")

  const checklistProgress = Math.round((surveyData.checklist.completed / surveyData.checklist.total) * 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title={surveyData.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: surveyData.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> PDF</Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" /> Print</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Start Survey</DropdownMenuItem>
                <DropdownMenuItem><Upload className="h-4 w-4 mr-2" /> Submit for Review</DropdownMenuItem>
                <DropdownMenuItem><CheckCircle2 className="h-4 w-4 mr-2" /> Approve</DropdownMenuItem>
                <DropdownMenuItem><Clock className="h-4 w-4 mr-2" /> Request Revision</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Reject</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Status Workflow */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 overflow-x-auto">
          {statusWorkflow.map((step, index) => (
            <div key={step.status} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                step.current ? "bg-primary text-primary-foreground shadow-md" :
                step.completed ? "bg-emerald-100 text-emerald-800" :
                "bg-muted text-muted-foreground"
              }`}>
                {step.completed ? <CheckCircle2 className="h-4 w-4" /> :
                 step.current ? <Clock className="h-4 w-4" /> : null}
                {step.status}
              </div>
              {index < statusWorkflow.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="voice-notes">Voice Notes</TabsTrigger>
          <TabsTrigger value="sketches">Sketches</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Survey Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Survey ID</p><p className="font-medium">{surveyData.id}</p></div>
                  <div><p className="text-sm text-muted-foreground">Type</p><Badge>{surveyData.type}</Badge></div>
                  <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={surveyData.status} /></div>
                  <div><p className="text-sm text-muted-foreground">Priority</p><Badge variant={surveyData.priority === "high" ? "warning" : "secondary"} className="capitalize">{surveyData.priority}</Badge></div>
                  <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{surveyData.createdAt}</p></div>
                  <div><p className="text-sm text-muted-foreground">Scheduled</p><div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" /><p className="font-medium">{surveyData.scheduledDate}</p></div></div>
                  <div><p className="text-sm text-muted-foreground">Building Type</p><p className="font-medium">{surveyData.conditions.buildingType}</p></div>
                  <div><p className="text-sm text-muted-foreground">Construction Stage</p><p className="font-medium">{surveyData.conditions.constructionStage}</p></div>
                  <div><p className="text-sm text-muted-foreground">Floors</p><p className="font-medium">{surveyData.conditions.floors}</p></div>
                </div>
                <div><p className="text-sm text-muted-foreground mb-1">Description</p><p className="text-sm">{surveyData.description}</p></div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Assigned Engineer</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12"><AvatarFallback>{surveyData.engineer.initials}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{surveyData.engineer.name}</p>
                      <p className="text-sm text-muted-foreground">{surveyData.engineer.email}</p>
                      <p className="text-sm text-muted-foreground">{surveyData.engineer.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Site Conditions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2"><Cloud className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Weather: {surveyData.conditions.weather}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Access: {surveyData.conditions.siteCondition}</span></div>
                  <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" /><span className="text-sm">Condition: {surveyData.infrastructure.structureCondition}/5</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 text-center">
                    <MapPin className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Interactive Map</p>
                  </div>
                  <p className="text-sm">{surveyData.location.address}</p>
                  <p className="text-xs text-muted-foreground">Lat: {surveyData.location.latitude}, Lng: {surveyData.location.longitude}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Infrastructure</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Electricity</div>
                    <Badge variant={surveyData.infrastructure.electricity.available ? "success" : "secondary"}>{surveyData.infrastructure.electricity.available ? surveyData.infrastructure.electricity.type : "N/A"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-500" /> Water</div>
                    <Badge variant={surveyData.infrastructure.water.available ? "success" : "secondary"}>{surveyData.infrastructure.water.available ? surveyData.infrastructure.water.source : "N/A"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-cyan-500" /> Drainage</div>
                    <Badge variant={surveyData.infrastructure.drainage.connected ? "success" : "secondary"}>{surveyData.infrastructure.drainage.connected ? surveyData.infrastructure.drainage.type : "N/A"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-red-500" /> Fire Safety</div>
                    <Badge variant={surveyData.infrastructure.fireSafety.available ? "success" : "secondary"}>{surveyData.infrastructure.fireSafety.available ? `${surveyData.infrastructure.fireSafety.extinguishers} extinguishers` : "N/A"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Survey Checklist</span>
                <Badge variant="secondary">{surveyData.checklist.completed}/{surveyData.checklist.total} completed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={checklistProgress} showValue className="mb-6 h-3" />
              <div className="space-y-6">
                {checklistCategories.map(category => {
                  const items = surveyData.checklist.items.filter(i => i.category === category)
                  const catCompleted = items.filter(i => i.completed).length
                  if (items.length === 0) return null
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase">{category}</h4>
                        <span className="text-xs text-muted-foreground">{catCompleted}/{items.length}</span>
                      </div>
                      <Progress value={(catCompleted / items.length) * 100} className="h-1.5 mb-3" />
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                            {item.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <span className={`text-sm ${item.completed ? "text-muted-foreground line-through" : ""}`}>{item.item}</span>
                              {item.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Survey Photos ({surveyData.photos.length})</span>
                <Button size="sm"><Camera className="h-4 w-4 mr-2" /> Upload Photo</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {surveyData.photos.map(photo => (
                  <div key={photo.id} className="group relative rounded-lg border overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" className="h-9 w-9 bg-white/90 text-foreground hover:bg-white"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-9 w-9 bg-white/90 text-foreground hover:bg-white"><Download className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-9 w-9 bg-destructive/90 text-destructive-foreground hover:bg-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{photo.caption}</p>
                      <p className="text-xs text-muted-foreground">{photo.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Survey Videos ({surveyData.videos.length})</span>
                <Button size="sm"><Video className="h-4 w-4 mr-2" /> Upload Video</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {surveyData.videos.map(video => (
                <div key={video.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="h-16 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded flex items-center justify-center shrink-0">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{video.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{video.duration}</span>
                      <span>{video.size}</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Play className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Notes Tab */}
        <TabsContent value="voice-notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Voice Notes ({surveyData.voiceNotes.length})</span>
                <Button size="sm"><Mic className="h-4 w-4 mr-2" /> Record Note</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {surveyData.voiceNotes.map(note => (
                <div key={note.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0"><Play className="h-5 w-5" /></Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{note.title}</p>
                        <span className="text-sm text-muted-foreground">{note.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 h-8">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div key={i} className="w-1 bg-primary/30 rounded-full" style={{ height: `${Math.random() * 24 + 8}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wide">Transcription</p>
                    {note.transcription}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sketches Tab */}
        <TabsContent value="sketches" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Sketches</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Pencil className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-lg font-medium mt-4">No Sketches Yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create hand-drawn sketches to document site observations</p>
                <Button className="mt-4"><Pencil className="h-4 w-4 mr-2" /> Open Sketch Pad</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Measurements ({surveyData.measurements.length})</span>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Measurement</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Width</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Volume/Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveyData.measurements.map(m => {
                    const volume = m.length * m.width * m.height
                    return (
                      <TableRow key={m.id}>
                        <TableCell><Badge variant="secondary">{m.category}</Badge></TableCell>
                        <TableCell className="font-medium">{m.description}</TableCell>
                        <TableCell>{m.length}</TableCell>
                        <TableCell>{m.width}</TableCell>
                        <TableCell>{m.height}</TableCell>
                        <TableCell>{m.unit}</TableCell>
                        <TableCell className="font-medium">{volume.toFixed(2)} m³</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">Total Volume:</span>
                <span className="text-lg font-bold">{surveyData.measurements.reduce((sum, m) => sum + m.length * m.width * m.height, 0).toFixed(2)} m³</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {surveyData.risks.map(risk => (
                <div key={risk.id} className={`flex items-start gap-3 p-4 rounded-lg border ${
                  risk.severity === "high" ? "border-red-200 bg-red-50" :
                  risk.severity === "medium" ? "border-amber-200 bg-amber-50" :
                  "border-emerald-200 bg-emerald-50"
                }`}>
                  {risk.severity === "high" ? <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" /> :
                   risk.severity === "medium" ? <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" /> :
                   <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${risk.severity === "high" ? "text-red-800" : risk.severity === "medium" ? "text-amber-800" : "text-emerald-800"}`}>{risk.title}</p>
                      <Badge variant={risk.severity === "high" ? "destructive" : risk.severity === "medium" ? "warning" : "success"} className="capitalize">{risk.severity} Risk</Badge>
                    </div>
                    <p className={`text-sm mt-1 ${risk.severity === "high" ? "text-red-700" : risk.severity === "medium" ? "text-amber-700" : "text-emerald-700"}`}>{risk.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{risk.date}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Add Risk</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Risk title" value={newRiskTitle} onChange={(e) => setNewRiskTitle(e.target.value)} />
                  <Input placeholder="Description" value={newRiskDesc} onChange={(e) => setNewRiskDesc(e.target.value)} />
                  <div className="flex gap-2">
                    <Select value={newRiskSeverity} onValueChange={setNewRiskSeverity}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Materials Inventory</span>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Material</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Specification</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveyData.materials.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.material}</TableCell>
                      <TableCell>{m.specification}</TableCell>
                      <TableCell>{m.quantity}</TableCell>
                      <TableCell className="font-medium">{m.cost}</TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Total Cost:</span>
                <span className="text-lg font-bold">₹5,96,500</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Printer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
    </svg>
  )
}
