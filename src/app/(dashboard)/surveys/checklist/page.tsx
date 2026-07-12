"use client"

import { useState } from "react"
import {
  Plus, Edit, Trash2, Copy, CheckCircle2, ClipboardCheck,
  ChevronDown, ChevronRight, Search, Upload, Download, BarChart3,
  X, GripVertical, Save
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChecklistItem {
  id: number
  text: string
  required: boolean
}

interface ChecklistCategory {
  id: string
  name: string
  icon: string
  color: string
  items: ChecklistItem[]
}

const defaultCategories: ChecklistCategory[] = [
  {
    id: "structural",
    name: "Structural Assessment",
    icon: "🏗️",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    items: [
      { id: 1, text: "Foundation condition assessment", required: true },
      { id: 2, text: "Column and beam inspection", required: true },
      { id: 3, text: "Load-bearing wall evaluation", required: true },
      { id: 4, text: "Slab thickness verification", required: true },
      { id: 5, text: "Rebar placement verification", required: true },
      { id: 6, text: "Crack mapping and measurement", required: true },
      { id: 7, text: "Settlement monitoring review", required: false },
      { id: 8, text: "Waterproofing integrity check", required: true },
    ],
  },
  {
    id: "electrical",
    name: "Electrical Systems",
    icon: "⚡",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    items: [
      { id: 1, text: "Main distribution panel inspection", required: true },
      { id: 2, text: "Wiring and conduit assessment", required: true },
      { id: 3, text: "Grounding system verification", required: true },
      { id: 4, text: "Lighting fixture evaluation", required: false },
      { id: 5, text: "Emergency power system test", required: true },
      { id: 6, text: "Load balancing verification", required: true },
    ],
  },
  {
    id: "plumbing",
    name: "Plumbing Systems",
    icon: "🔧",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    items: [
      { id: 1, text: "Water supply line inspection", required: true },
      { id: 2, text: "Drainage system assessment", required: true },
      { id: 3, text: "Pipe material verification", required: true },
      { id: 4, text: "Valve operation test", required: true },
      { id: 5, text: "Water pressure testing", required: true },
      { id: 6, text: "Fire sprinkler system check", required: true },
    ],
  },
  {
    id: "fire-safety",
    name: "Fire Safety",
    icon: "🔥",
    color: "bg-red-100 text-red-800 border-red-200",
    items: [
      { id: 1, text: "Fire exit accessibility check", required: true },
      { id: 2, text: "Emergency lighting verification", required: true },
      { id: 3, text: "Fire extinguisher placement", required: true },
      { id: 4, text: "Alarm system functionality test", required: true },
      { id: 5, text: "Evacuation plan review", required: true },
    ],
  },
  {
    id: "environmental",
    name: "Environmental",
    icon: "🌿",
    color: "bg-green-100 text-green-800 border-green-200",
    items: [
      { id: 1, text: "Air quality assessment", required: true },
      { id: 2, text: "Noise level measurement", required: true },
      { id: 3, text: "Dust control measures", required: true },
      { id: 4, text: "Waste management compliance", required: true },
      { id: 5, text: "Soil contamination screening", required: false },
    ],
  },
  {
    id: "interior",
    name: "Interior Finish",
    icon: "🏠",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    items: [
      { id: 1, text: "Wall finish quality assessment", required: true },
      { id: 2, text: "Floor tile inspection", required: true },
      { id: 3, text: "Ceiling finish evaluation", required: true },
      { id: 4, text: "Door and window hardware check", required: true },
      { id: 5, text: "Paint quality inspection", required: true },
      { id: 6, text: "Fixture installation verification", required: true },
    ],
  },
  {
    id: "exterior",
    name: "Exterior Assessment",
    icon: "🏢",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    items: [
      { id: 1, text: "Facade condition assessment", required: true },
      { id: 2, text: "Roofing material inspection", required: true },
      { id: 3, text: "Exterior paint/cladding check", required: true },
      { id: 4, text: "Landscaping and drainage", required: false },
      { id: 5, text: "Boundary wall inspection", required: true },
    ],
  },
]

const usageStats = [
  { category: "Structural Assessment", count: 42, lastUsed: "2026-07-08" },
  { category: "Electrical Systems", count: 38, lastUsed: "2026-07-07" },
  { category: "Plumbing Systems", count: 28, lastUsed: "2026-07-06" },
  { category: "Fire Safety", count: 55, lastUsed: "2026-07-09" },
  { category: "Environmental", count: 22, lastUsed: "2026-07-05" },
  { category: "Interior Finish", count: 35, lastUsed: "2026-07-08" },
  { category: "Exterior Assessment", count: 18, lastUsed: "2026-07-04" },
]

export default function ChecklistPage() {
  const [categories, setCategories] = useState(defaultCategories)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({})
  const [editingItem, setEditingItem] = useState<{ catId: string; itemId: number } | null>(null)
  const [editText, setEditText] = useState("")

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.items.some(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const totalRequired = categories.reduce((sum, cat) => sum + cat.items.filter(i => i.required).length, 0)

  const addItem = (catId: string) => {
    const text = newItemInputs[catId]
    if (!text?.trim()) return
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: [...cat.items, { id: Date.now(), text: text.trim(), required: false }] } : cat
    ))
    setNewItemInputs(prev => ({ ...prev, [catId]: "" }))
  }

  const removeItem = (catId: string, itemId: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
    ))
  }

  const toggleRequired = (catId: string, itemId: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.map(i => i.id === itemId ? { ...i, required: !i.required } : i) } : cat
    ))
  }

  const startEdit = (catId: string, itemId: number, text: string) => {
    setEditingItem({ catId, itemId })
    setEditText(text)
  }

  const saveEdit = (catId: string, itemId: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, items: cat.items.map(i => i.id === itemId ? { ...i, text: editText } : i) } : cat
    ))
    setEditingItem(null)
    setEditText("")
  }

  const addNewCategory = () => {
    const newId = `custom-${Date.now()}`
    setCategories(prev => [...prev, {
      id: newId,
      name: "New Category",
      icon: "📋",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      items: [],
    }])
    setExpandedCategory(newId)
  }

  const removeCategory = (catId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== catId))
    if (expandedCategory === catId) setExpandedCategory(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checklist Templates"
        description="Manage survey checklist templates and categories"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Surveys", href: "/surveys" },
          { label: "Checklist Templates" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => document.getElementById("checklist-import-input")?.click()}><Upload className="h-4 w-4 mr-2" /> Import</Button>
            <input id="checklist-import-input" type="file" accept=".csv,.json,.xlsx" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) { import("@/components/ui/toast").then(({ showSuccess }) => { showSuccess("Checklist imported successfully") }); e.target.value = "" } }} />
            <Button variant="outline" onClick={() => { import("@/components/ui/toast").then(({ showSuccess }) => { showSuccess("Checklist template exported") }) }}><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button onClick={addNewCategory}><Plus className="h-4 w-4 mr-2" /> New Category</Button>
          </div>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalRequired}</p>
            <p className="text-sm text-muted-foreground">Required Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{usageStats.reduce((s, u) => s + u.count, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Usage Count</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search categories or items..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredCategories.map(category => {
            const isExpanded = expandedCategory === category.id
            const usage = usageStats.find(u => u.category === category.name)
            return (
              <Card key={category.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="cursor-pointer" onClick={() => setExpandedCategory(isExpanded ? null : category.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant="secondary" className="text-xs">{category.items.length} items</Badge>
                          {usage && <span className="text-xs text-muted-foreground">Used {usage.count} times</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {category.items.filter(i => i.required).length} required
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronDown className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit Category</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => removeCategory(category.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {isExpanded && (
                  <div className="border-t bg-muted/30">
                    <div className="p-4 space-y-2">
                      {category.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-card border hover:shadow-sm transition-all group">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Checkbox checked={item.required} onCheckedChange={() => toggleRequired(category.id, item.id)} />
                          {editingItem?.catId === category.id && editingItem?.itemId === item.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-7 text-sm" onKeyDown={(e) => e.key === "Enter" && saveEdit(category.id, item.id)} autoFocus />
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(category.id, item.id)}><Save className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingItem(null)}><X className="h-3 w-3" /></Button>
                            </div>
                          ) : (
                            <span className="flex-1 text-sm">{item.text}</span>
                          )}
                          {item.required && editingItem?.catId !== category.id && editingItem?.itemId !== item.id && (
                            <Badge variant="secondary" className="text-[10px]">Required</Badge>
                          )}
                          {editingItem?.catId !== category.id && editingItem?.itemId !== item.id && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(category.id, item.id, item.text)}><Edit className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(category.id, item.id)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="Add new checklist item..."
                          className="h-8 text-sm"
                          value={newItemInputs[category.id] || ""}
                          onChange={(e) => setNewItemInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addItem(category.id)}
                        />
                        <Button size="sm" onClick={() => addItem(category.id)} disabled={!newItemInputs[category.id]?.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-lg font-medium mt-4">No categories found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or create a new category</p>
            </div>
          )}
        </div>

        {/* Usage Statistics Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usageStats.sort((a, b) => b.count - a.count).map(stat => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{stat.category}</span>
                    <span className="text-muted-foreground">{stat.count}</span>
                  </div>
                  <Progress value={(stat.count / 55) * 100} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Last used: {stat.lastUsed}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
