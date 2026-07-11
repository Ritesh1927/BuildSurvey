'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  IndianRupee,
  User,
  Tag,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ActivityTimeline, type ActivityItem } from '@/components/dashboard/activity-timeline'
import { cn, formatCurrency, formatDate, formatDateTime, getInitials } from '@/lib/utils'

const leadData = {
  id: 'LED-001',
  name: 'Vikram Patel',
  email: 'vikram@heritagebuilders.in',
  phone: '+91 98765 43210',
  company: 'Heritage Builders',
  website: 'https://www.heritagebuilders.in',
  source: 'Website',
  status: 'NEW',
  statusLabel: 'New',
  statusColor: 'bg-blue-100 text-blue-800',
  priority: 'HIGH',
  priorityLabel: 'High',
  priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
  estimatedValue: 2500000,
  notes: 'Interested in heritage restoration survey for their upcoming project in Jaipur. Client has specifically asked for structural integrity assessment of century-old buildings.',
  nextFollowUp: '2026-07-14T10:00:00',
  assignedTo: { firstName: 'Priya', lastName: 'Sharma', role: 'Project Manager' },
  createdAt: '2026-07-10T10:00:00',
  updatedAt: '2026-07-10T10:00:00',
}

const statusWorkflow = [
  { key: 'NEW', label: 'New', completed: true },
  { key: 'CONTACTED', label: 'Contacted', completed: false },
  { key: 'QUALIFIED', label: 'Qualified', completed: false },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', completed: false },
  { key: 'NEGOTIATION', label: 'Negotiation', completed: false },
  { key: 'WON', label: 'Won', completed: false },
]

const leadActivities: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'lead_created',
    title: 'Lead Created',
    description: 'New lead received from website inquiry form.',
    user: { firstName: 'Saurabh', lastName: 'Verma' },
    timestamp: '2026-07-10T10:00:00',
  },
  {
    id: 'act-002',
    type: 'member_added',
    title: 'Assigned to Team',
    description: 'Lead assigned to Priya Sharma for initial follow-up.',
    user: { firstName: 'Saurabh', lastName: 'Verma' },
    timestamp: '2026-07-10T10:05:00',
  },
  {
    id: 'act-003',
    type: 'comment',
    title: 'Internal Note',
    description: 'Heritage Builders is a well-known construction firm in Rajasthan. They specialize in heritage restoration projects.',
    user: { firstName: 'Priya', lastName: 'Sharma' },
    timestamp: '2026-07-10T11:30:00',
  },
]

const relatedProjects: { id: string; name: string; status: string; statusColor: string }[] = []

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState([
    {
      id: 'note-1',
      content: 'Heritage Builders is a well-known construction firm in Rajasthan. They specialize in heritage restoration projects. This could be a high-value long-term partnership.',
      author: { firstName: 'Priya', lastName: 'Sharma' },
      createdAt: '2026-07-10T11:30:00',
    },
    {
      id: 'note-2',
      content: 'Client mentioned they need the survey completed before monsoon season. Timeline is critical.',
      author: { firstName: 'Priya', lastName: 'Sharma' },
      createdAt: '2026-07-10T14:00:00',
    },
  ])

  const handleAddNote = () => {
    if (!newNote.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        content: newNote,
        author: { firstName: 'Saurabh', lastName: 'Verma' },
        createdAt: new Date().toISOString(),
      },
    ])
    setNewNote('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={leadData.name}
        description={`${leadData.company} · ${leadData.source}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Leads', href: '/leads' },
          { label: leadData.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/leads">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/leads/${leadId}?edit=true`}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline">
              <ArrowRightLeft className="mr-1 h-4 w-4" />
              Convert to Client
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Lead Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Lead Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-[10px]', leadData.statusColor)}>
                    {leadData.statusLabel}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px]', leadData.priorityColor)}>
                    {leadData.priorityLabel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${leadData.email}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {leadData.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${leadData.phone}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {leadData.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">{leadData.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={leadData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Value</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(leadData.estimatedValue)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="text-sm font-medium">{leadData.source}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(leadData.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Follow-up</p>
                    <p className="text-sm font-medium">
                      {formatDate(leadData.nextFollowUp)}
                    </p>
                  </div>
                </div>
              </div>

              {leadData.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground">{leadData.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Lead Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {statusWorkflow.map((step, index) => {
                  const isCurrent = step.key === leadData.status
                  const isCompleted = step.completed

                  return (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                            isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                            isCurrent && 'border-primary bg-primary text-primary-foreground',
                            !isCompleted && !isCurrent && 'border-muted-foreground/20 bg-muted text-muted-foreground',
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Circle className="h-4 w-4 fill-current" />
                          ) : (
                            <span className="text-[10px]">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-medium whitespace-nowrap',
                            isCurrent ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < statusWorkflow.length - 1 && (
                        <div
                          className={cn(
                            'mx-2 h-[2px] w-8 sm:w-12',
                            isCompleted ? 'bg-emerald-500' : 'bg-muted',
                          )}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notes & Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Label htmlFor="new-note">Add a note</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="new-note"
                    placeholder="Type your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="shrink-0 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Notes List */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-medium">
                        {getInitials(note.author.firstName, note.author.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {note.author.firstName} {note.author.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={leadActivities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned To */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(
                      leadData.assignedTo.firstName,
                      leadData.assignedTo.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {leadData.assignedTo.firstName} {leadData.assignedTo.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{leadData.assignedTo.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deal Value</span>
                <span className="text-sm font-semibold">{formatCurrency(leadData.estimatedValue)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Since Created</span>
                <span className="text-sm font-semibold">
                  {Math.floor(
                    (Date.now() - new Date(leadData.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{' '}
                  days
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activities</span>
                <span className="text-sm font-semibold">{leadActivities.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notes</span>
                <span className="text-sm font-semibold">{notes.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Related Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    No related projects
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Convert this lead to create a project
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <ArrowRightLeft className="mr-1 h-3 w-3" />
                    Convert to Client
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        <Badge className={cn('mt-1 text-[10px]', project.statusColor)}>
                          {project.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/projects/${project.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
