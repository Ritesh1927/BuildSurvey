import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down"
  color?: "default" | "success" | "warning" | "danger" | "info"
}

const colorMap = {
  default: "bg-gradient-to-br from-primary/25 to-primary/8 text-primary",
  success: "bg-gradient-to-br from-emerald-200/80 to-emerald-50 text-emerald-700 dark:from-emerald-900/50 dark:to-emerald-900/20 dark:text-emerald-400",
  warning: "bg-gradient-to-br from-amber-200/80 to-amber-50 text-amber-700 dark:from-amber-900/50 dark:to-amber-900/20 dark:text-amber-400",
  danger: "bg-gradient-to-br from-red-200/80 to-red-50 text-red-700 dark:from-red-900/50 dark:to-red-900/20 dark:text-red-400",
  info: "bg-gradient-to-br from-blue-200/80 to-blue-50 text-blue-700 dark:from-blue-900/50 dark:to-blue-900/20 dark:text-blue-400",
}

const barMap = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

function StatCard({
  icon,
  label,
  value,
  change,
  trend,
  color = "default",
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      <span className={cn("absolute inset-x-0 top-0 h-1", barMap[color])} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                colorMap[color]
              )}
            >
              {icon}
            </div>
          )}
        </div>
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
