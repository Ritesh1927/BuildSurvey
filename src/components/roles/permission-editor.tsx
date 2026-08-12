'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

export interface PermissionCatalogEntry {
  key: string
  resource: string
  action: string
  label: string
}

export interface PermissionCategory {
  category: string
  permissions: PermissionCatalogEntry[]
}

interface PermissionEditorProps {
  categories: PermissionCategory[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  disabled?: boolean
}

export function PermissionEditor({ categories, selected, onChange, disabled }: PermissionEditorProps) {
  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(key)
    else next.delete(key)
    onChange(next)
  }

  const toggleCategory = (category: PermissionCategory, checked: boolean) => {
    const next = new Set(selected)
    for (const p of category.permissions) {
      if (checked) next.add(p.key)
      else next.delete(p.key)
    }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const allChecked = category.permissions.every((p) => selected.has(p.key))
        const someChecked = !allChecked && category.permissions.some((p) => selected.has(p.key))
        return (
          <Card key={category.category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{category.category}</CardTitle>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleCategory(category, !allChecked)}
                  >
                    {allChecked ? 'Clear all' : someChecked ? 'Select rest' : 'Select all'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.permissions.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-start gap-2 rounded-md border border-transparent p-1.5 hover:border-border hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selected.has(p.key)}
                      onCheckedChange={(checked) => toggle(p.key, checked === true)}
                      disabled={disabled}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-tight">{p.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
