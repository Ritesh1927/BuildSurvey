"use client"

import { useState } from "react"
import Link from "next/link"
import {
  UserPlus, Calendar, Clock, ChevronRight, MapPin,
  AlertTriangle, CheckCircle2, GripVertical, Users, BarChart3,
  LayoutGrid, List, Eye, ArrowRight
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const unassignedSurveys = [
  { id: "SUR-005", title: "Environmental Impact Survey", project: "Lakeside Villa Community", type: "Initial", scheduledDate: "2026-07-15", priority: "high" },
  { id: "SUR-015", title: "Facade Inspection - East Wing", project: "Downtown Mall Expansion", type: "Detailed", scheduledDate: "2026-07-20", priority: "medium" },
  { id: "SUR-018", title: "Fire Suppression System Audit", project: "Metro Residential Towers", type: "Final", scheduledDate: "2026-07-22", priority: "critical" },
  { id: "SUR-019", title: "Solar Panel Installation Survey", project: "Green Valley Office Park", type: "Initial", scheduledDate: "2026-07-25", priority: "low" },
  { id: "SUR-020", title: "Accessibility Compliance Check", project: "Riverside Tower Complex", type: "Final", scheduledDate: "2026-07-18", priority: "medium" },
]

const assignedSurveys = [
  { id: "SUR-008", title: "HVAC System Inspection", project: "Green Valley Office Park", type: "Follow-up", engineer: "Priya Sharma", scheduledDate: "2026-07-12", priority: "medium" },
  { id: "SUR-010", title: "Elevator Installation Survey", project: "Downtown Mall Expansion", type: "As-Built", engineer: "Neha Gupta", scheduledDate: "2026-07-14", priority: "high" },
  { id: "SUR-021", title: "Basement Waterproofing Survey", project: "Metro Residential Towers", type: "Follow-up", engineer: "Neha Gupta", scheduledDate: "2026-07-16", priority: "medium" },
]

const inProgressSurveys = [
  { id: "SUR-002", title: "Electrical Systems Audit", project: "Green Valley Office Park", type: "Detailed", engineer: "Priya Sharma", progress: 45, startDate: "2026-07-05" },
  { id: "SUR-006", title: "Interior Finishing Quality Check", project: "Riverside Tower Complex", type: "As-Built", engineer: "Rajesh Kumar", progress: 72, startDate: "2026-07-08" },
  { id: "SUR-011", title: "Roofing Material Inspection", project: "Heritage Building Renovation", type: "Detailed", engineer: "Suresh Reddy", progress: 30, startDate: "2026-07-06" },
  { id: "SUR-017", title: "Seismic Resistance Testing", project: "Metro Residential Towers", type: "Initial", engineer: "Suresh Reddy", progress: 58, startDate: "2026-07-09" },
  { id: "SUR-020", title: "Accessibility Compliance Check", project: "Riverside Tower Complex", type: "Final", engineer: "Amit Patel", progress: 15, startDate: "2026-07-11" },
]

const engineers = [
  { name: "Rajesh Kumar", initials: "RK", specialties: ["Structural", "Foundation"], activeSurveys: 3, maxSurveys: 5, upcomingDeadlines: 2, avatar: "" },
  { name: "Priya Sharma", initials: "PS", specialties: ["Electrical", "HVAC"], activeSurveys: 4, maxSurveys: 5, upcomingDeadlines: 3, avatar: "" },
  { name: "Amit Patel", initials: "AP", specialties: ["Plumbing", "Environmental"], activeSurveys: 2, maxSurveys: 5, upcomingDeadlines: 1, avatar: "" },
  { name: "Neha Gupta", initials: "NG", specialties: ["Safety", "Interior"], activeSurveys: 3, maxSurveys: 5, upcomingDeadlines: 2, avatar: "" },
  { name: "Suresh Reddy", initials: "SR", specialties: ["Structural", "Environmental"], activeSurveys: 5, maxSurveys: 5, upcomingDeadlines: 4, avatar: "" },
]

const calendarSurveys = [
  { id: "SUR-002", title: "Electrical Systems Audit", engineer: "Priya Sharma", date: "2026-07-05", type: "Detailed" },
  { id: "SUR-006", title: "Interior Finishing Quality Check", engineer: "Rajesh Kumar", date: "2026-07-08", type: "As-Built" },
  { id: "SUR-017", title: "Seismic Resistance Testing", engineer: "Suresh Reddy", date: "2026-07-09", type: "Initial" },
  { id: "SUR-008", title: "HVAC System Inspection", engineer: "Priya Sharma", date: "2026-07-12", type: "Follow-up" },
  { id: "SUR-010", title: "Elevator Installation Survey", engineer: "Neha Gupta", date: "2026-07-14", type: "As-Built" },
  { id: "SUR-012", title: "Water Supply Network Audit", engineer: "Rajesh Kumar", date: "2026-07-18", type: "Follow-up" },
  { id: "SUR-015", title: "Facade Inspection - East Wing", engineer: null, date: "2026-07-20", type: "Detailed" },
  { id: "SUR-022", title: "Compound Wall Assessment", engineer: "Suresh Reddy", date: "2026-07-24", type: "Detailed" },
]

const priorityColors: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-amber-400 text-amber-900",
  low: "bg-green-500 text-white",
}

const typeColors: Record<string, string> = {
  Initial: "bg-blue-100 text-blue-800",
  Detailed: "bg-purple-100 text-purple-800",
  "Follow-up": "bg-amber-100 text-amber-800",
  Final: "bg-emerald-100 text-emerald-800",
  "As-Built": "bg-cyan-100 text-cyan-800",
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function AssignmentsPage() {
  const [selectedEngineer, setSelectedEngineer] = useState<string>("")
  const [selectedSurvey, setSelectedSurvey] = useState<string>("")
  const [viewMode, setViewMode] = useState<"board" | "calendar">("board")
  const [currentMonth] = useState(6) // July (0-indexed)
  const [currentYear] = useState(2026)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Assignments"
        description="Assign surveys to engineers and manage workloads"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: "Assignments" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg">
              <Button variant={viewMode === "board" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("board")} className="rounded-r-none">
                <LayoutGrid className="h-4 w-4 mr-1" /> Board
              </Button>
              <Button variant={viewMode === "calendar" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("calendar")} className="rounded-l-none">
                <Calendar className="h-4 w-4 mr-1" /> Calendar
              </Button>
            </div>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Quick Assign</Button>
          </div>
        }
      />

      {viewMode === "board" ? (
        <>
          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unassigned Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  Unassigned
                  <Badge variant="secondary" className="ml-auto">{unassignedSurveys.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {unassignedSurveys.map(survey => (
                  <div key={survey.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityColors[survey.priority]}`}>{survey.priority}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[survey.type]}`}>{survey.type}</span>
                    </div>
                    <Link href={`/surveys/${survey.id}`} className="font-medium text-sm hover:underline block">{survey.title}</Link>
                    <p className="text-xs text-muted-foreground mt-1">{survey.project}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {survey.scheduledDate}
                      </div>
                      <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                        <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue placeholder="Assign..." /></SelectTrigger>
                        <SelectContent>
                          {engineers.filter(e => e.activeSurveys < e.maxSurveys).map(e => (
                            <SelectItem key={e.name} value={e.name} className="text-xs">{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assigned Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Assigned
                  <Badge variant="secondary" className="ml-auto">{assignedSurveys.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {assignedSurveys.map(survey => (
                  <div key={survey.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityColors[survey.priority]}`}>{survey.priority}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[survey.type]}`}>{survey.type}</span>
                    </div>
                    <Link href={`/surveys/${survey.id}`} className="font-medium text-sm hover:underline block">{survey.title}</Link>
                    <p className="text-xs text-muted-foreground mt-1">{survey.project}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {survey.scheduledDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{engineers.find(e => e.name === survey.engineer)?.initials}</AvatarFallback></Avatar>
                        <span className="text-xs">{survey.engineer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* In Progress Column */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  In Progress
                  <Badge variant="secondary" className="ml-auto">{inProgressSurveys.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {inProgressSurveys.map(survey => (
                  <div key={survey.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[survey.type]}`}>{survey.type}</span>
                    </div>
                    <Link href={`/surveys/${survey.id}`} className="font-medium text-sm hover:underline block">{survey.title}</Link>
                    <p className="text-xs text-muted-foreground mt-1">{survey.project}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4"><AvatarFallback className="text-[7px]">{engineers.find(e => e.name === survey.engineer)?.initials}</AvatarFallback></Avatar>
                          <span className="text-muted-foreground">{survey.engineer}</span>
                        </div>
                        <span className="font-medium">{survey.progress}%</span>
                      </div>
                      <Progress value={survey.progress} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Engineer Workload & Quick Assign */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engineer Workload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {engineers.map(eng => (
                  <div key={eng.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{eng.initials}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-medium">{eng.name}</p>
                          <p className="text-xs text-muted-foreground">{eng.specialties.join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{eng.activeSurveys}/{eng.maxSurveys}</span>
                        <p className="text-[10px] text-muted-foreground">surveys</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(eng.activeSurveys / eng.maxSurveys) * 100} className={`h-2 flex-1 ${eng.activeSurveys >= eng.maxSurveys ? "[&>div]:bg-red-500" : eng.activeSurveys >= eng.maxSurveys - 1 ? "[&>div]:bg-amber-500" : ""}`} />
                      {eng.upcomingDeadlines > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                          <Clock className="h-3 w-3" />
                          {eng.upcomingDeadlines}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Assign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Survey</label>
                  <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                    <SelectTrigger><SelectValue placeholder="Choose a survey" /></SelectTrigger>
                    <SelectContent>
                      {unassignedSurveys.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Engineer</label>
                  <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                    <SelectTrigger><SelectValue placeholder="Choose engineer" /></SelectTrigger>
                    <SelectContent>
                      {engineers.filter(e => e.activeSurveys < e.maxSurveys).map(e => (
                        <SelectItem key={e.name} value={e.name}>{e.name} ({e.activeSurveys}/{e.maxSurveys})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!selectedSurvey || !selectedEngineer}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Survey
                </Button>
                {selectedSurvey && selectedEngineer && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <p>Assigning <span className="font-medium">{unassignedSurveys.find(s => s.id === selectedSurvey)?.title}</span> to <span className="font-medium">{selectedEngineer}</span></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Calendar View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{monthNames[currentMonth]} {currentYear} - Survey Calendar</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><ChevronLeftIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm">Today</Button>
                <Button variant="outline" size="sm"><ChevronRightIcon className="h-4 w-4" /></Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
              ))}
              {Array.from({ length: daysInMonth + firstDayOfWeek }).map((_, i) => {
                const dayNum = i - firstDayOfWeek + 1
                const isValid = dayNum >= 1 && dayNum <= daysInMonth
                const dateStr = `2026-07-${String(dayNum).padStart(2, "0")}`
                const daySurveys = calendarSurveys.filter(s => s.date === dateStr)
                return (
                  <div key={i} className={`bg-card p-2 min-h-[100px] ${!isValid ? "opacity-30" : ""} ${dayNum === 11 ? "ring-2 ring-primary" : ""}`}>
                    <span className="text-xs text-muted-foreground">{isValid ? dayNum : ""}</span>
                    <div className="mt-1 space-y-1">
                      {daySurveys.map(s => (
                        <div key={s.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${typeColors[s.type]}`} title={`${s.title} - ${s.engineer || "Unassigned"}`}>
                          {s.title.substring(0, 18)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-blue-100" /> Initial</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-purple-100" /> Detailed</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-amber-100" /> Follow-up</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-emerald-100" /> Final</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-cyan-100" /> As-Built</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
