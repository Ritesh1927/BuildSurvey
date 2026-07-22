import { create } from 'zustand'
import type { BreadcrumbItem } from '@/types'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  breadcrumbs: BreadcrumbItem[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
  clearBreadcrumbs: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  breadcrumbs: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  addBreadcrumb: (item) => set((state) => ({ breadcrumbs: [...state.breadcrumbs, item] })),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}))
