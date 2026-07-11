'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useTheme } from '@/components/layout/providers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Breadcrumbs from '@/components/layout/breadcrumbs'

export default function Header() {
  const router = useRouter()
  const { setSidebarOpen, setNotificationsOpen, notifications } = useUIStore()
  const { user, logout } = useAuthStore()
  const { setTheme, resolvedTheme } = useTheme()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleLogout = useCallback(() => {
    logout()
    router.push('/login')
  }, [logout, router])

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center border-b border-border/80 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumbs className="hidden sm:flex" />
      </div>

      {/* Center: Search */}
      <div className="hidden md:block flex-shrink-0 px-4">
        <button
          onClick={() => {}}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-background"
        >
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search...</span>
          <kbd className="ml-2 hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
            {'\u2318'}K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        <button
          onClick={() => {}}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent ml-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? ''} />
                <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left xl:block">
                <p className="text-sm font-medium text-foreground leading-tight">{user?.name ?? 'Guest'}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {user?.role?.replace(/_/g, ' ') ?? 'Viewer'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? 'Guest User'}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email ?? ''}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
