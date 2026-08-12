'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Users,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  UserMinus,
  X,
} from 'lucide-react'

import { showSuccess, showError } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { ResetPasswordDialog } from '@/components/shared/reset-password-dialog'

interface DbUser {
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
}

interface RoleOption { id: string; key: string; name: string; isSystem: boolean }

// Only the 7 built-in roles get a distinct color - a custom role falls
// back to the default badge style rather than needing its own entry here.
const roleColorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  SUPER_ADMIN: 'destructive',
  ADMIN: 'info',
  MANAGER: 'warning',
  ENGINEER: 'success',
  SURVEYOR: 'secondary',
  CLIENT: 'outline',
  ACCOUNTANT: 'default',
}

export default function UsersPage() {
  const [users, setUsers] = useState<DbUser[]>([])
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkWorking, setBulkWorking] = useState(false)
  const [resetTarget, setResetTarget] = useState<DbUser | null>(null)
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
  const pageSize = 25

  useEffect(() => {
    fetch('/api/roles/assignable')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setRoleOptions(data.data)
      })
      .catch(() => {})
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(currentPage))
      params.set('limit', String(pageSize))

      const res = await fetch(`/api/users?${params.toString()}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
      setActiveCount(data.activeCount || 0)
      setInactiveCount(data.inactiveCount || 0)
    } catch {
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, roleFilter, statusFilter, currentPage])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  const totalPages = Math.ceil(total / pageSize)

  const hasActiveFilters = !!searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const handleExportSelected = () => {
    const rows = users.filter((u) => selectedUsers.includes(u.id))
    const headers = ["First Name", "Last Name", "Email", "Phone", "Role", "Status", "Created"]
    const csv = [
      headers,
      ...rows.map((u) => [u.firstName, u.lastName, u.email, u.phone || '', u.roleName, u.isActive ? 'Active' : 'Inactive', u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '']),
    ].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `employees-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showSuccess("Employee data exported as CSV")
  }

  const handleBulkDeactivate = async () => {
    if (!confirm(`Deactivate ${selectedUsers.length} employee(s)? They will no longer be able to sign in.`)) return
    setBulkWorking(true)
    try {
      const results = await Promise.all(
        selectedUsers.map((id) =>
          fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false }),
          }).then((res) => res.ok)
        )
      )
      const failed = results.filter((ok) => !ok).length
      if (failed > 0) {
        showError(`${failed} of ${selectedUsers.length} could not be deactivated`)
      } else {
        showSuccess(`${selectedUsers.length} employee(s) deactivated`)
      }
      setSelectedUsers([])
      fetchUsers()
    } finally {
      setBulkWorking(false)
    }
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedUsers(users.map((u) => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee accounts, roles, and access permissions"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Employees' }]}
        actions={
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Total Employees" value={total} color="info" />
        <StatCard icon={<UserCheck className="h-6 w-6" />} label="Active" value={activeCount} color="success" />
        <StatCard icon={<UserX className="h-6 w-6" />} label="Inactive" value={inactiveCount} color="danger" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <SearchInput
              placeholder="Search users..."
              className="w-full max-w-sm"
              value={searchQuery}
              onSearch={setSearchQuery}
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">{selectedUsers.length} selected</span>
          <Button variant="outline" size="sm" onClick={handleExportSelected}>
            <Download className="mr-2 h-3.5 w-3.5" />Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDeactivate} disabled={bulkWorking}>
            <UserMinus className="mr-2 h-3.5 w-3.5" />{bulkWorking ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </div>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            users.length > 0 && selectedUsers.length === users.length
                              ? true
                              : selectedUsers.length > 0
                                ? 'indeterminate'
                                : false
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked === true)}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/users/${user.id}`}
                            className="flex items-center gap-3 font-medium hover:text-primary transition-colors"
                          >
                            <UserAvatar
                              name={`${user.firstName} ${user.lastName}`}
                              image={user.avatar}
                              size="md"
                            />
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {user.phone || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={roleColorMap[user.roleKey] || 'default'}>
                              {user.roleName}
                            </Badge>
                            {user.secondaryRoleName && (
                              <Badge variant="outline" className="text-[10px]">+ {user.secondaryRoleName}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={user.isActive ? 'success' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}?edit=true`}>
                                  <Pencil className="mr-2 h-4 w-4" />Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setResetTarget(user)}>
                                <KeyRound className="mr-2 h-4 w-4" />Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={async () => {
                                if (!confirm(`Delete employee ${user.firstName} ${user.lastName}? This cannot be undone.`)) return
                                const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
                                const data = await res.json()
                                if (res.ok) {
                                  showSuccess('Employee deleted')
                                  fetchUsers()
                                } else {
                                  showError(data.error || 'Failed to delete employee')
                                }
                              }}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {resetTarget && (
        <ResetPasswordDialog
          userId={resetTarget.id}
          userName={`${resetTarget.firstName} ${resetTarget.lastName}`}
          open={!!resetTarget}
          onOpenChange={(open) => { if (!open) setResetTarget(null) }}
        />
      )}
    </div>
  )
}
