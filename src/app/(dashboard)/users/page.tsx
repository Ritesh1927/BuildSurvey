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
  Shield,
  UserCheck,
  UserX,
  Wifi,
  Trash2,
  KeyRound,
  UserMinus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface DbUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  avatar: string | null
  createdAt: string
  lastLoginAt: string | null
}

const roleDisplayNames: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  ENGINEER: 'Engineer',
  SURVEYOR: 'Surveyor',
  CLIENT: 'Client',
  ACCOUNTANT: 'Accountant',
}

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
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const pageSize = 25

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

  const activeUsers = users.filter((u) => u.isActive).length
  const inactiveUsers = users.filter((u) => !u.isActive).length

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
        title="User Management"
        description="Manage platform users, roles, and access permissions"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Users' }]}
        actions={
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Total Users" value={total} color="info" />
        <StatCard icon={<UserCheck className="h-6 w-6" />} label="Active Users" value={activeUsers} color="success" />
        <StatCard icon={<UserX className="h-6 w-6" />} label="Inactive Users" value={inactiveUsers} color="danger" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Users</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search users..."
                className="w-full sm:w-[250px]"
                onSearch={setSearchQuery}
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(roleDisplayNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
            </div>
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">{selectedUsers.length} selected</span>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3.5 w-3.5" />Export
              </Button>
              <Button variant="outline" size="sm">
                <UserMinus className="mr-2 h-3.5 w-3.5" />Deactivate
              </Button>
            </div>
          )}
        </CardHeader>
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
                              size="md"
                              showOnline={!!user.lastLoginAt}
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
                          <Badge variant={roleColorMap[user.role] || 'default'}>
                            {roleDisplayNames[user.role] || user.role}
                          </Badge>
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
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <KeyRound className="mr-2 h-4 w-4" />Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
                  <h3 className="mt-4 text-lg font-semibold">No users found</h3>
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
    </div>
  )
}
