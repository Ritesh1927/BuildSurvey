'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Menu,
  Settings,
  LogOut,
  Moon,
  Sun,
  BookOpen,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
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
  const { data: session } = useSession()
  const { setSidebarOpen } = useUIStore()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const sessionUser = session?.user
  const userName = sessionUser?.name || 'Guest'
  const userEmail = sessionUser?.email || ''
  const userRole = sessionUser?.role?.replace(/_/g, ' ') || 'Viewer'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background px-4 sm:px-6">
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

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="mr-1 flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          aria-label="Toggle theme"
        >
          {mounted ? (
            resolvedTheme === 'dark' ? (
              <><Sun className="h-4 w-4 text-amber-500" />Light</>
            ) : (
              <><Moon className="h-4 w-4 text-primary" />Dark</>
            )
          ) : (
            <><Moon className="h-4 w-4" />Dark</>
          )}
        </button>

        {/* Help */}
        <button
          onClick={() => router.push('/help')}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="User Manual"
        >
          <BookOpen className="h-5 w-5" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent ml-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left xl:block">
                <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {userRole}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
