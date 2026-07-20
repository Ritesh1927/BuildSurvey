import { create } from 'zustand'
import type { BreadcrumbItem } from '@/types'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  breadcrumbs: BreadcrumbItem[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
  clearBreadcrumbs: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  breadcrumbs: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    set({ theme })
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
    set({ theme: newTheme })
  },

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  addBreadcrumb: (item) => set((state) => ({ breadcrumbs: [...state.breadcrumbs, item] })),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}))
