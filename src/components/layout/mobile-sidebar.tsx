'use client'

import { useEffect, useCallback, createElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  X,
  HardHat,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, SIDEBAR_NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { getIcon } from '@/components/layout/icon-map'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getIcon(name)
  if (!Icon) return null
  return createElement(Icon, { className })
}

function MobileNavItem({
  href,
  label,
  icon,
  isActive,
  onClick,
}: {
  href: string
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-300 hover:bg-white/5 hover:text-white',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-500" />
      )}
      <NavIcon
        name={icon}
        className={cn(
          'h-4.5 w-4.5 shrink-0',
          isActive ? 'text-blue-400' : 'text-slate-400',
        )}
      />
      <span>{label}</span>
    </Link>
  )
}

export default function MobileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as string | undefined
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/'
      return pathname.startsWith(href) && (pathname.length === href.length || pathname[href.length] === '/')
    },
    [pathname],
  )

  const handleClose = useCallback(() => setSidebarOpen(false), [setSidebarOpen])

  useEffect(() => {
    handleClose()
  }, [pathname, handleClose])

  useEffect(() => {
    if (!sidebarOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, handleClose])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
              <span className="text-[10px] text-slate-400">Survey & Project Platform</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-1 px-3">
            {SIDEBAR_NAV_ITEMS.map((group) => {
              const visibleItems = group.items.filter((item) => {
                if (!item.roles) return true
                if (!userRole) return false
                return (item.roles as readonly string[]).includes(userRole)
              })
              if (visibleItems.length === 0) return null
              return (
                <div key={group.group} className="mb-1">
                  <div className="mb-1 flex items-center gap-2 px-3 pt-3 pb-1">
                    <NavIcon name={visibleItems[0]?.icon ?? ''} className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.group}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => (
                      <MobileNavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={isActiveRoute(item.href)}
                        onClick={handleClose}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Card */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? ''} />
              <AvatarFallback className="bg-blue-600 text-xs font-semibold">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-white">
                {user?.name ?? 'Guest User'}
              </span>
              <span className="truncate text-[11px] text-slate-400">
                {user?.role?.replace(/_/g, ' ') ?? 'Viewer'}
              </span>
            </div>
            <button
              onClick={logout}
              className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
