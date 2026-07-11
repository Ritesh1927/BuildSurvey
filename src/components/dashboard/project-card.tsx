"use client"

import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  MoreHorizontal,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    code: string
    clientName: string
    status: string
    type: string
    managerName: string
    managerInitials: string
    budget: number
    spent: number
    progress: number
    startDate: string
    endDate: string
    city: string
  }
  className?: string
}

const statusVariantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
  Planning: "info",
  "In Progress": "success",
  "On Hold": "warning",
  Completed: "secondary",
  Cancelled: "destructive",
}

const typeVariantMap: Record<string, "default" | "outline" | "secondary"> = {
  "Residential Tower": "default",
  "Commercial Complex": "default",
  "Infrastructure": "secondary",
  "Industrial": "outline",
  "Highway": "secondary",
  "Bridge": "outline",
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const router = useRouter()

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md hover:border-primary/20",
        className
      )}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold leading-none tracking-tight line-clamp-1">
              {project.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {project.code}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{project.clientName}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={statusVariantMap[project.status] || "secondary"}>
            {project.status}
          </Badge>
          <Badge variant={typeVariantMap[project.type] || "outline"}>
            {project.type}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-medium">{formatCurrency(project.budget)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{project.city}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {project.managerInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{project.managerName}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(project.endDate).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}
        </div>
      </CardFooter>
    </Card>
  )
}
