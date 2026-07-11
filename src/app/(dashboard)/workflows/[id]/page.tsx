'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  MessageSquare,
  Clock,
  User,
  Calendar,
  Pencil,
  Trash2,
  Send,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatDateTime, formatDate } from '@/lib/utils'

const workflowData: Record<string, {
  id: string
  name: string
  project: string
  status: string
  createdBy: string
  createdDate: string
  description: string
  steps: {
    name: string
    assignedTo: string
    status: string
    completedDate: string | null
    comments: string[]
  }[]
  activity: {
    action: string
    user: string
    timestamp: string
    details: string
  }[]
}> = {
  'WF-001': {
    id: 'WF-001',
    name: 'Site Survey Approval',
    project: 'Sunrise Enclave Phase 2',
    status: 'in-progress',
    createdBy: 'Raj Mehta',
    createdDate: '2026-07-01',
    description: 'Standard approval workflow for site survey reports including supervisor review and client sign-off.',
    steps: [
      {
        name: 'Survey Submission',
        assignedTo: 'Amit Kumar',
        status: 'completed',
        completedDate: '2026-07-02T10:30:00',
        comments: ['Survey data uploaded successfully.'],
      },
      {
        name: 'Supervisor Review',
        assignedTo: 'Raj Mehta',
        status: 'completed',
        completedDate: '2026-07-03T14:15:00',
        comments: ['Reviewed all measurements. Minor corrections needed on grid points.'],
      },
      {
        name: 'Manager Approval',
        assignedTo: 'Priya Sharma',
        status: 'in-progress',
        completedDate: null,
        comments: [],
      },
      {
        name: 'Client Sign-off',
        assignedTo: 'Vikram Patel',
        status: 'pending',
        completedDate: null,
        comments: [],
      },
    ],
    activity: [
      {
        action: 'Step Completed',
        user: 'Raj Mehta',
        timestamp: '2026-07-03T14:15:00',
        details: 'Completed Supervisor Review step',
      },
      {
        action: 'Comment Added',
        user: 'Raj Mehta',
        timestamp: '2026-07-03T14:10:00',
        details: 'Reviewed all measurements. Minor corrections needed on grid points.',
      },
      {
        action: 'Step Completed',
        user: 'Amit Kumar',
        timestamp: '2026-07-02T10:30:00',
        details: 'Completed Survey Submission step',
      },
      {
        action: 'Workflow Created',
        user: 'Raj Mehta',
        timestamp: '2026-07-01T09:00:00',
        details: 'Created Site Survey Approval workflow',
      },
    ],
  },
}

const defaultWorkflow = {
  id: 'WF-003',
  name: 'BOQ Review',
  project: 'Phoenix Tower Commercial',
  status: 'in-progress',
  createdBy: 'Amit Kumar',
  createdDate: '2026-07-05',
  description: 'Review and approval process for Bill of Quantities preparation and validation.',
  steps: [
    {
      name: 'BOQ Preparation',
      assignedTo: 'Saurabh Joshi',
      status: 'completed',
      completedDate: '2026-07-06T11:00:00',
      comments: ['BOQ drafted with all line items.'],
    },
    {
      name: 'Technical Review',
      assignedTo: 'Amit Kumar',
      status: 'in-progress',
      completedDate: null,
      comments: [],
    },
    {
      name: 'Final Approval',
      assignedTo: 'Priya Sharma',
      status: 'pending',
      completedDate: null,
      comments: [],
    },
  ],
  activity: [
    {
      action: 'Step Completed',
      user: 'Saurabh Joshi',
      timestamp: '2026-07-06T11:00:00',
      details: 'Completed BOQ Preparation step',
    },
    {
      action: 'Workflow Created',
      user: 'Amit Kumar',
      timestamp: '2026-07-05T09:00:00',
      details: 'Created BOQ Review workflow',
    },
  ],
}

const stepStatusColors: Record<string, string> = {
  completed: 'bg-emerald-500 text-white border-emerald-500',
  'in-progress': 'bg-blue-500 text-white border-blue-500',
  pending: 'bg-gray-100 text-gray-400 border-gray-300',
  rejected: 'bg-red-500 text-white border-red-500',
}

const stepBgColors: Record<string, string> = {
  completed: 'border-emerald-200 bg-emerald-50',
  'in-progress': 'border-blue-200 bg-blue-50',
  pending: 'border-gray-200 bg-gray-50',
  rejected: 'border-red-200 bg-red-50',
}

const lineColors: Record<string, string> = {
  completed: 'bg-emerald-500',
  'in-progress': 'bg-blue-500',
  pending: 'bg-gray-300',
  rejected: 'bg-red-500',
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const id = params.id as string
  const workflow = workflowData[id] || { ...defaultWorkflow, id }

  const [comment, setComment] = useState('')
  const [activityLog, setActivityLog] = useState(workflow.activity)

  const handleAction = (action: string) => {
    const newActivity = {
      action,
      user: 'You',
      timestamp: new Date().toISOString(),
      details: comment || `Performed ${action}`,
    }
    setActivityLog([newActivity, ...activityLog])
    setComment('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/workflows">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {workflow.name}
              </h1>
              <Badge className="capitalize text-[10px]">
                {workflow.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {workflow.project} &middot; {workflow.id} &middot; Created by{' '}
              {workflow.createdBy} on {formatDate(workflow.createdDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-1 h-4 w-4" />
            Restart
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between overflow-x-auto pb-4">
            {workflow.steps.map((step, index) => (
              <div key={index} className="flex items-start flex-1 min-w-[140px]">
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                          stepStatusColors[step.status]
                        )}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : step.status === 'rejected' ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium">{step.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {step.assignedTo}
                        </div>
                        {step.completedDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(step.completedDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <div
                        className={cn(
                          'h-1 w-full mt-5 mx-[-10px]',
                          lineColors[step.status]
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Step Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg border p-4',
                    stepBgColors[step.status]
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        Step {index + 1}: {step.name}
                      </span>
                      <Badge
                        className={cn(
                          'text-[10px] capitalize',
                          step.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : step.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : step.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {step.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Assigned to {step.assignedTo}
                    </span>
                  </div>
                  {step.comments.length > 0 && (
                    <div className="space-y-1">
                      {step.comments.map((c, ci) => (
                        <p key={ci} className="text-xs text-muted-foreground italic">
                          &ldquo;{c}&rdquo;
                        </p>
                      ))}
                    </div>
                  )}
                  {step.status === 'in-progress' && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction('Step Completed')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction('Step Rejected')}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('Revision Requested')}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  onClick={() => handleAction('Comment Added')}
                  disabled={!comment.trim()}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.user}</span>
                      <span>&middot;</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
