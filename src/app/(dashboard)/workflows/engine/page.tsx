'use client'

import { useState } from 'react'
import {
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Bell,
  FileText,
  AlertTriangle,
  Split,
  Plus,
  Trash2,
  Settings,
  Save,
  ArrowRight,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  Copy,
  Play,
  Pause,
  Zap,
  Target,
  Workflow,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type StepType = 'approval' | 'review' | 'notification' | 'condition' | 'parallel'
type StepStatus = 'pending' | 'active' | 'completed' | 'rejected'

interface WorkflowStep {
  id: string
  type: StepType
  name: string
  assignee: string
  status: StepStatus
  description: string
  conditions?: string
  x: number
  y: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  category: string
}

const stepTypeConfig: Record<StepType, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  approval: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Approval' },
  review: { icon: <Eye className="h-4 w-4" />, color: 'text-violet-600', bgColor: 'bg-violet-100', label: 'Review' },
  notification: { icon: <Bell className="h-4 w-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Notification' },
  condition: { icon: <GitBranch className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Condition' },
  parallel: { icon: <Split className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Parallel' },
}

const statusConfig: Record<StepStatus, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'text-gray-500', bgColor: 'bg-gray-100 border-gray-300', icon: <Clock className="h-4 w-4" />, label: 'Pending' },
  active: { color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-400 ring-2 ring-blue-200', icon: <Play className="h-4 w-4 animate-pulse" />, label: 'Active' },
  completed: { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-400', icon: <CheckCircle className="h-4 w-4" />, label: 'Completed' },
  rejected: { color: 'text-red-600', bgColor: 'bg-red-50 border-red-400', icon: <XCircle className="h-4 w-4" />, label: 'Rejected' },
}

const users = [
  'Saurabh Patel',
  'Raj Mehta',
  'Amit Kumar',
  'Neha Gupta',
  'Vikram Patel',
  'Priya Sharma',
  'Deepak Verma',
  'Anjali Desai',
]

const templates: WorkflowTemplate[] = [
  {
    id: 'survey-approval',
    name: 'Survey Approval',
    description: 'Standard site survey approval workflow',
    category: 'Survey',
    steps: [
      { id: 's1', type: 'approval', name: 'Engineer Submit', assignee: 'Amit Kumar', status: 'completed', description: 'Site engineer submits the survey report for review', x: 50, y: 80 },
      { id: 's2', type: 'review', name: 'Manager Review', assignee: 'Raj Mehta', status: 'active', description: 'Project manager reviews survey data and findings', x: 250, y: 80 },
      { id: 's3', type: 'approval', name: 'Client Approval', assignee: 'Saurabh Patel', status: 'pending', description: 'Client reviews and approves the final survey', x: 450, y: 80 },
      { id: 's4', type: 'notification', name: 'Complete', assignee: 'System', status: 'pending', description: 'Send completion notification to all stakeholders', x: 650, y: 80 },
    ],
  },
  {
    id: 'boq-review',
    name: 'BOQ Review',
    description: 'Bill of Quantities review and approval',
    category: 'BOQ',
    steps: [
      { id: 'b1', type: 'approval', name: 'Draft', assignee: 'Neha Gupta', status: 'completed', description: 'Create initial BOQ draft with quantities', x: 100, y: 80 },
      { id: 'b2', type: 'review', name: 'Review', assignee: 'Vikram Patel', status: 'active', description: 'Technical review of BOQ items and rates', x: 350, y: 80 },
      { id: 'b3', type: 'approval', name: 'Approve', assignee: 'Raj Mehta', status: 'pending', description: 'Final approval of BOQ for client submission', x: 600, y: 80 },
    ],
  },
  {
    id: 'quotation-approval',
    name: 'Quotation Approval',
    description: 'Multi-level quotation approval process',
    category: 'Quotation',
    steps: [
      { id: 'q1', type: 'approval', name: 'Create', assignee: 'Priya Sharma', status: 'completed', description: 'Prepare quotation with pricing details', x: 30, y: 80 },
      { id: 'q2', type: 'review', name: 'Manager', assignee: 'Raj Mehta', status: 'completed', description: 'Manager reviews pricing and margins', x: 180, y: 80 },
      { id: 'q3', type: 'review', name: 'Finance', assignee: 'Deepak Verma', status: 'active', description: 'Finance team validates financial terms', x: 330, y: 80 },
      { id: 'q4', type: 'approval', name: 'Director', assignee: 'Saurabh Patel', status: 'pending', description: 'Director final approval for quotation', x: 480, y: 80 },
      { id: 'q5', type: 'notification', name: 'Send', assignee: 'System', status: 'pending', description: 'Send approved quotation to client via email', x: 630, y: 80 },
    ],
  },
  {
    id: 'document-approval',
    name: 'Document Approval',
    description: 'General document review and approval',
    category: 'Document',
    steps: [
      { id: 'd1', type: 'approval', name: 'Upload', assignee: 'Anjali Desai', status: 'completed', description: 'Upload document for review process', x: 100, y: 80 },
      { id: 'd2', type: 'review', name: 'Review', assignee: 'Vikram Patel', status: 'active', description: 'Review document for accuracy and compliance', x: 350, y: 80 },
      { id: 'd3', type: 'approval', name: 'Approve', assignee: 'Raj Mehta', status: 'pending', description: 'Final approval and sign-off on document', x: 600, y: 80 },
    ],
  },
]

export default function WorkflowEnginePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(templates[0])
  const [steps, setSteps] = useState<WorkflowStep[]>(templates[0].steps)
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [workflowName, setWorkflowName] = useState('Survey Approval Workflow')
  const [showAddStep, setShowAddStep] = useState(false)
  const [activeTab, setActiveTab] = useState('canvas')

  const loadTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setSteps(template.steps)
    setWorkflowName(`${template.name} Workflow`)
    setSelectedStep(null)
  }

  const selectStep = (step: WorkflowStep) => {
    setSelectedStep(step)
  }

  const updateStepStatus = (stepId: string, status: StepStatus) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, status } : s)))
    if (selectedStep?.id === stepId) {
      setSelectedStep((prev) => (prev ? { ...prev, status } : null))
    }
  }

  const addStep = (type: StepType) => {
    const config = stepTypeConfig[type]
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: `New ${config.label} Step`,
      assignee: 'Unassigned',
      status: 'pending',
      description: '',
      x: steps.length > 0 ? steps[steps.length - 1].x + 200 : 100,
      y: 80,
    }
    setSteps([...steps, newStep])
    setShowAddStep(false)
    setSelectedStep(newStep)
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId))
    if (selectedStep?.id === stepId) {
      setSelectedStep(null)
    }
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Workflow Engine
          </h1>
          <p className="text-muted-foreground">
            Design and manage approval workflows visually.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-1 h-4 w-4" />
            Duplicate
          </Button>
          <Button size="sm">
            <Save className="mr-1 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[260px_1fr_300px]">
            {/* Left Sidebar - Step Types */}
            <Card className="lg:row-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Step Types</CardTitle>
                <CardDescription className="text-xs">Drag to add steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.entries(stepTypeConfig) as [StepType, typeof stepTypeConfig[StepType]][]).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => addStep(type)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-md',
                      'hover:border-primary/30'
                    )}
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.bgColor, config.color)}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{type}</p>
                    </div>
                    <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                  </button>
                ))}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-lg font-bold">{steps.length}</p>
                      <p className="text-[10px] text-muted-foreground">Steps</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-lg font-bold">{progress}%</p>
                      <p className="text-[10px] text-muted-foreground">Progress</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Status Legend</h4>
                  {(Object.entries(statusConfig) as [StepStatus, typeof statusConfig[StepStatus]][]).map(([status, config]) => (
                    <div key={status} className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Canvas Area */}
            <Card className="lg:row-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold">{workflowName}</CardTitle>
                  <CardDescription className="text-xs">{steps.length} steps &middot; {progress}% complete</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{progress}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="relative min-w-[800px] p-4">
                    {/* SVG Arrow Layer */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                      {steps.map((step, index) => {
                        if (index === steps.length - 1) return null
                        const nextStep = steps[index + 1]
                        const startX = step.x + 140
                        const startY = step.y + 40
                        const endX = nextStep.x
                        const endY = nextStep.y + 40
                        const midX = (startX + endX) / 2
                        return (
                          <g key={`arrow-${step.id}-${nextStep.id}`}>
                            <path
                              d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                              fill="none"
                              stroke={step.status === 'completed' ? '#10b981' : '#d1d5db'}
                              strokeWidth="2"
                              strokeDasharray={step.status === 'completed' ? 'none' : '6 3'}
                            />
                            <circle cx={endX - 4} cy={endY} r="3" fill={step.status === 'completed' ? '#10b981' : '#d1d5db'} />
                          </g>
                        )
                      })}
                    </svg>

                    {/* Step Nodes */}
                    {steps.map((step) => {
                      const typeConf = stepTypeConfig[step.type]
                      const statConf = statusConfig[step.status]
                      const isSelected = selectedStep?.id === step.id
                      return (
                        <div
                          key={step.id}
                          onClick={() => selectStep(step)}
                          className={cn(
                            'absolute cursor-pointer rounded-xl border-2 bg-white p-3 shadow-sm transition-all hover:shadow-lg',
                            statConf.bgColor,
                            isSelected && 'ring-2 ring-primary ring-offset-2',
                            step.status === 'active' && 'animate-pulse'
                          )}
                          style={{ left: step.x, top: step.y, width: 150 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', typeConf.bgColor, typeConf.color)}>
                              {typeConf.icon}
                            </div>
                            <span className={cn('flex items-center gap-1 text-[10px] font-medium', statConf.color)}>
                              {statConf.icon}
                              {statConf.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold truncate">{step.name}</p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{step.assignee}</span>
                          </div>
                        </div>
                      )
                    })}

                    {steps.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No steps yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Add steps from the left sidebar or load a template
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Panel - Properties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  {selectedStep ? 'Step Properties' : 'Select a Step'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStep ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Step Name</Label>
                      <Input
                        value={selectedStep.name}
                        onChange={(e) => {
                          const updated = steps.map((s) =>
                            s.id === selectedStep.id ? { ...s, name: e.target.value } : s
                          )
                          setSteps(updated)
                          setSelectedStep({ ...selectedStep, name: e.target.value })
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <div className="flex items-center gap-2">
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', stepTypeConfig[selectedStep.type].bgColor, stepTypeConfig[selectedStep.type].color)}>
                          {stepTypeConfig[selectedStep.type].icon}
                        </div>
                        <span className="text-sm font-medium">{stepTypeConfig[selectedStep.type].label}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Assignee</Label>
                      <Select
                        value={selectedStep.assignee}
                        onValueChange={(val) => {
                          const updated = steps.map((s) =>
                            s.id === selectedStep.id ? { ...s, assignee: val } : s
                          )
                          setSteps(updated)
                          setSelectedStep({ ...selectedStep, assignee: val })
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user} value={user}>{user}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={selectedStep.status}
                        onValueChange={(val) => updateStepStatus(selectedStep.id, val as StepStatus)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(statusConfig) as [StepStatus, typeof statusConfig[StepStatus]][]).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              <span className="flex items-center gap-2">
                                <span className={config.color}>{config.icon}</span>
                                {config.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <textarea
                        value={selectedStep.description}
                        onChange={(e) => {
                          const updated = steps.map((s) =>
                            s.id === selectedStep.id ? { ...s, description: e.target.value } : s
                          )
                          setSteps(updated)
                          setSelectedStep({ ...selectedStep, description: e.target.value })
                        }}
                        className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                      />
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => removeStep(selectedStep.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Target className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click on a step node in the canvas to view and edit its properties
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedTemplate?.id === template.id && 'border-primary ring-2 ring-primary/20'
                )}
                onClick={() => {
                  loadTemplate(template)
                  setActiveTab('canvas')
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {template.steps.slice(0, 4).map((step, i) => {
                        const conf = stepTypeConfig[step.type]
                        return (
                          <div
                            key={step.id}
                            className={cn('flex h-7 w-7 items-center justify-center rounded-full border-2 border-white', conf.bgColor, conf.color)}
                            style={{ zIndex: 4 - i }}
                          >
                            {conf.icon}
                          </div>
                        )
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">{template.steps.length} steps</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.steps.map((step) => (
                      <span key={step.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {step.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                    placeholder="Describe this workflow..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Event</Label>
                  <Select defaultValue="manual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                      <SelectItem value="survey-submit">Survey Submitted</SelectItem>
                      <SelectItem value="boq-create">BOQ Created</SelectItem>
                      <SelectItem value="quotation-create">Quotation Created</SelectItem>
                      <SelectItem value="doc-upload">Document Uploaded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email on step assignment</p>
                    <p className="text-xs text-muted-foreground">Notify assignee when a step is assigned</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email on completion</p>
                    <p className="text-xs text-muted-foreground">Notify when workflow completes</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Escalation</p>
                    <p className="text-xs text-muted-foreground">Auto-escalate after timeout</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SLA Monitoring</p>
                    <p className="text-xs text-muted-foreground">Track step completion time</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
