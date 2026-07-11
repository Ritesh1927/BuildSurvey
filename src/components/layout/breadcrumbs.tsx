'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  leads: 'Leads',
  clients: 'Clients',
  contacts: 'Contacts',
  proposals: 'Proposals',
  contracts: 'Contracts',
  'follow-ups': 'Follow-ups',
  projects: 'Projects',
  tasks: 'Tasks',
  milestones: 'Milestones',
  team: 'Team',
  calendar: 'Calendar',
  surveys: 'Surveys',
  'survey-templates': 'Survey Templates',
  checklists: 'Checklists',
  'site-photos': 'Site Photos',
  measurements: 'Measurements',
  'quality-control': 'Quality Control',
  documents: 'Documents',
  media: 'Media',
  'floor-plans': 'Floor Plans',
  panoramic: '360\u00b0 Views',
  drawings: 'Drawings',
  invoices: 'Invoices',
  payments: 'Payments',
  expenses: 'Expenses',
  budgets: 'Budgets',
  reports: 'Reports',
  vendors: 'Vendors',
  workflows: 'Workflows',
  approvals: 'Approvals',
  inventory: 'Inventory',
  procurement: 'Procurement',
  safety: 'Safety',
  messages: 'Messages',
  announcements: 'Announcements',
  'site-diary': 'Site Diary',
  admin: 'Administration',
  users: 'Users',
  roles: 'Roles & Permissions',
  settings: 'Settings',
  integrations: 'Integrations',
  ai: 'AI Assistant',
  help: 'User Manual',
  predictions: 'Predictions',
  export: 'Export',
  custom: 'Custom Reports',
  daily: 'Daily Reports',
  weekly: 'Weekly Reports',
  id: 'Details',
}

interface BreadcrumbsProps {
  className?: string
}

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname()

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return []

    const items: { label: string; href: string; isLast: boolean }[] = []
    let cumulativePath = ''

    segments.forEach((segment, index) => {
      cumulativePath += `/${segment}`
      const isLast = index === segments.length - 1
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      items.push({
        label,
        href: cumulativePath,
        isLast,
      })
    })

    return items
  }, [pathname])

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
