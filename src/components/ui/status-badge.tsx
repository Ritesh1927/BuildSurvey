import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  active: { label: "Active", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  approved: { label: "Approved", variant: "success" },
  paid: { label: "Paid", variant: "success" },
  done: { label: "Done", variant: "success" },
  open: { label: "Open", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  "in-progress": { label: "In Progress", variant: "info" },
  in_review: { label: "In Review", variant: "info" },
  under_review: { label: "Under Review", variant: "info" },
  scheduled: { label: "Scheduled", variant: "info" },
  new: { label: "New", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  draft: { label: "Draft", variant: "secondary" },
  inactive: { label: "Inactive", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  archived: { label: "Archived", variant: "secondary" },
  closed: { label: "Closed", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
  overdue: { label: "Overdue", variant: "destructive" },
  on_hold: { label: "On Hold", variant: "warning" },
  "on-hold": { label: "On Hold", variant: "warning" },
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "info" },
  low: { label: "Low", variant: "secondary" },
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_")
  const config = statusConfig[normalizedStatus] || {
    label: status,
    variant: "secondary" as const,
  }

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeProps }
