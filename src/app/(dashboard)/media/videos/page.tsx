"use client"

import { useState } from "react"
import { 
  Video, Upload, Search, Filter, Download, Trash2, 
  Play, Clock, HardDrive, Calendar, MoreHorizontal, Eye
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

const videos = [
  { id: 1, name: "foundation-walkthrough-phase1.mp4", project: "Riverside Tower Complex", survey: "SUR-001", duration: "5:32", date: "2026-07-08", time: "10:00 AM", size: "45 MB", resolution: "1920x1080", thumbnail: null },
  { id: 2, name: "crack-measurement-recording.mp4", project: "Riverside Tower Complex", survey: "SUR-001", duration: "2:15", date: "2026-07-08", time: "11:30 AM", size: "18 MB", resolution: "1920x1080", thumbnail: null },
  { id: 3, name: "site-overview-aerial-view.mp4", project: "Green Valley Office Park", survey: "SUR-002", duration: "3:15", date: "2026-07-07", time: "02:00 PM", size: "32 MB", resolution: "3840x2160", thumbnail: null },
  { id: 4, name: "electrical-panel-inspection.mp4", project: "Green Valley Office Park", survey: "SUR-002", duration: "4:45", date: "2026-07-07", time: "03:30 PM", size: "38 MB", resolution: "1920x1080", thumbnail: null },
  { id: 5, name: "safety-exit-documentation.mp4", project: "Downtown Mall Expansion", survey: "SUR-004", duration: "1:50", date: "2026-07-06", time: "11:00 AM", size: "14 MB", resolution: "1920x1080", thumbnail: null },
  { id: 6, name: "plumbing-system-overview.mp4", project: "Metro Residential Towers", survey: "SUR-003", duration: "6:20", date: "2026-07-05", time: "10:00 AM", size: "52 MB", resolution: "1920x1080", thumbnail: null },
  { id: 7, name: "heritage-wall-assessment.mp4", project: "Heritage Building Renovation", survey: "SUR-007", duration: "3:40", date: "2026-07-04", time: "03:00 PM", size: "28 MB", resolution: "1920x1080", thumbnail: null },
  { id: 8, name: "roof-structure-inspection.mp4", project: "Heritage Building Renovation", survey: "SUR-007", duration: "4:10", date: "2026-07-04", time: "04:00 PM", size: "35 MB", resolution: "3840x2160", thumbnail: null },
]

const projects = ["All Projects", "Riverside Tower Complex", "Green Valley Office Park", "Metro Residential Towers", "Downtown Mall Expansion", "Heritage Building Renovation"]

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState("All Projects")

  const filteredVideos = videos.filter((video) => {
    const matchesProject = projectFilter === "All Projects" || video.project === projectFilter
    const matchesSearch = video.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesProject && matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Management"
        description="Upload and manage site survey video recordings"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media", href: "/media" },
          { label: "Videos" },
        ]}
        actions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <Video className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium mt-4">Drag & drop videos here</p>
            <p className="text-sm text-muted-foreground mt-2">
              or click to browse. Supports MP4, MOV, AVI up to 500MB
            </p>
            <Button className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredVideos.length} videos
        </div>
      </div>

      <div className="space-y-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-64 h-36 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 group cursor-pointer">
                  <Video className="h-12 w-12 text-slate-400" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  {video.resolution.includes("3840") && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                      4K
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{video.name}</h3>
                      <p className="text-sm text-muted-foreground">{video.project}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Play
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
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {video.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5" />
                      {video.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {video.date}
                    </span>
                    <Badge variant="secondary">{video.resolution}</Badge>
                    <Badge variant="outline">{video.survey}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
