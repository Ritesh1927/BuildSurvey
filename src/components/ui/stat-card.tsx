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
