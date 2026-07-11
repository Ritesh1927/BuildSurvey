'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  GitBranch,
  Layers,
  FileText,
  MoreHorizontal,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const mockTemplates = [
  {
    id: 'TPL-001',
    name: 'Survey Approval',
    description: 'Standard workflow for site survey report approval from submission to client sign-off.',
    stepCount: 4,
    usageCount: 18,
    steps: ['Survey Submission', 'Supervisor Review', 'Manager Approval', 'Client Sign-off'],
    createdBy: 'Raj Mehta',
    createdDate: '2026-05-10',
  },
  {
    id: 'TPL-002',
    name: 'BOQ Review',
    description: 'Workflow for reviewing and approving Bill of Quantities with technical validation.',
    stepCount: 3,
    usageCount: 12,
    steps: ['BOQ Preparation', 'Technical Review', 'Final Approval'],
    createdBy: 'Amit Kumar',
    createdDate: '2026-05-15',
  },
  {
    id: 'TPL-003',
    name: 'Quotation Approval',
    description: 'Multi-level approval process for project quotations including finance and director review.',
    stepCount: 5,
    usageCount: 24,
    steps: ['Draft Quotation', 'Finance Review', 'Director Review', 'Client Approval', 'Final Confirmation'],
    createdBy: 'Priya Sharma',
    createdDate: '2026-04-20',
  },
  {
    id: 'TPL-004',
    name: 'Drawing Approval',
    description: 'Comprehensive drawing review workflow with architectural and structural checks.',
    stepCount: 5,
    usageCount: 9,
    steps: ['Drawing Submission', 'Architect Review', 'Structural Check', 'Client Approval', 'Final Sign-off'],
    createdBy: 'Neha Gupta',
    createdDate: '2026-06-01',
  },
  {
    id: 'TPL-005',
    name: 'Material Procurement',
    description: 'End-to-end procurement workflow from requisition to delivery confirmation.',
    stepCount: 4,
    usageCount: 15,
    steps: ['Requisition', 'Vendor Selection', 'Purchase Order', 'Delivery Confirmation'],
    createdBy: 'Vikram Patel',
    createdDate: '2026-05-25',
  },
  {
    id: 'TPL-006',
    name: 'Quality Inspection',
    description: 'Quality assurance workflow for site inspections and compliance reporting.',
    stepCount: 3,
    usageCount: 21,
    steps: ['Inspection Scheduling', 'On-site Inspection', 'Report & Approval'],
    createdBy: 'Raj Mehta',
    createdDate: '2026-04-15',
  },
  {
    id: 'TPL-007',
    name: 'Change Order Request',
    description: 'Workflow for managing change orders including impact analysis and cost approval.',
    stepCount: 4,
    usageCount: 7,
    steps: ['Request Submission', 'Impact Analysis', 'Cost Approval', 'Implementation'],
    createdBy: 'Saurabh Joshi',
    createdDate: '2026-06-10',
  },
  {
    id: 'TPL-008',
    name: 'Safety Compliance',
    description: 'Safety review and compliance clearance workflow for construction sites.',
    stepCount: 3,
    usageCount: 11,
    steps: ['Compliance Check', 'Safety Officer Review', 'Final Clearance'],
    createdBy: 'Amit Kumar',
    createdDate: '2026-06-20',
  },
]

const stepColors = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-teal-50 text-teal-700 border-teal-200',
]

export default function WorkflowTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDesc, setNewTemplateDesc] = useState('')
  const [newTemplateSteps, setNewTemplateSteps] = useState<string[]>([''])

  const filteredTemplates = mockTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addStep = () => {
    setNewTemplateSteps([...newTemplateSteps, ''])
  }

  const removeStep = (index: number) => {
    setNewTemplateSteps(newTemplateSteps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, value: string) => {
    const updated = [...newTemplateSteps]
    updated[index] = value
    setNewTemplateSteps(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Workflow Templates
          </h1>
          <p className="text-muted-foreground">
            Create and manage reusable workflow templates for your projects.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Workflow Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g. Site Inspection Workflow"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the purpose of this workflow template..."
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Steps</Label>
                  <Button variant="outline" size="sm" onClick={addStep}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {newTemplateSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <Input
                        placeholder={`Step ${index + 1} name`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="flex-1"
                      />
                      {newTemplateSteps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Templates ({filteredTemplates.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[220px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border p-5 transition-colors hover:bg-muted/50 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {template.stepCount} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Used {template.usageCount} times
                  </span>
                </div>
                <div className="space-y-1.5">
                  {template.steps.map((step, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs',
                        stepColors[index % stepColors.length]
                      )}
                    >
                      <span className="font-bold">{index + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
