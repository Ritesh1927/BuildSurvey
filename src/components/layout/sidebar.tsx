'use client'

import { useCallback, createElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ChevronLeft,
  ChevronRight,
  HardHat,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, SIDEBAR_NAV_ITEMS } from '@/lib/constants'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { getIcon } from '@/components/layout/icon-map'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getIcon(name)
  if (!Icon) return null
  return createElement(Icon, { className })
}

function SidebarNavItem({
  href,
  label,
  icon,
  isActive,
  collapsed,
}: {
  href: string
  label: string
  icon: string
  isActive: boolean
  collapsed: boolean
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white/10 text-white shadow-sm'
          : 'text-slate-300 hover:bg-white/5 hover:text-white',
        collapsed && 'justify-center px-2',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-blue-500" />
      )}
      <NavIcon
        name={icon}
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors',
          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200',
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore()
  const { user, logout } = useAuthStore()

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/'
      return pathname.startsWith(href) && (pathname.length === href.length || pathname[href.length] === '/' || href.includes('['))
    },
    [pathname],
  )

  const collapsed = sidebarCollapsed

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'no-print fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center gap-3 border-b border-white/10 px-4', collapsed && 'justify-center px-2')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold leading-tight tracking-tight">{APP_NAME}</span>
              <span className="text-[10px] text-slate-400 leading-tight">Survey & Project Platform</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className={cn('space-y-1 px-2', collapsed && 'px-1.5')}>
            {SIDEBAR_NAV_ITEMS.map((group) => {
              const visibleItems = group.items.filter((item) => {
                if (!item.roles) return true
                if (!userRole) return false
                return item.roles.includes(userRole)
              })
              if (visibleItems.length === 0) return null
              return (
                <div key={group.group} className="mb-1">
                  {!collapsed && (
                    <div className="mb-1 flex items-center gap-2 px-3 pt-3 pb-1">
                      <NavIcon name={visibleItems[0]?.icon ?? ''} className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {group.group}
                      </span>
                    </div>
                  )}
                  {collapsed && <div className="pt-2 pb-1" />}
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => (
                      <SidebarNavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={isActiveRoute(item.href)}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="hidden lg:block border-t border-white/10 px-2 py-2">
          <button
            onClick={toggleSidebarCollapsed}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile Mini Card */}
        <div className="border-t border-white/10 p-2">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
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
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
