"use client"

import { useState } from "react"
import { 
  Camera, Video, Mic, Pencil, Upload, Search, Filter, 
  Download, Trash2, Grid, List, Eye, MoreHorizontal, 
  HardDrive, Image, FileText
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

const mediaStats = {
  totalPhotos: 247,
  totalVideos: 18,
  totalVoiceNotes: 34,
  totalDrawings: 12,
  storageUsed: 4.2,
  storageTotal: 10,
}

const recentPhotos = [
  { id: 1, name: "foundation-inspection-01.jpg", project: "Riverside Tower Complex", survey: "SUR-001", date: "2026-07-08", size: "2.4 MB" },
  { id: 2, name: "rebar-placement-detail.jpg", project: "Riverside Tower Complex", survey: "SUR-001", date: "2026-07-08", size: "3.1 MB" },
  { id: 3, name: "electrical-panel-main.jpg", project: "Green Valley Office Park", survey: "SUR-002", date: "2026-07-07", size: "1.8 MB" },
  { id: 4, name: "safety-signage-east.jpg", project: "Downtown Mall Expansion", survey: "SUR-004", date: "2026-07-06", size: "2.1 MB" },
  { id: 5, name: "plumbing-pipe-joint.jpg", project: "Metro Residential Towers", survey: "SUR-003", date: "2026-07-05", size: "1.5 MB" },
]

const recentVideos = [
  { id: 1, name: "foundation-walkthrough.mp4", project: "Riverside Tower Complex", duration: "5:32", date: "2026-07-08", size: "45 MB" },
  { id: 2, name: "site-overview-aerial.mp4", project: "Green Valley Office Park", duration: "3:15", date: "2026-07-07", size: "32 MB" },
  { id: 3, name: "crack-measurement-demo.mp4", project: "Heritage Building Renovation", duration: "2:15", date: "2026-07-05", size: "18 MB" },
]

const recentVoiceNotes = [
  { id: 1, name: "foundation-observation.mp3", project: "Riverside Tower Complex", duration: "1:45", date: "2026-07-08", size: "1.2 MB" },
  { id: 2, name: "safety-concerns.mp3", project: "Downtown Mall Expansion", duration: "0:58", date: "2026-07-06", size: "0.8 MB" },
  { id: 3, name: "plumbing-assessment.mp3", project: "Metro Residential Towers", duration: "2:30", date: "2026-07-05", size: "1.8 MB" },
]

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState("photos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const storagePercentage = (mediaStats.storageUsed / mediaStats.storageTotal) * 100

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Management"
        description="Manage photos, videos, voice notes, and drawings"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media" },
        ]}
        actions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Camera className="h-6 w-6" />}
          label="Total Photos"
          value={mediaStats.totalPhotos}
          color="info"
          change={12}
          trend="up"
        />
        <StatCard
          icon={<Video className="h-6 w-6" />}
          label="Total Videos"
          value={mediaStats.totalVideos}
          color="default"
          change={5}
          trend="up"
        />
        <StatCard
          icon={<Mic className="h-6 w-6" />}
          label="Voice Notes"
          value={mediaStats.totalVoiceNotes}
          color="success"
          change={8}
          trend="up"
        />
        <StatCard
          icon={<HardDrive className="h-6 w-6" />}
          label="Storage Used"
          value={`${mediaStats.storageUsed} GB`}
          color="warning"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Storage Usage</p>
              <p className="text-xs text-muted-foreground">
                {mediaStats.storageUsed} GB of {mediaStats.storageTotal} GB used
              </p>
            </div>
            <span className="text-sm font-medium">{Math.round(storagePercentage)}%</span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Photos: 2.1 GB
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              Videos: 1.5 GB
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Audio: 0.3 GB
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              Drawings: 0.3 GB
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="photos" className="gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="voice-notes" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice Notes
            </TabsTrigger>
            <TabsTrigger value="drawings" className="gap-2">
              <FileText className="h-4 w-4" />
              Drawings
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge>{selectedItems.length} selected</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
            <Button
              variant={viewMode === "grid" ? "outline" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "outline" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="photos" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search photos..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="riverside">Riverside Tower</SelectItem>
                <SelectItem value="green-valley">Green Valley</SelectItem>
                <SelectItem value="metro">Metro Towers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-lg border overflow-hidden bg-muted"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedItems.includes(photo.id)}
                      onCheckedChange={() => toggleSelect(photo.id)}
                    />
                  </div>
                  <div className="aspect-square bg-slate-200 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{photo.name}</p>
                    <p className="text-[10px] text-muted-foreground">{photo.date} - {photo.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                      <Checkbox
                        checked={selectedItems.includes(photo.id)}
                        onCheckedChange={() => toggleSelect(photo.id)}
                      />
                      <div className="h-12 w-12 rounded bg-slate-200 flex items-center justify-center shrink-0">
                        <Camera className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{photo.name}</p>
                        <p className="text-xs text-muted-foreground">{photo.project} - {photo.survey}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{photo.date}</p>
                        <p className="text-xs text-muted-foreground">{photo.size}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    <div className="h-16 w-24 rounded bg-slate-200 flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.name}</p>
                      <p className="text-sm text-muted-foreground">{video.project}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{video.duration}</span>
                        <span>{video.size}</span>
                        <span>{video.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-notes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentVoiceNotes.map((note) => (
                  <div key={note.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.name}</p>
                      <p className="text-sm text-muted-foreground">{note.project}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{note.duration}</span>
                        <span>{note.size}</span>
                        <span>{note.date}</span>
                      </div>
                    </div>
                    <div className="h-8 flex items-center gap-0.5">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary/40 rounded-full"
                          style={{ height: `${Math.random() * 20 + 8}px` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawings" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg border border-dashed p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-lg font-medium mt-4">No Drawings Uploaded</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload CAD files, blueprints, and technical drawings
                </p>
                <Button className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Drawing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
