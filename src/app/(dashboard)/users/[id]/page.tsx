"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  Mail,
  Phone,
  Edit,
  KeyRound,
  Save,
  X,
  FolderOpen,
  ClipboardCheck,
  Target,
} from "lucide-react"

import { formatDate, formatDateTime } from "@/lib/utils"
import { hasPermission } from "@/lib/permissions"
import { showSuccess, showError } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { UserAvatar } from "@/components/shared/user-avatar"
import { ResetPasswordDialog } from "@/components/shared/reset-password-dialog"

interface UserDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: string
  secondaryRole: string | null
  roleKey: string
  roleName: string
  secondaryRoleKey: string | null
  secondaryRoleName: string | null
  isActive: boolean
  avatar: string | null
  createdAt: string
  lastLoginAt: string | null
  counts?: { ledProjects: number; managedProjects: number; assignedSurveys: number }
}

interface RoleOption { id: string; key: string; name: string; isSystem: boolean }

// Only the 7 built-in roles get a distinct badge color - a custom role
// falls back to "secondary" rather than needing its own entry here.
const ROLE_VARIANT_MAP: Record<string, "success" | "warning" | "info" | "destructive" | "secondary" | "default"> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "info",
  MANAGER: "warning",
  ENGINEER: "success",
  SURVEYOR: "secondary",
  ACCOUNTANT: "default",
  CLIENT: "secondary",
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const actingRole = session?.user?.role
  const actingUserId = session?.user?.id
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'ENGINEER', secondaryRole: '', isActive: true })
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])

  const [resetOpen, setResetOpen] = useState(false)

  const canWrite = hasPermission(session?.user, 'users:write')
  const isSelf = actingUserId === userId

  useEffect(() => {
    fetch('/api/roles/assignable')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setRoleOptions(data.data)
      })
      .catch(() => {})
  }, [])

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${userId}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load user')
        return
      }
      setUser(data.user)
      setForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        role: data.user.roleKey,
        secondaryRole: data.user.secondaryRoleKey || '',
        isActive: data.user.isActive,
      })
    } catch {
      setError('Network error while loading user')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          ...(isSelf ? {} : { role: form.role, secondaryRole: form.secondaryRole || null }),
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showError(data.error || 'Failed to save user')
        return
      }
      showSuccess('User updated')
      setIsEditing(false)
      router.replace(`/users/${userId}`)
      fetchUser()
    } catch {
      showError('Network error while saving user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading user...</div>
  }

  if (error || !user) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'User not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/users"><ArrowLeft className="mr-1 h-4 w-4" />Back to Employees</Link>
        </Button>
      </div>
    )
  }

  const roleVariant = ROLE_VARIANT_MAP[user.roleKey] || 'secondary'
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={user.email}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Employees", href: "/users" },
          { label: fullName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/users"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {canWrite && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <UserAvatar name={fullName} image={user.avatar} size="lg" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <Badge variant={roleVariant}>{user.roleName}</Badge>
                {user.secondaryRoleName && (
                  <Badge variant="outline">+ {user.secondaryRoleName}</Badge>
                )}
                <Badge variant={user.isActive ? "success" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{user.phone}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing ? (
        <Card>
          <CardHeader><CardTitle>Edit Employee</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                  disabled={isSelf}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.key} value={r.key} disabled={r.key === 'SUPER_ADMIN' && actingRole !== 'SUPER_ADMIN'}>
                        {r.name}{!r.isSystem && ' (Custom)'}{r.key === 'SUPER_ADMIN' && actingRole !== 'SUPER_ADMIN' ? ' (Super Admin only)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSelf && <p className="text-xs text-muted-foreground">You cannot change your own role.</p>}
              </div>
              <div className="space-y-2">
                <Label>Secondary Role (optional)</Label>
                <Select
                  value={form.secondaryRole || '__none'}
                  onValueChange={(v) => setForm((f) => ({ ...f, secondaryRole: v === '__none' ? '' : v }))}
                  disabled={isSelf}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {(['ENGINEER', 'SURVEYOR'] as const).filter((r) => r !== form.role).map((r) => (
                      <SelectItem key={r} value={r}>{roleOptions.find((ro) => ro.key === r)?.name ?? r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For someone who does both jobs - grants the other role&apos;s eligibility (site visits, survey work) on top of their primary role.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Active</Label>
                  <p className="text-sm text-muted-foreground">Inactive employees cannot sign in.</p>
                </div>
                <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/users/${userId}`); setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.roleKey, secondaryRole: user.secondaryRoleKey || '', isActive: user.isActive }) }} disabled={saving}>
                <X className="mr-2 h-4 w-4" />Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {user.counts && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><FolderOpen className="h-5 w-5" /></div>
                    <div><p className="text-2xl font-bold">{user.counts.ledProjects}</p><p className="text-xs text-muted-foreground">Led Projects</p></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Target className="h-5 w-5" /></div>
                    <div><p className="text-2xl font-bold">{user.counts.managedProjects}</p><p className="text-xs text-muted-foreground">Managed Projects</p></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><ClipboardCheck className="h-5 w-5" /></div>
                    <div><p className="text-2xl font-bold">{user.counts.assignedSurveys}</p><p className="text-xs text-muted-foreground">Assigned Surveys</p></div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Role</span><span className="text-sm font-medium">{user.roleName}</span></div>
                {user.secondaryRoleName && (
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Secondary Role</span><span className="text-sm font-medium">{user.secondaryRoleName}</span></div>
                )}
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status</span><span className="text-sm font-medium">{user.isActive ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Member Since</span><span className="text-sm font-medium">{formatDate(user.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Last Login</span><span className="text-sm font-medium">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}</span></div>
              </CardContent>
            </Card>
          </div>

          {canWrite && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Password</CardTitle>
                <CardDescription>Reset this employee&apos;s account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setResetOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />Reset Password
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ResetPasswordDialog userId={userId} userName={fullName} open={resetOpen} onOpenChange={setResetOpen} />
    </div>
  )
}
