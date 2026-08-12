'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Lock, Plus, Pencil, Trash2, MoreHorizontal, Eye, ShieldCheck } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/ui/stat-card'
import { showSuccess, showError } from '@/components/ui/toast'

interface RoleRow {
  id: string
  key: string
  name: string
  description: string | null
  isSystem: boolean
  permissionKeys: string[]
  userCount: number
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load roles')
        return
      }
      setRoles(data.data)
    } catch {
      setError('Network error while loading roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleDelete = async (role: RoleRow) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete role')
        return
      }
      showSuccess('Role deleted')
      setRoles((prev) => prev.filter((r) => r.id !== role.id))
    } catch {
      showError('Network error while deleting role')
    }
  }

  const customCount = roles.filter((r) => !r.isSystem).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Control what each role can see and do across the app"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Settings', href: '/settings' },
          { label: 'Roles & Permissions' },
        ]}
        actions={
          <Link href="/roles/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ShieldCheck className="h-6 w-6" />} label="Total Roles" value={roles.length} color="info" />
        <StatCard icon={<Lock className="h-6 w-6" />} label="Built-in Roles" value={roles.length - customCount} color="default" />
        <StatCard icon={<Pencil className="h-6 w-6" />} label="Custom Roles" value={customCount} color="success" />
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading roles...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Permissions</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Link href={`/roles/${role.id}`} className="font-medium hover:text-primary transition-colors">
                        {role.name}
                      </Link>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="secondary" className="text-[10px]">Built-in</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 dark:text-emerald-400">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="info">{role.permissionKeys.length}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{role.userCount}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/roles/${role.id}`}>
                              {role.key === 'SUPER_ADMIN' ? (
                                <><Eye className="mr-2 h-4 w-4" />View Permissions</>
                              ) : (
                                <><Pencil className="mr-2 h-4 w-4" />Edit Permissions</>
                              )}
                            </Link>
                          </DropdownMenuItem>
                          {!role.isSystem && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(role)}
                                disabled={role.userCount > 0}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {role.userCount > 0 ? 'Delete (reassign employees first)' : 'Delete'}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
