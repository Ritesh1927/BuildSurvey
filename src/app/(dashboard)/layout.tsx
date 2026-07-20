'use client'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import MobileSidebar from '@/components/layout/mobile-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-[68px]',
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
