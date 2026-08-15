'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Lock } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showSuccess, showError } from '@/components/ui/toast'
import { PermissionEditor, type PermissionCategory } from '@/components/roles/permission-editor'

interface RoleDetail {
  id: string
  key: string
  name: string
  description: string | null
  isSystem: boolean
  permissionKeys: string[]
  userCount: number
}

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string

  const [role, setRole] = useState<RoleDetail | null>(null)
  const [categories, setCategories] = useState<PermissionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [roleRes, catalogRes] = await Promise.all([
        fetch(`/api/roles/${roleId}`),
        fetch('/api/permissions'),
      ])
      const roleData = await roleRes.json()
      const catalogData = await catalogRes.json()

      if (!roleRes.ok || !roleData.success) {
        setError(roleData.error || 'Failed to load role')
        return
      }
      if (catalogData.success) setCategories(catalogData.data)

      setRole(roleData.data)
      setName(roleData.data.name)
      setDescription(roleData.data.description || '')
      setSelected(new Set(roleData.data.permissionKeys))
    } catch {
      setError('Network error while loading role')
    } finally {
      setLoading(false)
    }
  }, [roleId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const isSuperAdmin = role?.key === 'SUPER_ADMIN'

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Role name cannot be empty')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          permissionKeys: Array.from(selected),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to save role')
        return
      }
      showSuccess('Role updated')
      router.push('/roles')
    } catch {
      showError('Network error while saving role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!role || !confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete role')
        return
      }
      showSuccess('Role deleted')
      router.push('/roles')
    } catch {
      showError('Network error while deleting role')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading role...</div>
  }

  if (error || !role) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Role not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/roles"><ArrowLeft className="mr-1 h-4 w-4" />Back to Roles</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={isSuperAdmin ? 'Always has every permission — not editable' : 'Edit this role’s details and permissions'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Roles & Permissions', href: '/roles' },
          { label: role.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            {!isSuperAdmin && (
              <>
                {!role.isSystem && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={role.userCount > 0}
                    title={role.userCount > 0 ? 'Reassign employees off this role before deleting it' : undefined}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        }
      />

      {isSuperAdmin && (
        <Card className="border-amber-300/60 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <Lock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">
              Super Admin always has full access to everything, including every permission added in the future.
              This can&apos;t be changed here — it&apos;s what guarantees at least one account can never be locked out.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Role Details</CardTitle>
            {role.isSystem && <Badge variant="secondary" className="text-[10px]">Built-in role</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSuperAdmin} />
            </div>
            <div className="space-y-2">
              <Label>Employees with this role</Label>
              <p className="pt-2 text-sm text-muted-foreground">{role.userCount}</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSuperAdmin} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Permissions</h2>
        <PermissionEditor categories={categories} selected={selected} onChange={setSelected} disabled={isSuperAdmin} />
      </div>
    </div>
  )
}
