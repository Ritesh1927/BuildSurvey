'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, IndianRupee } from 'lucide-react'
import { cn, formatDate, formatCurrency } from '@/lib/utils'

interface ProjectProgressItem {
  id: string
  name: string
  client: string
  progress: number
  status: string
  statusLabel: string
  statusColor: string
  daysRemaining: number
  budget: number
  endDate: string
}

const projects: ProjectProgressItem[] = [
  {
    id: 'PRJ-2026-001',
    name: 'Phoenix Tower – Structural Survey',
    client: 'Meridian Constructions',
    progress: 78,
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    statusColor: 'bg-emerald-100 text-emerald-800',
    daysRemaining: 12,
    budget: 1850000,
    endDate: '2026-07-23',
  },
  {
    id: 'PRJ-2026-004',
    name: 'Greenfield Estates – Phase 2',
    client: 'Greenfield Developers',
    progress: 45,
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    statusColor: 'bg-emerald-100 text-emerald-800',
    daysRemaining: 28,
    budget: 3200000,
    endDate: '2026-08-08',
  },
  {
    id: 'PRJ-2026-007',
    name: 'Cloudview Apartments – Interior',
    client: 'Skyline Builders',
    progress: 92,
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    statusColor: 'bg-emerald-100 text-emerald-800',
    daysRemaining: 4,
    budget: 980000,
    endDate: '2026-07-15',
  },
  {
    id: 'PRJ-2026-002',
    name: 'Metro Residency – Foundation',
    client: 'Metro Housing Ltd.',
    progress: 30,
    status: 'PLANNING',
    statusLabel: 'Planning',
    statusColor: 'bg-blue-100 text-blue-800',
    daysRemaining: 45,
    budget: 2750000,
    endDate: '2026-08-25',
  },
]

const progressColorClass = (progress: number) => {
  if (progress >= 80) return '[&>div]:bg-emerald-500'
  if (progress >= 50) return '[&>div]:bg-blue-500'
  if (progress >= 25) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

export function ProjectProgress() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <Card key={project.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-sm font-semibold leading-tight">
                  {project.name}
                </CardTitle>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{project.client}</span>
                </div>
              </div>
              <Badge className={cn('shrink-0 text-[10px]', project.statusColor)}>
                {project.statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <Progress
                value={project.progress}
                className={cn('h-2', progressColorClass(project.progress))}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{project.daysRemaining} days left</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                <span>{formatCurrency(project.budget)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
