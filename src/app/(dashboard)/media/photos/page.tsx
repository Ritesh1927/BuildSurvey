"use client"

import { useState } from "react"
import { 
  Camera, Upload, Search, Filter, Download, Trash2, 
  Eye, MoreHorizontal, MapPin, Calendar, X, ChevronLeft, 
  ChevronRight, Grid, List, CheckSquare, Square, Edit
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"

const photos = [
  { id: 1, name: "foundation-cracks-east.jpg", caption: "Hairline cracks observed on east foundation wall", project: "Riverside Tower Complex", survey: "SUR-001", date: "2026-07-08", time: "09:15 AM", size: "2.4 MB", location: { lat: 40.7128, lng: -74.006 }, hasLocation: true },
  { id: 2, name: "rebar-placement-detail.jpg", caption: "16mm Fe500D rebar placement at column foundation", project: "Riverside Tower Complex", survey: "SUR-001", date: "2026-07-08", time: "09:45 AM", size: "3.1 MB", location: { lat: 40.7130, lng: -74.0058 }, hasLocation: true },
  { id: 3, name: "column-base-connection.jpg", caption: "Column base plate connection detail", project: "Riverside Tower Complex", survey: "SUR-001", date: "2026-07-08", time: "10:30 AM", size: "1.9 MB", location: { lat: 40.7125, lng: -74.0062 }, hasLocation: true },
  { id: 4, name: "electrical-panel-main.jpg", caption: "Main distribution panel 400A capacity", project: "Green Valley Office Park", survey: "SUR-002", date: "2026-07-07", time: "02:00 PM", size: "1.8 MB", location: { lat: 40.7589, lng: -73.9851 }, hasLocation: true },
  { id: 5, name: "wiring-conduit-inspection.jpg", caption: "Conduit routing and cable management", project: "Green Valley Office Park", survey: "SUR-002", date: "2026-07-07", time: "02:30 PM", size: "2.2 MB", location: { lat: 40.7591, lng: -73.9849 }, hasLocation: true },
  { id: 6, name: "safety-signage-east.jpg", caption: "Emergency exit and safety signage installation", project: "Downtown Mall Expansion", survey: "SUR-004", date: "2026-07-06", time: "11:00 AM", size: "2.1 MB", location: { lat: 40.6892, lng: -74.0445 }, hasLocation: true },
  { id: 7, name: "fire-exit-access.jpg", caption: "Fire exit accessibility verification", project: "Downtown Mall Expansion", survey: "SUR-004", date: "2026-07-06", time: "11:15 AM", size: "1.7 MB", location: { lat: 40.6890, lng: -74.0447 }, hasLocation: true },
  { id: 8, name: "plumbing-pipe-joint.jpg", caption: "PVC pipe joint connection detail", project: "Metro Residential Towers", survey: "SUR-003", date: "2026-07-05", time: "10:00 AM", size: "1.5 MB", location: { lat: 40.7282, lng: -73.7949 }, hasLocation: true },
  { id: 9, name: "drainage-system-overview.jpg", caption: "Storm water drainage system layout", project: "Metro Residential Towers", survey: "SUR-003", date: "2026-07-05", time: "10:30 AM", size: "2.8 MB", location: { lat: 40.7284, lng: -73.7947 }, hasLocation: true },
  { id: 10, name: "roof-structure-detail.jpg", caption: "Roof truss connection detail", project: "Heritage Building Renovation", survey: "SUR-007", date: "2026-07-04", time: "03:00 PM", size: "3.5 MB", location: { lat: 40.7484, lng: -73.9857 }, hasLocation: true },
  { id: 11, name: "wall-crack-mapping.jpg", caption: "Crack mapping on north wall - 2mm width", project: "Heritage Building Renovation", survey: "SUR-007", date: "2026-07-04", time: "03:30 PM", size: "2.0 MB", location: { lat: 40.7486, lng: -73.9855 }, hasLocation: true },
  { id: 12, name: "hvac-ductwork.jpg", caption: "HVAC ductwork installation progress", project: "Green Valley Office Park", survey: "SUR-008", date: "2026-07-03", time: "01:00 PM", size: "2.5 MB", location: { lat: 40.7593, lng: -73.9853 }, hasLocation: false },
]

const projects = ["All Projects", "Riverside Tower Complex", "Green Valley Office Park", "Metro Residential Towers", "Downtown Mall Expansion", "Heritage Building Renovation"]
const surveys = ["All Surveys", "SUR-001", "SUR-002", "SUR-003", "SUR-004", "SUR-007", "SUR-008"]

export default function PhotosPage() {
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [previewPhoto, setPreviewPhoto] = useState<typeof photos[0] | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPhotos = photos.filter((photo) => {
    const matchesProject = projectFilter === "All Projects" || photo.project === projectFilter
    const matchesSearch = photo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesProject && matchesSearch
  })

  const toggleSelect = (id: number) => {
    setSelectedPhotos((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([])
    } else {
      setSelectedPhotos(filteredPhotos.map((p) => p.id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photo Management"
        description="Upload, organize, and manage site survey photos"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media", href: "/media" },
          { label: "Photos" },
        ]}
        actions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium mt-4">Drag & drop photos here</p>
            <p className="text-sm text-muted-foreground mt-2">
              or click to browse. Supports JPG, PNG, HEIC up to 50MB
            </p>
            <Button className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
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
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="h-4 w-4 mr-1" />
            {selectedPhotos.length === filteredPhotos.length ? "Deselect All" : "Select All"}
          </Button>
          {selectedPhotos.length > 0 && (
            <>
              <Badge>{selectedPhotos.length} selected</Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid group relative rounded-lg border overflow-hidden bg-muted cursor-pointer"
            onClick={() => setPreviewPhoto(photo)}
          >
            <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedPhotos.includes(photo.id)}
                onCheckedChange={() => toggleSelect(photo.id)}
              />
            </div>
            <div className="aspect-square bg-slate-200 flex items-center justify-center">
              <Camera className="h-12 w-12 text-slate-400" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setPreviewPhoto(photo); }}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium truncate">{photo.caption}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {photo.hasLocation && <MapPin className="h-3 w-3" />}
                <span>{photo.date}</span>
                <span>{photo.time}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{photo.project}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!previewPhoto}
        onOpenChange={() => setPreviewPhoto(null)}
        title="Photo Preview"
        maxWidth="2xl"
      >
        {previewPhoto && (
          <div className="space-y-4">
            <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
              <Camera className="h-24 w-24 text-slate-400" />
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea
                defaultValue={previewPhoto.caption}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Project</p>
                <p className="font-medium">{previewPhoto.project}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Survey</p>
                <p className="font-medium">{previewPhoto.survey}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date & Time</p>
                <p className="font-medium">{previewPhoto.date} at {previewPhoto.time}</p>
              </div>
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">{previewPhoto.size}</p>
              </div>
              {previewPhoto.hasLocation && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">GPS Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {previewPhoto.location.lat}, {previewPhoto.location.lng}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPreviewPhoto(null)}>Close</Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Save Caption
              </Button>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
