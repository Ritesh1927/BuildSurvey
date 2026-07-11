'use client'

import {
  FileText,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Upload,
  AlertTriangle,
  Calendar,
  DollarSign,
  ClipboardList,
  Settings,
  Eye,
  Trash2,
} from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  user: { firstName: string; lastName: string }
  timestamp: string
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  className?: string
}

const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
  project_created: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  project_completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  comment: { icon: MessageSquare, color: 'bg-violet-100 text-violet-600' },
  member_added: { icon: UserPlus, color: 'bg-teal-100 text-teal-600' },
  file_uploaded: { icon: Upload, color: 'bg-amber-100 text-amber-600' },
  survey_scheduled: { icon: Calendar, color: 'bg-blue-100 text-blue-600' },
  survey_completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  payment_received: { icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  invoice_created: { icon: FileText, color: 'bg-orange-100 text-orange-600' },
  task_completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  alert: { icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  settings_changed: { icon: Settings, color: 'bg-gray-100 text-gray-600' },
  document_viewed: { icon: Eye, color: 'bg-blue-100 text-blue-600' },
  document_deleted: { icon: Trash2, color: 'bg-red-100 text-red-600' },
  proposal_sent: { icon: Send, color: 'bg-violet-100 text-violet-600' },
  lead_created: { icon: UserPlus, color: 'bg-blue-100 text-blue-600' },
  lead_converted: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  checklist: { icon: ClipboardList, color: 'bg-teal-100 text-teal-600' },
}

function Send({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

function groupByDate(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  const grouped: Record<string, ActivityItem[]> = {}
  for (const activity of activities) {
    const date = new Date(activity.timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(activity)
  }
  return grouped
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  const grouped = groupByDate(activities)

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {date}
          </p>
          <div className="relative ml-3 border-l-2 border-muted pl-6">
            {items.map((activity, index) => {
              const { icon: Icon, color } =
                iconMap[activity.type] || iconMap.project_created

              return (
                <div key={activity.id} className="relative mb-6 last:mb-0">
                  <div
                    className={cn(
                      'absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-background',
                      color,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-muted text-[10px] font-medium">
                          {getInitials(
                            activity.user.firstName,
                            activity.user.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.firstName} {activity.user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
