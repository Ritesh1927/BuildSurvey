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
  CheckCircle,
  AlertTriangle,
  FileText,
  GitBranch,
  Users,
  DollarSign,
  Building2,
  Shield,
  Camera,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

interface NotificationTypeConfig {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  channels: {
    email: boolean
    push: boolean
    sms: boolean
    whatsapp: boolean
  }
}

const notificationTypes: NotificationTypeConfig[] = [
  {
    id: 'survey-assigned',
    label: 'Survey Assigned',
    description: 'When a new survey is assigned to you',
    icon: <CheckCircle className="h-4 w-4" />,
    channels: { email: true, push: true, sms: false, whatsapp: false },
  },
  {
    id: 'survey-updated',
    label: 'Survey Updated',
    description: 'When a survey you are involved in is updated',
    icon: <CheckCircle className="h-4 w-4" />,
    channels: { email: true, push: false, sms: false, whatsapp: false },
  },
  {
    id: 'survey-completed',
    label: 'Survey Completed',
    description: 'When a site survey is marked as completed',
    icon: <CheckCircle className="h-4 w-4" />,
    channels: { email: true, push: true, sms: false, whatsapp: false },
  },
  {
    id: 'project-status',
    label: 'Project Status Changes',
    description: 'When project status is updated',
    icon: <Building2 className="h-4 w-4" />,
    channels: { email: true, push: false, sms: false, whatsapp: false },
  },
  {
    id: 'boq-submitted',
    label: 'BOQ Submitted',
    description: 'When a BOQ is submitted for review',
    icon: <FileText className="h-4 w-4" />,
    channels: { email: true, push: true, sms: false, whatsapp: false },
  },
  {
    id: 'boq-approved',
    label: 'BOQ Approved',
    description: 'When a BOQ is approved or rejected',
    icon: <CheckCircle className="h-4 w-4" />,
    channels: { email: true, push: true, sms: false, whatsapp: false },
  },
  {
    id: 'quotation-sent',
    label: 'Quotation Sent',
    description: 'When a quotation is sent to client',
    icon: <DollarSign className="h-4 w-4" />,
    channels: { email: true, push: false, sms: false, whatsapp: false },
  },
  {
    id: 'quotation-accepted',
    label: 'Quotation Accepted',
    description: 'When a client accepts a quotation',
    icon: <CheckCircle className="h-4 w-4" />,
    channels: { email: true, push: true, sms: true, whatsapp: true },
  },
  {
    id: 'approval-request',
    label: 'Approval Requests',
    description: 'When someone requests your approval',
    icon: <AlertTriangle className="h-4 w-4" />,
    channels: { email: true, push: true, sms: true, whatsapp: false },
  },
  {
    id: 'system-updates',
    label: 'System Updates',
    description: 'Platform updates and maintenance notices',
    icon: <Shield className="h-4 w-4" />,
    channels: { email: true, push: false, sms: false, whatsapp: false },
  },
]

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(notificationTypes)
  const [frequency, setFrequency] = useState('instant')
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00')
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const toggleChannel = (typeId: string, channel: keyof NotificationTypeConfig['channels']) => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.id === typeId
          ? { ...p, channels: { ...p.channels, [channel]: !p.channels[channel] } }
          : p
      )
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              Notification Preferences
            </h1>
            <p className="text-muted-foreground">
              Customize how and when you receive notifications.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />
          {saved ? 'Saved!' : 'Save Preferences'}
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

      {/* Channel Preferences per Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Channel Preferences</CardTitle>
          <CardDescription>
            Configure notification channels for each notification type.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Notification Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Bell className="h-3 w-3" />
                      Push
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      SMS
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      WhatsApp
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {prefs.map((type) => (
                  <tr key={type.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          {type.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </td>
                    {(['email', 'push', 'sms', 'whatsapp'] as const).map((channel) => (
                      <td key={channel} className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={type.channels[channel]}
                            onCheckedChange={() => toggleChannel(type.id, channel)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
