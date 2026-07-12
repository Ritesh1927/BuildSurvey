"use client"

import { useState } from "react"
import { 
  FileText, Upload, Search, Download, Trash2, Eye, 
  MoreHorizontal, ZoomIn, ZoomOut, RotateCw, Layers, 
  Calendar, HardDrive, GitBranch, Pencil, ChevronDown
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const drawings = [
  {
    id: 1,
    name: "Foundation-Plan-Rev-A.dwg",
    type: "CAD Drawing",
    project: "Riverside Tower Complex",
    survey: "SUR-001",
    date: "2026-07-08",
    size: "12.5 MB",
    version: "Rev A",
    status: "approved",
    dimensions: "A1 (841 x 594 mm)",
    uploadedBy: "John Smith",
  },
  {
    id: 2,
    name: "Structural-Sections-Phase1.dwg",
    type: "CAD Drawing",
    project: "Riverside Tower Complex",
    survey: "SUR-001",
    date: "2026-07-08",
    size: "8.3 MB",
    version: "Rev B",
    status: "draft",
    dimensions: "A0 (1189 x 841 mm)",
    uploadedBy: "John Smith",
  },
  {
    id: 3,
    name: "Electrical-Layout-GroundFloor.pdf",
    type: "Blueprint",
    project: "Green Valley Office Park",
    survey: "SUR-002",
    date: "2026-07-07",
    size: "5.7 MB",
    version: "Final",
    status: "approved",
    dimensions: "A2 (594 x 420 mm)",
    uploadedBy: "Sarah Johnson",
  },
  {
    id: 4,
    name: "Plumbing-Riser-Diagram.pdf",
    type: "Blueprint",
    project: "Metro Residential Towers",
    survey: "SUR-003",
    date: "2026-07-05",
    size: "3.2 MB",
    version: "Rev C",
    status: "approved",
    dimensions: "A3 (420 x 297 mm)",
    uploadedBy: "Mike Davis",
  },
  {
    id: 5,
    name: "Fire-Evacuation-Plan.dwg",
    type: "CAD Drawing",
    project: "Downtown Mall Expansion",
    survey: "SUR-004",
    date: "2026-07-06",
    size: "6.8 MB",
    version: "Rev A",
    status: "pending",
    dimensions: "A1 (841 x 594 mm)",
    uploadedBy: "Emily Chen",
  },
  {
    id: 6,
    name: "Heritage-Building-Existing-Conditions.pdf",
    type: "Blueprint",
    project: "Heritage Building Renovation",
    survey: "SUR-007",
    date: "2026-07-04",
    size: "15.2 MB",
    version: "Survey",
    status: "approved",
    dimensions: "A0 (1189 x 841 mm)",
    uploadedBy: "Lisa Wong",
  },
  {
    id: 7,
    name: "HVAC-Ductwork-Layout.dwg",
    type: "CAD Drawing",
    project: "Green Valley Office Park",
    survey: "SUR-008",
    date: "2026-07-03",
    size: "9.1 MB",
    version: "Rev A",
    status: "draft",
    dimensions: "A1 (841 x 594 mm)",
    uploadedBy: "Sarah Johnson",
  },
]

const versionHistory = [
  { version: "Rev C", date: "2026-07-06", author: "Emily Chen", notes: "Updated fire exit routes per client feedback" },
  { version: "Rev B", date: "2026-07-04", author: "Emily Chen", notes: "Added smoke detector locations" },
  { version: "Rev A", date: "2026-07-02", author: "Emily Chen", notes: "Initial drawing submission" },
  { version: "Draft", date: "2026-07-01", author: "Emily Chen", notes: "Preliminary layout" },
]

const statusColors: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-slate-100 text-slate-800",
}

export default function DrawingsPage() {
  const [selectedDrawing, setSelectedDrawing] = useState<typeof drawings[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedDrawings, setUploadedDrawings] = useState<{ id: number; name: string; type: string; project: string; survey: string; date: string; size: string; version: string; status: string; dimensions: string; uploadedBy: string }[]>([])

  const handleDrawingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newDrawings = files.map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      type: file.name.endsWith(".dwg") || file.name.endsWith(".dxf") ? "CAD Drawing" : "Blueprint",
      project: "All Projects",
      survey: "New Upload",
      date: new Date().toISOString().split("T")[0],
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      version: "Rev A",
      status: "draft",
      dimensions: "A1 (841 x 594 mm)",
      uploadedBy: "Current User",
    }))
    setUploadedDrawings(prev => [...prev, ...newDrawings])
    e.target.value = ""
  }

  const filteredDrawings = drawings.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drawing Upload"
        description="Upload and manage CAD files, blueprints, and technical drawings"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media", href: "/media" },
          { label: "Drawings" },
        ]}
        actions={
          <Button onClick={() => document.getElementById("drawing-upload-input")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Drawing
          </Button>
        }
      />

      <input
        id="drawing-upload-input"
        type="file"
        accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg"
        multiple
        className="hidden"
        onChange={handleDrawingUpload}
      />

      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("drawing-upload-input")?.click()}
          >
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium mt-4">Drag & drop drawings here</p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports DWG, DXF, PDF, PNG, JPG. Max file size 100MB
            </p>
            <Button className="mt-4" onClick={(e) => { e.stopPropagation(); document.getElementById("drawing-upload-input")?.click() }}>
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
            placeholder="Search drawings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredDrawings.length} drawings
        </div>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="viewer">Drawing Viewer</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrawings.map((drawing) => (
              <Card
                key={drawing.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDrawing(drawing)}
              >
                <div className="aspect-[4/3] bg-slate-100 rounded-t-xl flex items-center justify-center relative">
                  <FileText className="h-16 w-16 text-slate-300" />
                  <div className="absolute top-2 right-2">
                    <Badge className={statusColors[drawing.status]}>
                      {drawing.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {drawing.version}
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium truncate">{drawing.name}</h3>
                  <p className="text-sm text-muted-foreground">{drawing.project}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HardDrive className="h-3 w-3" />
                    <span>{drawing.size}</span>
                    <span>•</span>
                    <span>{drawing.dimensions}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredDrawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedDrawing(drawing)}
                  >
                    <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{drawing.name}</p>
                      <p className="text-sm text-muted-foreground">{drawing.project} - {drawing.survey}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge className={statusColors[drawing.status]}>{drawing.status}</Badge>
                      <span>{drawing.version}</span>
                      <span>{drawing.size}</span>
                      <span>{drawing.date}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
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
        </TabsContent>

        <TabsContent value="viewer" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="flex">
                <div className="flex-1 aspect-[16/10] bg-slate-100 flex items-center justify-center relative">
                  <FileText className="h-32 w-32 text-slate-300" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-lg">
                    100% - Foundation-Plan-Rev-A.dwg
                  </div>
                </div>
                <div className="w-72 border-l p-4 space-y-4">
                  <div>
                    <h3 className="font-medium">Drawing Details</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>CAD Drawing</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p>Rev A</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dimensions</p>
                      <p>A1 (841 x 594 mm)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uploaded By</p>
                      <p>John Smith</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p>2026-07-08</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Version History
                    </h4>
                    <div className="space-y-3">
                      {versionHistory.map((v, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-primary/20">
                          <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary" />
                          <p className="text-xs font-medium">{v.version} - {v.date}</p>
                          <p className="text-xs text-muted-foreground">{v.author}</p>
                          <p className="text-xs mt-1">{v.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Annotate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
