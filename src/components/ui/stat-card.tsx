import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  label: string
  value: string | number
  caption?: React.ReactNode
  change?: number
  trend?: "up" | "down"
  color?: "default" | "success" | "warning" | "danger" | "info"
}

const colorMap = {
  default: "bg-primary text-white shadow-sm shadow-primary/30",
  success: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
  warning: "bg-amber-600 text-white shadow-sm shadow-amber-600/30",
  danger: "bg-red-600 text-white shadow-sm shadow-red-600/30",
  info: "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
}

const barMap = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

function valueTextSize(value: string | number) {
  const length = String(value).length
  if (length <= 8) return "text-2xl sm:text-3xl"
  if (length <= 11) return "text-xl sm:text-2xl"
  if (length <= 14) return "text-lg sm:text-xl"
  if (length <= 17) return "text-base sm:text-lg"
  if (length <= 20) return "text-sm sm:text-base"
  return "text-xs sm:text-sm"
}

function StatCard({
  icon,
  label,
  value,
  caption,
  change,
  trend,
  color = "default",
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden transition-shadow hover:shadow-md", className)} {...props}>
      <span className={cn("absolute inset-x-0 top-0 h-1", barMap[color])} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn("truncate font-bold tracking-tight", valueTextSize(value))}>{value}</p>
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                colorMap[color]
              )}
            >
              {icon}
            </div>
          )}
        </div>
        {caption && (
          <p className="mt-2 truncate text-xs text-muted-foreground/80">{caption}</p>
        )}
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatCard }
export type { StatCardProps }
