'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  X,
  Bell,
  BellOff,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { ScrollArea } from '@/components/ui/scroll-area'

type NotificationFilter = 'all' | 'unread' | 'mentions'

const NOTIFICATION_ICONS = {
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  SUCCESS: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  ERROR: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
} as const

const FILTER_OPTIONS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'mentions', label: 'Mentions' },
]

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationPanel() {
  const {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUIStore()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const filteredNotifications = useMemo(() => {
    let items = notifications.slice(0, 50)
    if (filter === 'unread') items = items.filter((n) => !n.isRead)
    if (filter === 'mentions') items = items.filter((n) => n.title.toLowerCase().includes('mention') || n.message.toLowerCase().includes('mention'))
    return items
  }, [notifications, filter])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead()
  }, [markAllNotificationsRead])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          notificationsOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setNotificationsOpen(false)}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Notifications"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px]',
          notificationsOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between border-b px-5 py-2.5">
          <div className="flex items-center gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  filter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <BellOff className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : filter === 'mentions'
                    ? 'No mentions yet'
                    : 'When you get notifications, they\'ll show up here'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const iconConfig = NOTIFICATION_ICONS[notification.type]
                const Icon = iconConfig.icon

                return (
                  <button
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                    className={cn(
                      'flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50',
                      !notification.isRead && 'bg-blue-50/30 dark:bg-blue-950/20',
                    )}
                  >
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconConfig.bg)}>
                      <Icon className={cn('h-4.5 w-4.5', iconConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium truncate', notification.isRead ? 'text-muted-foreground' : 'text-foreground')}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  )
}
