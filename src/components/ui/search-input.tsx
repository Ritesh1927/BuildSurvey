"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch?: (value: string) => void
  debounceMs?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, debounceMs = 300, value: controlledValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
      controlledValue || ""
    )

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue)
      }
    }, [controlledValue])

    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (onSearch) {
          onSearch(String(internalValue))
        }
      }, debounceMs)

      return () => clearTimeout(timer)
    }, [internalValue, debounceMs, onSearch])

    const handleClear = () => {
      setInternalValue("")
      if (onSearch) {
        onSearch("")
      }
    }

    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          placeholder="Search..."
          className="pl-8 pr-8"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          {...props}
        />
        {internalValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
export type { SearchInputProps }
