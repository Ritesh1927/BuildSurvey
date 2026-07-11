'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  GitBranch,
  Users,
  Calendar,
  Clock,
  Settings,
  CheckCheck,
  Eye,
  Trash2,
  Mail,
  AlertOctagon,
  Zap,
  Shield,
  DollarSign,
  Building2,
  HardHat,
  Camera,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type NotificationType = 'info' | 'success' | 'warning' | 'error'
type NotificationCategory = 'all' | 'unread' | 'mentions' | 'system'

interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory | 'general'
  title: string
  message: string
  timestamp: string
  read: boolean
  icon: React.ReactNode
  color: string
  bgColor: string
}

const typeConfig: Record<NotificationType, { color: string; bgColor: string }> = {
  info: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  success: { color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  warning: { color: 'text-amber-600', bgColor: 'bg-amber-50' },
  error: { color: 'text-red-600', bgColor: 'bg-red-50' },
}

function timeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const mockNotifications: Notification[] = [
  {
    id: 'NTF-001',
    type: 'warning',
    category: 'all',
    title: 'Approval Required',
    message: 'Your Site Survey Report for Sunrise Enclave Phase 2 is pending Manager Approval.',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    read: false,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'NTF-002',
    type: 'info',
    category: 'mentions',
    title: 'New Comment on Workflow',
    message: 'Raj Mehta commented on BOQ Review: "Please verify the steel quantity calculations."',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'NTF-003',
    type: 'success',
    category: 'all',
    title: 'Workflow Step Completed',
    message: 'Amit Kumar completed "Survey Submission" step in Site Survey Approval workflow.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    icon: <GitBranch className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'NTF-004',
    type: 'error',
    category: 'all',
    title: 'Deadline Approaching',
    message: 'Quotation #QT-2026-045 for Metro Residency is due for submission in 2 hours.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'NTF-005',
    type: 'info',
    category: 'mentions',
    title: 'You were mentioned',
    message: 'Priya Sharma mentioned you in Change Order #CO-012: "@Saurabh Please review the cost impact."',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    read: false,
    icon: <Users className="h-4 w-4" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'NTF-006',
    type: 'info',
    category: 'all',
    title: 'New Document Uploaded',
    message: 'Neha Gupta uploaded "Structural Drawing - Floor 12" to Phoenix Tower Commercial project.',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    read: false,
    icon: <FileText className="h-4 w-4" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'NTF-007',
    type: 'info',
    category: 'system',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance window on July 15, 2026 from 2:00 AM to 4:00 AM IST.',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    read: true,
    icon: <Settings className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: 'NTF-008',
    type: 'success',
    category: 'all',
    title: 'Request Approved',
    message: 'Your Material Purchase Order #PO-022 has been approved by Vikram Patel.',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    read: true,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'NTF-009',
    type: 'error',
    category: 'all',
    title: 'Workflow Rejected',
    message: 'Safety Compliance Review for Phoenix Tower was rejected by Safety Officer. Revision required.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    read: true,
    icon: <Shield className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'NTF-010',
    type: 'info',
    category: 'all',
    title: 'Meeting Reminder',
    message: 'Project review meeting for Greenfield Estates tomorrow at 10:00 AM.',
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    read: true,
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'NTF-011',
    type: 'info',
    category: 'mentions',
    title: 'Reply to your comment',
    message: 'Amit Kumar replied to your comment on BOQ Review: "Updated the quantities as suggested."',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    read: true,
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'NTF-012',
    type: 'warning',
    category: 'all',
    title: 'BOQ Revision Needed',
    message: 'Deepak Verma requested revision on BOQ for Metro Residency Tower B. Material rates need update.',
    timestamp: new Date(Date.now() - 60 * 3600000).toISOString(),
    read: true,
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'NTF-013',
    type: 'success',
    category: 'all',
    title: 'Survey Completed',
    message: 'Site survey SRV-039 for Greenfield Estates has been marked as completed by field team.',
    timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
    read: true,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'NTF-014',
    type: 'info',
    category: 'system',
    title: 'Backup Complete',
    message: 'Daily backup completed successfully. All project data is safe.',
    timestamp: new Date(Date.now() - 80 * 3600000).toISOString(),
    read: true,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: 'NTF-015',
    type: 'error',
    category: 'all',
    title: 'Task Overdue',
    message: 'BOQ Technical Review for Phoenix Tower is 1 day overdue. Please complete ASAP.',
    timestamp: new Date(Date.now() - 96 * 3600000).toISOString(),
    read: true,
    icon: <AlertOctagon className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'NTF-016',
    type: 'success',
    category: 'all',
    title: 'Quotation Accepted',
    message: 'Client has accepted Quotation #QT-2026-041 for Sunrise Enclave Phase 2. Proceed with contract.',
    timestamp: new Date(Date.now() - 120 * 3600000).toISOString(),
    read: true,
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'NTF-017',
    type: 'info',
    category: 'mentions',
    title: 'Team Update',
    message: 'Raj Mehta shared a project update: "Sunrise Enclave Phase 2 foundation work completed ahead of schedule."',
    timestamp: new Date(Date.now() - 140 * 3600000).toISOString(),
    read: true,
    icon: <Building2 className="h-4 w-4" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'NTF-018',
    type: 'warning',
    category: 'all',
    title: 'Material Price Alert',
    message: 'Steel prices have increased 8% since last BOQ. Consider updating rates for pending quotations.',
    timestamp: new Date(Date.now() - 160 * 3600000).toISOString(),
    read: true,
    icon: <BarChart3 className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'NTF-019',
    type: 'info',
    category: 'system',
    title: 'Security Update',
    message: 'Platform security update applied. Two-factor authentication is now recommended for all users.',
    timestamp: new Date(Date.now() - 180 * 3600000).toISOString(),
    read: true,
    icon: <Shield className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: 'NTF-020',
    type: 'success',
    category: 'all',
    title: 'Invoice Paid',
    message: 'Payment of INR 4,50,000 received for Invoice #INV-2026-078 from Metro Residency.',
    timestamp: new Date(Date.now() - 200 * 3600000).toISOString(),
    read: true,
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'NTF-021',
    type: 'info',
    category: 'all',
    title: 'Photo Upload Complete',
    message: 'Deepak Verma uploaded 47 site photos from Greenfield Estates to the media library.',
    timestamp: new Date(Date.now() - 240 * 3600000).toISOString(),
    read: true,
    icon: <Camera className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'NTF-022',
    type: 'warning',
    category: 'all',
    title: 'Weather Alert',
    message: 'Heavy rainfall expected in Mumbai region next 48 hours. Consider rescheduling outdoor surveys.',
    timestamp: new Date(Date.now() - 280 * 3600000).toISOString(),
    read: true,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'NTF-023',
    type: 'success',
    category: 'all',
    title: 'Safety Audit Passed',
    message: 'Phoenix Tower Commercial passed the quarterly safety compliance audit with zero violations.',
    timestamp: new Date(Date.now() - 320 * 3600000).toISOString(),
    read: true,
    icon: <HardHat className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'mentions') return n.category === 'mentions'
    if (activeTab === 'system') return n.category === 'system'
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with workflow activities and team updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/notifications/preferences">
              <Settings className="mr-1 h-4 w-4" />
              Preferences
            </Link>
          </Button>
        </div>
      </div>

      {unreadCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="mentions">
            Mentions ({notifications.filter((n) => n.category === 'mentions').length})
          </TabsTrigger>
          <TabsTrigger value="system">
            System ({notifications.filter((n) => n.category === 'system').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => {
                    const typeConf = typeConfig[notification.type]
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer',
                          !notification.read && 'bg-blue-50/50'
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                            notification.bgColor
                          )}
                        >
                          <span className={notification.color}>
                            {notification.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                'text-sm',
                                !notification.read ? 'font-semibold' : 'font-medium'
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(notification.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
