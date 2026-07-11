"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <label className="text-sm font-medium leading-none text-foreground">
            {label}
          </label>
        )}
        <Input
          ref={ref}
          type="date"
          className="w-full"
          {...props}
        />
      </div>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
export type { DatePickerProps }
