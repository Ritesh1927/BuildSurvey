"use client"

import { useState } from "react"
import { 
  Pencil, Eraser, Type, Square, Circle, Minus, 
  Undo2, Redo2, Save, Download, Trash2, Eye, 
  Plus, Layers, Palette, FileText, Calendar, MoreHorizontal
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tools = [
  { id: "pen", icon: Pencil, label: "Pen" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "text", icon: Type, label: "Text" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
]

const colors = [
  { id: "black", value: "#000000", label: "Black" },
  { id: "red", value: "#ef4444", label: "Red" },
  { id: "blue", value: "#3b82f6", label: "Blue" },
  { id: "green", value: "#22c55e", label: "Green" },
  { id: "yellow", value: "#eab308", label: "Yellow" },
  { id: "orange", value: "#f97316", label: "Orange" },
  { id: "purple", value: "#a855f7", label: "Purple" },
  { id: "white", value: "#ffffff", label: "White" },
]

const lineWeights = [
  { id: "thin", value: 1, label: "Thin" },
  { id: "medium", value: 2, label: "Medium" },
  { id: "thick", value: 4, label: "Thick" },
  { id: "extra-thick", value: 6, label: "Extra Thick" },
]

const savedSketches = [
  {
    id: 1,
    name: "Foundation Layout Sketch",
    project: "Riverside Tower Complex",
    survey: "SUR-001",
    date: "2026-07-08",
    layers: 3,
    thumbnail: null,
  },
  {
    id: 2,
    name: "Electrical Panel Location",
    project: "Green Valley Office Park",
    survey: "SUR-002",
    date: "2026-07-07",
    layers: 2,
    thumbnail: null,
  },
  {
    id: 3,
    name: "Crack Pattern Mapping",
    project: "Heritage Building Renovation",
    survey: "SUR-007",
    date: "2026-07-04",
    layers: 4,
    thumbnail: null,
  },
  {
    id: 4,
    name: "Site Access Route",
    project: "Downtown Mall Expansion",
    survey: "SUR-004",
    date: "2026-07-06",
    layers: 2,
    thumbnail: null,
  },
  {
    id: 5,
    name: "Plumbing Riser Diagram",
    project: "Metro Residential Towers",
    survey: "SUR-003",
    date: "2026-07-05",
    layers: 5,
    thumbnail: null,
  },
]

const sketchLayers = [
  { id: 1, name: "Base Layout", visible: true, locked: false },
  { id: 2, name: "Annotations", visible: true, locked: false },
  { id: 3, name: "Dimensions", visible: true, locked: true },
]

export default function SketchesPage() {
  const [activeTool, setActiveTool] = useState("pen")
  const [activeColor, setActiveColor] = useState("#000000")
  const [activeWeight, setActiveWeight] = useState(2)
  const [layers, setLayers] = useState(sketchLayers)

  const toggleLayerVisibility = (id: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sketch Pad"
        description="Create hand-drawn sketches for site documentation"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Media", href: "/media" },
          { label: "Sketches" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Sketch
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex md:flex-col gap-1 p-2 bg-muted rounded-lg">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? "default" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    )
                  })}
                </div>

                <div className="flex md:flex-col gap-2 p-2 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground md:mb-1">Color</p>
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      className={`h-6 w-6 rounded-full border-2 ${
                        activeColor === color.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setActiveColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>

                <div className="flex md:flex-col gap-1 p-2 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground md:mb-1">Weight</p>
                  {lineWeights.map((weight) => (
                    <Button
                      key={weight.id}
                      variant={activeWeight === weight.value ? "default" : "ghost"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setActiveWeight(weight.value)}
                    >
                      <div
                        className="rounded-full bg-current"
                        style={{ width: `${weight.value * 4}px`, height: `${weight.value}px` }}
                      />
                    </Button>
                  ))}
                </div>

                <div className="flex md:flex-col gap-1 p-2 bg-muted rounded-lg">
                  <Button variant="ghost" size="icon" className="h-9 w-9" title="Undo">
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" title="Redo">
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[500px]">
            <CardContent className="p-0 h-full">
              <div className="relative h-full bg-white rounded-xl border-2 border-dashed overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Pencil className="h-16 w-16 mx-auto text-slate-300" />
                    <p className="text-lg font-medium text-slate-400 mt-4">Sketch Pad - Canvas Integration</p>
                    <p className="text-sm text-slate-300 mt-2">
                      Click and drag to draw. Use the toolbar to select tools.
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg">
                  1200 x 800 px
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
                >
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className={`h-4 w-4 rounded ${
                      layer.visible ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span className="flex-1 text-sm">{layer.name}</span>
                  {layer.locked && (
                    <Badge variant="secondary" className="text-[10px]">Locked</Badge>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Add Layer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Sketch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  defaultValue="Foundation Layout Sketch"
                  className="w-full px-3 py-1.5 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <select className="w-full px-3 py-1.5 text-sm border rounded-md">
                  <option>Riverside Tower Complex</option>
                  <option>Green Valley Office Park</option>
                  <option>Metro Residential Towers</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Survey</label>
                <select className="w-full px-3 py-1.5 text-sm border rounded-md">
                  <option>SUR-001</option>
                  <option>SUR-002</option>
                  <option>SUR-003</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saved Sketches ({savedSketches.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSketches.map((sketch) => (
              <div
                key={sketch.id}
                className="group rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative">
                  <Pencil className="h-12 w-12 text-slate-300" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{sketch.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{sketch.project}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{sketch.date}</span>
                    <span>•</span>
                    <Layers className="h-3 w-3" />
                    <span>{sketch.layers} layers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
