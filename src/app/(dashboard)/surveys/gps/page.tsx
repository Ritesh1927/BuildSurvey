"use client"

import { useState } from "react"
import {
  MapPin, Navigation, Clock, Users, Settings, Download,
  RefreshCw, Locate, Filter, TrendingUp, Route, Battery,
  Signal, Compass, Plus, Edit, Trash2, X
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const engineerLocations = [
  {
    name: "Rajesh Kumar", initials: "RK", status: "active", lastUpdate: "2 min ago",
    latitude: 19.0760, longitude: 72.8777, address: "Bandra Kurla Complex, Mumbai",
    battery: 85, speed: 0, heading: "N/A", currentSurvey: "SUR-001", distance: "2.3 km",
  },
  {
    name: "Priya Sharma", initials: "PS", status: "active", lastUpdate: "5 min ago",
    latitude: 19.0596, longitude: 72.8295, address: "Andheri East, Mumbai",
    battery: 62, speed: 15, heading: "NE", currentSurvey: "SUR-002", distance: "8.1 km",
  },
  {
    name: "Amit Patel", initials: "AP", status: "idle", lastUpdate: "25 min ago",
    latitude: 19.0300, longitude: 72.8600, address: "Lower Parel, Mumbai",
    battery: 45, speed: 0, heading: "N/A", currentSurvey: null, distance: "5.6 km",
  },
  {
    name: "Neha Gupta", initials: "NG", status: "active", lastUpdate: "1 min ago",
    latitude: 19.1136, longitude: 72.8697, address: "Goregaon East, Mumbai",
    battery: 94, speed: 0, heading: "N/A", currentSurvey: "SUR-010", distance: "12.4 km",
  },
  {
    name: "Suresh Reddy", initials: "SR", status: "offline", lastUpdate: "3 hours ago",
    latitude: 19.0544, longitude: 72.8378, address: "Powai, Mumbai",
    battery: 12, speed: 0, heading: "N/A", currentSurvey: null, distance: "4.8 km",
  },
]

const locationHistory = [
  { time: "08:00 AM", location: "Office - BKC", action: "Checked in", coordinates: "19.0760, 72.8777", accuracy: "5m", speed: "—" },
  { time: "08:30 AM", location: "Site Entrance - Tower A", action: "Arrived at site", coordinates: "19.0762, 72.8780", accuracy: "3m", speed: "—" },
  { time: "09:15 AM", location: "Foundation Area - East", action: "Started survey", coordinates: "19.0765, 72.8785", accuracy: "4m", speed: "—" },
  { time: "10:30 AM", location: "Foundation Area - West", action: "Moved to new section", coordinates: "19.0758, 72.8770", accuracy: "3m", speed: "1.2 km/h" },
  { time: "11:45 AM", location: "Parking Structure Level B2", action: "Continued inspection", coordinates: "19.0768, 72.8790", accuracy: "6m", speed: "—" },
  { time: "01:00 PM", location: "Site Office", action: "Lunch break", coordinates: "19.0755, 72.8765", accuracy: "2m", speed: "—" },
  { time: "02:30 PM", location: "North Tower Foundation", action: "Resumed survey", coordinates: "19.0770, 72.8795", accuracy: "4m", speed: "—" },
]

const geofences = [
  { id: 1, name: "Riverside Tower Complex", radius: 200, active: true, alerts: 2, lat: 19.0760, lng: 72.8777 },
  { id: 2, name: "Green Valley Office Park", radius: 150, active: true, alerts: 0, lat: 19.0596, lng: 72.8295 },
  { id: 3, name: "Metro Residential Towers", radius: 300, active: false, alerts: 1, lat: 19.0300, lng: 72.8600 },
  { id: 4, name: "Downtown Mall Expansion", radius: 250, active: true, alerts: 0, lat: 19.1136, lng: 72.8697 },
]

export default function GPSTrackingPage() {
  const [activeTab, setActiveTab] = useState("live")
  const [selectedEngineer, setSelectedEngineer] = useState<string>("all")
  const [fromPoint, setFromPoint] = useState("Office - BKC, Mumbai")
  const [toPoint, setToPoint] = useState("Riverside Tower Complex")

  const filteredLocations = selectedEngineer === "all"
    ? engineerLocations
    : engineerLocations.filter(e => e.name === selectedEngineer)

  const activeCount = engineerLocations.filter(e => e.status === "active").length
  const idleCount = engineerLocations.filter(e => e.status === "idle").length
  const offlineCount = engineerLocations.filter(e => e.status === "offline").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPS Tracking"
        description="Real-time engineer location tracking and geofence management"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: "GPS Tracking" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export Data</Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center"><Navigation className="h-5 w-5 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Active Engineers</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div><p className="text-2xl font-bold">{idleCount}</p><p className="text-xs text-muted-foreground">Idle</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Signal className="h-5 w-5 text-slate-600" /></div>
              <div><p className="text-2xl font-bold">{offlineCount}</p><p className="text-xs text-muted-foreground">Offline</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Route className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold">47.3 km</p><p className="text-xs text-muted-foreground">Total Distance Today</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="live">Live Tracking</TabsTrigger>
          <TabsTrigger value="history">Location History</TabsTrigger>
          <TabsTrigger value="geofence">Geofence Settings</TabsTrigger>
          <TabsTrigger value="distances">Distance Calculator</TabsTrigger>
        </TabsList>

        {/* Live Tracking */}
        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[550px]">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-xl overflow-hidden">
                    {/* Map Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur shadow-lg">
                          <MapPin className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-4">Interactive Map</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Google Maps / Leaflet Integration Area</p>
                        <div className="flex justify-center gap-3 mt-4">
                          <Badge variant="success" className="gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Active: {activeCount}</Badge>
                          <Badge variant="warning" className="gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /> Idle: {idleCount}</Badge>
                          <Badge variant="secondary" className="gap-1"><div className="h-2 w-2 rounded-full bg-slate-400" /> Offline: {offlineCount}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Map Overlay Controls */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">Live Locations</p>
                      <p className="text-xs text-muted-foreground">Updated every 30 seconds</p>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-lg">
                      <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                        <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Filter engineer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Engineers</SelectItem>
                          {engineerLocations.map(e => (
                            <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button size="sm" className="bg-white text-foreground hover:bg-white/90 shadow-lg"><Locate className="h-4 w-4 mr-1" /> Center</Button>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-lg">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Compass className="h-4 w-4" />
                        <span>Mumbai, Maharashtra, India</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engineer Locations Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Engineer Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredLocations.map(eng => (
                    <div key={eng.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{eng.initials}</AvatarFallback></Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                          eng.status === "active" ? "bg-emerald-500" :
                          eng.status === "idle" ? "bg-amber-500" : "bg-slate-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{eng.name}</p>
                        <p className="text-xs text-muted-foreground">{eng.lastUpdate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <Battery className={`h-3 w-3 ${eng.battery < 20 ? "text-red-500" : eng.battery < 50 ? "text-amber-500" : "text-emerald-500"}`} />
                          <span>{eng.battery}%</span>
                        </div>
                        {eng.currentSurvey && (
                          <p className="text-[10px] text-primary font-medium">{eng.currentSurvey}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Time on Site</span>
                    <span className="font-medium">6.2 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Distance/Day</span>
                    <span className="font-medium">9.5 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Geofence Alerts</span>
                    <Badge variant="warning">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Surveys</span>
                    <Badge variant="info">3</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Location History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Location History - Rajesh Kumar
                </span>
                <div className="flex items-center gap-2">
                  <Input type="date" className="w-[150px]" defaultValue="2026-07-11" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Engineer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Engineers</SelectItem>
                      {engineerLocations.map(e => (
                        <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {locationHistory.map((entry, index) => (
                    <div key={index} className="relative flex items-start gap-4 pl-12">
                      <div className="absolute left-3.5 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <div className="flex-1 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{entry.action}</p>
                            <p className="text-sm text-muted-foreground">{entry.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{entry.time}</p>
                            <p className="text-xs text-muted-foreground">{entry.coordinates}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Accuracy: {entry.accuracy}</span>
                          <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> Speed: {entry.speed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geofence Settings */}
        <TabsContent value="geofence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Geofence Configuration
                </span>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Geofence</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Center (Lat, Lng)</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geofences.map(fence => (
                    <TableRow key={fence.id}>
                      <TableCell className="font-medium">{fence.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fence.lat}, {fence.lng}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input type="number" defaultValue={fence.radius} className="h-8 w-20 text-sm" />
                          <span className="text-sm text-muted-foreground">m</span>
                        </div>
                      </TableCell>
                      <TableCell><Switch defaultChecked={fence.active} /></TableCell>
                      <TableCell>
                        <Badge variant={fence.alerts > 0 ? "warning" : "secondary"}>{fence.alerts}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Geofence Alerts Log</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { engineer: "Suresh Reddy", type: "Exit", fence: "Riverside Tower Complex", time: "2026-07-11 14:30" },
                  { engineer: "Rajesh Kumar", type: "Entry", fence: "Green Valley Office Park", time: "2026-07-11 09:15" },
                  { engineer: "Amit Patel", type: "Exit", fence: "Metro Residential Towers", time: "2026-07-10 16:45" },
                ].map((alert, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${alert.type === "Exit" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                    {alert.type === "Exit" ? <AlertTriangleIcon className="h-4 w-4 text-amber-600" /> : <CheckCircle2Icon className="h-4 w-4 text-emerald-600" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.engineer} - {alert.type === "Exit" ? "Left" : "Entered"} {alert.fence}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge variant={alert.type === "Exit" ? "warning" : "success"}>{alert.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distance Calculator */}
        <TabsContent value="distances" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Distance Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>From Location</Label>
                  <Input placeholder="Enter starting point" value={fromPoint} onChange={(e) => setFromPoint(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To Location</Label>
                  <Input placeholder="Enter destination" value={toPoint} onChange={(e) => setToPoint(e.target.value)} />
                </div>
                <Button className="w-full"><Navigation className="h-4 w-4 mr-2" /> Calculate Distance</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Results</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-primary">12.4</p>
                    <p className="text-sm text-muted-foreground">km (direct)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-primary">15.8</p>
                    <p className="text-sm text-muted-foreground">km (road)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-primary">~22</p>
                    <p className="text-sm text-muted-foreground">min (drive)</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-medium">Route Details</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Start: {fromPoint || "—"}</p>
                    <p>End: {toPoint || "—"}</p>
                    <p>Estimated fuel cost: ₹185</p>
                    <p>Toll charges: ₹45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}

function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}
