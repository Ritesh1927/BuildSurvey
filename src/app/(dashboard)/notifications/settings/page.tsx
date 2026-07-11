'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Bell,
  MessageSquare,
  Smartphone,
  Save,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const emailEvents = [
  { id: 'wf-created', label: 'Workflow Created', description: 'When a new workflow is created and assigned to you' },
  { id: 'wf-step', label: 'Workflow Step Update', description: 'When a step in your workflow is completed or updated' },
  { id: 'wf-completed', label: 'Workflow Completed', description: 'When an entire workflow reaches completion' },
  { id: 'approval-req', label: 'Approval Requested', description: 'When someone requests your approval on a document' },
  { id: 'approval-done', label: 'Approval Processed', description: 'When your approval request is approved or rejected' },
  { id: 'comment', label: 'New Comment', description: 'When someone comments on your workflow or document' },
  { id: 'mention', label: 'Mentions', description: 'When someone mentions you in a comment or note' },
  { id: 'deadline', label: 'Deadline Reminders', description: 'Reminders for upcoming and overdue deadlines' },
  { id: 'doc-upload', label: 'Document Uploads', description: 'When new documents are uploaded to your projects' },
  { id: 'schedule', label: 'Schedule Changes', description: 'When meetings or tasks are scheduled or rescheduled' },
]

const pushEvents = [
  { id: 'push-approval', label: 'Approval Requests', description: 'Instant push for approval requests' },
  { id: 'push-mention', label: 'Mentions', description: 'Push notification when mentioned' },
  { id: 'push-deadline', label: 'Deadline Alerts', description: 'Push alerts for approaching deadlines' },
  { id: 'push-comment', label: 'Comments', description: 'Push when someone comments on your work' },
]

const smsEvents = [
  { id: 'sms-urgent', label: 'Urgent Alerts', description: 'Critical system alerts and urgent approval requests' },
  { id: 'sms-deadline', label: 'Overdue Deadlines', description: 'When a task is significantly overdue' },
]

const whatsappEvents = [
  { id: 'wa-approval', label: 'Approval Requests', description: 'WhatsApp notification for approval requests' },
  { id: 'wa-daily', label: 'Daily Summary', description: 'Daily digest of activities and pending items' },
]

export default function NotificationSettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [frequency, setFrequency] = useState('instant')
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00')
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)

  const [emailChecks, setEmailChecks] = useState<Record<string, boolean>>({
    'wf-created': true,
    'wf-step': true,
    'wf-completed': true,
    'approval-req': true,
    'approval-done': true,
    'comment': true,
    'mention': true,
    'deadline': true,
    'doc-upload': false,
    'schedule': true,
  })

  const [pushChecks, setPushChecks] = useState<Record<string, boolean>>({
    'push-approval': true,
    'push-mention': true,
    'push-deadline': true,
    'push-comment': false,
  })

  const [smsChecks, setSmsChecks] = useState<Record<string, boolean>>({
    'sms-urgent': true,
    'sms-deadline': false,
  })

  const [whatsappChecks, setWhatsappChecks] = useState<Record<string, boolean>>({
    'wa-approval': false,
    'wa-daily': false,
  })

  const toggleEmailCheck = (id: string) => {
    setEmailChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const togglePushCheck = (id: string) => {
    setPushChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSmsCheck = (id: string) => {
    setSmsChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleWhatsappCheck = (id: string) => {
    setWhatsappChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/notifications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Customize how and when you receive notifications.
            </p>
          </div>
        </div>
        <Button size="sm">
          <Save className="mr-1 h-4 w-4" />
          Save Preferences
        </Button>
      </div>

      {/* Delivery Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Delivery Frequency
          </CardTitle>
          <CardDescription>
            Choose how often you want to receive notification digests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant - Get notified right away</SelectItem>
              <SelectItem value="daily">Daily Digest - Once a day summary</SelectItem>
              <SelectItem value="weekly">Weekly Digest - Once a week summary</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Suppress notifications during specific hours.
              </CardDescription>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>
        </CardHeader>
        {quietHoursEnabled && (
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={quietHoursStart} onValueChange={setQuietHoursStart}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={quietHoursEnd} onValueChange={setQuietHoursEnd}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Email Notifications</CardTitle>
                  <CardDescription className="text-xs">
                    Receive notifications via email
                  </CardDescription>
                </div>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
          </CardHeader>
          {emailEnabled && (
            <CardContent>
              <div className="space-y-4">
                {emailEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <Checkbox
                      id={event.id}
                      checked={emailChecks[event.id]}
                      onCheckedChange={() => toggleEmailCheck(event.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                  <Bell className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Push Notifications</CardTitle>
                  <CardDescription className="text-xs">
                    Browser and mobile push notifications
                  </CardDescription>
                </div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>
          </CardHeader>
          {pushEnabled && (
            <CardContent>
              <div className="space-y-4">
                {pushEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <Checkbox
                      id={event.id}
                      checked={pushChecks[event.id]}
                      onCheckedChange={() => togglePushCheck(event.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">SMS Notifications</CardTitle>
                  <CardDescription className="text-xs">
                    Critical alerts via text message
                  </CardDescription>
                </div>
              </div>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
            </div>
          </CardHeader>
          {smsEnabled && (
            <CardContent>
              <div className="space-y-4">
                {smsEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <Checkbox
                      id={event.id}
                      checked={smsChecks[event.id]}
                      onCheckedChange={() => toggleSmsCheck(event.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* WhatsApp Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">WhatsApp Notifications</CardTitle>
                  <CardDescription className="text-xs">
                    Notifications via WhatsApp messages
                  </CardDescription>
                </div>
              </div>
              <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
            </div>
          </CardHeader>
          {whatsappEnabled && (
            <CardContent>
              <div className="space-y-4">
                {whatsappEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <Checkbox
                      id={event.id}
                      checked={whatsappChecks[event.id]}
                      onCheckedChange={() => toggleWhatsappCheck(event.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
