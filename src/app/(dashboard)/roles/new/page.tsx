'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showSuccess, showError } from '@/components/ui/toast'
import { PermissionEditor, type PermissionCategory } from '@/components/roles/permission-editor'

export default function NewRolePage() {
  const router = useRouter()

  const [categories, setCategories] = useState<PermissionCategory[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/permissions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data)
      })
      .finally(() => setLoadingCatalog(false))
  }, [])

  const handleSave = async () => {
    if (!name.trim()) {
      showError('A role name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          permissionKeys: Array.from(selected),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to create role')
        return
      }
      showSuccess('Role created')
      router.push(`/roles/${data.data.id}`)
    } catch {
      showError('Network error while creating role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Role"
        description="Define a new role and choose exactly what it can access"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Roles & Permissions', href: '/roles' },
          { label: 'Add Role' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1 h-4 w-4" />
              {saving ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Role Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input placeholder="e.g., Regional Supervisor" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                rows={2}
                placeholder="What is this role for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Permissions</h2>
        {loadingCatalog ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading permission catalog...</div>
        ) : (
          <PermissionEditor categories={categories} selected={selected} onChange={setSelected} />
        )}
      </div>
    </div>
  )
}
