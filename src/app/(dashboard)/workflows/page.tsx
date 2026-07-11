'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  GitBranch,
  Clock,
  CheckCircle,
  FileText,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpRight,
  Workflow,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate } from '@/lib/utils'

const mockWorkflows = [
  {
    id: 'WF-001',
    name: 'Site Survey Approval',
    project: 'Sunrise Enclave Phase 2',
    status: 'in-progress',
    currentStep: 2,
    totalSteps: 4,
    createdBy: 'Raj Mehta',
    createdDate: '2026-07-01',
    steps: [
      { name: 'Survey Submission', status: 'completed' },
      { name: 'Supervisor Review', status: 'completed' },
      { name: 'Manager Approval', status: 'in-progress' },
      { name: 'Client Sign-off', status: 'pending' },
    ],
  },
  {
    id: 'WF-002',
    name: 'Quotation Approval',
    project: 'Metro Residency Tower B',
    status: 'completed',
    currentStep: 3,
    totalSteps: 3,
    createdBy: 'Priya Sharma',
    createdDate: '2026-06-28',
    steps: [
      { name: 'Draft Quotation', status: 'completed' },
      { name: 'Finance Review', status: 'completed' },
      { name: 'Director Approval', status: 'completed' },
    ],
  },
  {
    id: 'WF-003',
    name: 'BOQ Review',
    project: 'Phoenix Tower Commercial',
    status: 'in-progress',
    currentStep: 1,
    totalSteps: 3,
    createdBy: 'Amit Kumar',
    createdDate: '2026-07-05',
    steps: [
      { name: 'BOQ Preparation', status: 'completed' },
      { name: 'Technical Review', status: 'in-progress' },
      { name: 'Final Approval', status: 'pending' },
    ],
  },
  {
    id: 'WF-004',
    name: 'Drawing Approval',
    project: 'Greenfield Estates Block C',
    status: 'pending',
    currentStep: 0,
    totalSteps: 5,
    createdBy: 'Neha Gupta',
    createdDate: '2026-07-08',
    steps: [
      { name: 'Drawing Submission', status: 'pending' },
      { name: 'Architect Review', status: 'pending' },
      { name: 'Structural Check', status: 'pending' },
      { name: 'Client Approval', status: 'pending' },
      { name: 'Final Sign-off', status: 'pending' },
    ],
  },
  {
    id: 'WF-005',
    name: 'Material Procurement',
    project: 'Sunrise Enclave Phase 2',
    status: 'in-progress',
    currentStep: 3,
    totalSteps: 4,
    createdBy: 'Vikram Patel',
    createdDate: '2026-06-20',
    steps: [
      { name: 'Requisition', status: 'completed' },
      { name: 'Vendor Selection', status: 'completed' },
      { name: 'Purchase Order', status: 'completed' },
      { name: 'Delivery Confirmation', status: 'in-progress' },
    ],
  },
  {
    id: 'WF-006',
    name: 'Invoice Processing',
    project: 'Metro Residency Tower B',
    status: 'draft',
    currentStep: 0,
    totalSteps: 3,
    createdBy: 'Saurabh Joshi',
    createdDate: '2026-07-10',
    steps: [
      { name: 'Invoice Creation', status: 'pending' },
      { name: 'Accounts Review', status: 'pending' },
      { name: 'Payment Authorization', status: 'pending' },
    ],
  },
  {
    id: 'WF-007',
    name: 'Quality Inspection',
    project: 'Phoenix Tower Commercial',
    status: 'completed',
    currentStep: 3,
    totalSteps: 3,
    createdBy: 'Raj Mehta',
    createdDate: '2026-06-15',
    steps: [
      { name: 'Inspection Scheduling', status: 'completed' },
      { name: 'On-site Inspection', status: 'completed' },
      { name: 'Report & Approval', status: 'completed' },
    ],
  },
  {
    id: 'WF-008',
    name: 'Change Order Request',
    project: 'Greenfield Estates Block C',
    status: 'in-progress',
    currentStep: 1,
    totalSteps: 4,
    createdBy: 'Priya Sharma',
    createdDate: '2026-07-03',
    steps: [
      { name: 'Request Submission', status: 'completed' },
      { name: 'Impact Analysis', status: 'in-progress' },
      { name: 'Cost Approval', status: 'pending' },
      { name: 'Implementation', status: 'pending' },
    ],
  },
  {
    id: 'WF-009',
    name: 'Subcontractor Onboarding',
    project: 'Sunrise Enclave Phase 2',
    status: 'completed',
    currentStep: 4,
    totalSteps: 4,
    createdBy: 'Amit Kumar',
    createdDate: '2026-06-25',
    steps: [
      { name: 'Application Review', status: 'completed' },
      { name: 'Document Verification', status: 'completed' },
      { name: 'Contract Signing', status: 'completed' },
      { name: 'Access Provisioning', status: 'completed' },
    ],
  },
  {
    id: 'WF-010',
    name: 'Progress Billing',
    project: 'Metro Residency Tower B',
    status: 'in-progress',
    currentStep: 2,
    totalSteps: 4,
    createdBy: 'Vikram Patel',
    createdDate: '2026-07-07',
    steps: [
      { name: 'Measurement Recording', status: 'completed' },
      { name: 'Bill Preparation', status: 'completed' },
      { name: 'Engineer Certification', status: 'in-progress' },
      { name: 'Client Payment', status: 'pending' },
    ],
  },
  {
    id: 'WF-011',
    name: 'Safety Compliance Review',
    project: 'Phoenix Tower Commercial',
    status: 'rejected',
    currentStep: 1,
    totalSteps: 3,
    createdBy: 'Neha Gupta',
    createdDate: '2026-07-02',
    steps: [
      { name: 'Compliance Check', status: 'completed' },
      { name: 'Safety Officer Review', status: 'rejected' },
      { name: 'Final Clearance', status: 'pending' },
    ],
  },
  {
    id: 'WF-012',
    name: 'Environmental Clearance',
    project: 'Greenfield Estates Block C',
    status: 'draft',
    currentStep: 0,
    totalSteps: 4,
    createdBy: 'Saurabh Joshi',
    createdDate: '2026-07-09',
    steps: [
      { name: 'Impact Assessment', status: 'pending' },
      { name: 'Report Preparation', status: 'pending' },
      { name: 'Authority Submission', status: 'pending' },
      { name: 'Clearance Certificate', status: 'pending' },
    ],
  },
]

const stats = [
  {
    label: 'Total Workflows',
    value: 12,
    change: 8,
    trend: 'up' as const,
    color: 'info' as const,
    icon: <Workflow className="h-5 w-5" />,
  },
  {
    label: 'Active',
    value: 6,
    change: 15,
    trend: 'up' as const,
    color: 'success' as const,
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    label: 'Completed',
    value: 4,
    change: 33,
    trend: 'up' as const,
    color: 'success' as const,
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    label: 'Draft',
    value: 2,
    change: -10,
    trend: 'down' as const,
    color: 'warning' as const,
    icon: <FileText className="h-5 w-5" />,
  },
]

const statusColors: Record<string, string> = {
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-800',
}

const stepStatusColors: Record<string, string> = {
  completed: 'bg-emerald-500 text-white',
  'in-progress': 'bg-blue-500 text-white',
  pending: 'bg-gray-200 text-gray-500',
  rejected: 'bg-red-500 text-white',
}

const stepLineColors: Record<string, string> = {
  completed: 'bg-emerald-500',
  'in-progress': 'bg-blue-500',
  pending: 'bg-gray-200',
  rejected: 'bg-red-500',
}

export default function WorkflowsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const projects = [...new Set(mockWorkflows.map((w) => w.project))]

  const filteredWorkflows = mockWorkflows.filter((w) => {
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter
    const matchesProject = projectFilter === 'all' || w.project === projectFilter
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesProject && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Workflow Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track all project workflows and approvals.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/workflows/new">
            <Plus className="mr-1 h-4 w-4" />
            New Workflow
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">
              All Workflows ({filteredWorkflows.length})
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <GitBranch className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge
                            className={cn(
                              'text-[10px] capitalize',
                              statusColors[workflow.status]
                            )}
                          >
                            {workflow.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{workflow.id}</span>
                          <span>&middot;</span>
                          <span>{workflow.project}</span>
                          <span>&middot;</span>
                          <span>Created by {workflow.createdBy}</span>
                          <span>&middot;</span>
                          <span>{formatDate(workflow.createdDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="ml-13">
                      <div className="flex items-center gap-1">
                        {workflow.steps.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold',
                                  stepStatusColors[step.status]
                                )}
                              >
                                {index + 1}
                              </div>
                              <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap max-w-[80px] text-center truncate">
                                {step.name}
                              </span>
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <div
                                className={cn(
                                  'h-0.5 w-8 mx-0.5 mb-5',
                                  stepLineColors[step.status]
                                )}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-13 lg:ml-0">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Step {workflow.currentStep}/{workflow.totalSteps}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workflows/${workflow.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
