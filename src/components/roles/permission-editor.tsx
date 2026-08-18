'use client'

import { useMemo } from 'react'
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

// "Assignable" permissions are deliberately self-contained - they grant a
// role its own scoped view of items assigned to it without needing the
// resource's general View permission, so they're exempt from the
// View-gates-everything-else rule below.
function isViewPermission(p: PermissionCatalogEntry) {
  return p.action === 'read' || p.action.startsWith('read:')
}
function isExempt(p: PermissionCatalogEntry) {
  return p.action.includes('assignable')
}

export function PermissionEditor({ categories, selected, onChange, disabled }: PermissionEditorProps) {
  const allPermissions = useMemo(() => categories.flatMap((c) => c.permissions), [categories])

  const viewKeysByResource = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const p of allPermissions) {
      if (isViewPermission(p)) {
        if (!map.has(p.resource)) map.set(p.resource, [])
        map.get(p.resource)!.push(p.key)
      }
    }
    return map
  }, [allPermissions])

  const hasViewAccess = (resource: string, keys: Set<string>) =>
    (viewKeysByResource.get(resource) || []).some((k) => keys.has(k))

  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) {
      next.add(key)
    } else {
      next.delete(key)
      const perm = allPermissions.find((p) => p.key === key)
      // Unchecking the last View permission for a resource drops any
      // dependent Edit/Create/etc permissions along with it, so the
      // selection can never end up in a state the UI wouldn't let you
      // create by checking boxes in order.
      if (perm && isViewPermission(perm) && !hasViewAccess(perm.resource, next)) {
        for (const p of allPermissions) {
          if (p.resource === perm.resource && !isViewPermission(p) && !isExempt(p)) {
            next.delete(p.key)
          }
        }
      }
    }
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
                {category.permissions.map((p) => {
                  const needsView =
                    !isViewPermission(p) && !isExempt(p) && !selected.has(p.key) && !hasViewAccess(p.resource, selected)
                  const isDisabled = disabled || needsView
                  return (
                    <label
                      key={p.key}
                      title={needsView ? 'Requires the View permission for this section to be checked first' : undefined}
                      className={`flex items-start gap-2 rounded-md border border-transparent p-1.5 ${
                        needsView ? 'opacity-50' : 'hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <Checkbox
                        checked={selected.has(p.key)}
                        onCheckedChange={(checked) => toggle(p.key, checked === true)}
                        disabled={isDisabled}
                        className="mt-0.5"
                      />
                      <span className="text-sm leading-tight">{p.label}</span>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
