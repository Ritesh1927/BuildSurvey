"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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
  Upload,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { UserAvatar } from "@/components/shared/user-avatar"

const mockUsers = [
  {
    id: "USR-001",
    firstName: "Amit",
    lastName: "Sharma",
    email: "amit.sharma@constructionsurvey.in",
    phone: "+91 98765 43210",
    role: "Super Admin",
    status: "Active",
    department: "Administration",
    designation: "Chief Technology Officer",
    lastLogin: "2026-07-11 09:15 AM",
    projectsAssigned: 12,
    isOnline: true,
    employeeId: "EMP-001",
    dateOfJoining: "2021-03-15",
  },
  {
    id: "USR-002",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@constructionsurvey.in",
    phone: "+91 98123 45678",
    role: "Admin",
    status: "Active",
    department: "Operations",
    designation: "Operations Head",
    lastLogin: "2026-07-11 08:45 AM",
    projectsAssigned: 8,
    isOnline: true,
    employeeId: "EMP-002",
    dateOfJoining: "2021-06-20",
  },
  {
    id: "USR-003",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@constructionsurvey.in",
    phone: "+91 99876 54321",
    role: "Manager",
    status: "Active",
    department: "Project Management",
    designation: "Senior Project Manager",
    lastLogin: "2026-07-11 07:30 AM",
    projectsAssigned: 6,
    isOnline: true,
    employeeId: "EMP-003",
    dateOfJoining: "2022-01-10",
  },
  {
    id: "USR-004",
    firstName: "Sanjay",
    lastName: "Mehta",
    email: "sanjay.mehta@constructionsurvey.in",
    phone: "+91 98234 56789",
    role: "Engineer",
    status: "Active",
    department: "Engineering",
    designation: "Civil Engineer",
    lastLogin: "2026-07-10 05:20 PM",
    projectsAssigned: 5,
    isOnline: false,
    employeeId: "EMP-004",
    dateOfJoining: "2022-04-05",
  },
  {
    id: "USR-005",
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@constructionsurvey.in",
    phone: "+91 99456 78901",
    role: "Surveyor",
    status: "Active",
    department: "Survey",
    designation: "Lead Surveyor",
    lastLogin: "2026-07-11 06:00 AM",
    projectsAssigned: 4,
    isOnline: true,
    employeeId: "EMP-005",
    dateOfJoining: "2022-07-18",
  },
  {
    id: "USR-006",
    firstName: "Neha",
    lastName: "Agarwal",
    email: "neha.agarwal@constructionsurvey.in",
    phone: "+91 98345 67890",
    role: "Client",
    status: "Active",
    department: "External",
    designation: "Client Representative",
    lastLogin: "2026-07-09 02:15 PM",
    projectsAssigned: 3,
    isOnline: false,
    employeeId: "EMP-006",
    dateOfJoining: "2023-02-14",
  },
  {
    id: "USR-007",
    firstName: "Arjun",
    lastName: "Reddy",
    email: "arjun.reddy@constructionsurvey.in",
    phone: "+91 98765 12345",
    role: "Accountant",
    status: "Active",
    department: "Finance",
    designation: "Senior Accountant",
    lastLogin: "2026-07-11 10:00 AM",
    projectsAssigned: 2,
    isOnline: true,
    employeeId: "EMP-007",
    dateOfJoining: "2022-09-01",
  },
  {
    id: "USR-008",
    firstName: "Deepak",
    lastName: "Nair",
    email: "deepak.nair@constructionsurvey.in",
    phone: "+91 98123 98765",
    role: "Engineer",
    status: "Active",
    department: "Engineering",
    designation: "Structural Engineer",
    lastLogin: "2026-07-10 04:30 PM",
    projectsAssigned: 4,
    isOnline: false,
    employeeId: "EMP-008",
    dateOfJoining: "2023-01-20",
  },
  {
    id: "USR-009",
    firstName: "Sunita",
    lastName: "Verma",
    email: "sunita.verma@constructionsurvey.in",
    phone: "+91 99876 12345",
    role: "Manager",
    status: "Active",
    department: "Project Management",
    designation: "Project Manager",
    lastLogin: "2026-07-11 08:00 AM",
    projectsAssigned: 5,
    isOnline: true,
    employeeId: "EMP-009",
    dateOfJoining: "2023-03-15",
  },
  {
    id: "USR-010",
    firstName: "Manish",
    lastName: "Gupta",
    email: "manish.gupta@constructionsurvey.in",
    phone: "+91 98234 87654",
    role: "Surveyor",
    status: "Inactive",
    department: "Survey",
    designation: "Surveyor",
    lastLogin: "2026-06-15 11:30 AM",
    projectsAssigned: 0,
    isOnline: false,
    employeeId: "EMP-010",
    dateOfJoining: "2023-05-10",
  },
  {
    id: "USR-011",
    firstName: "Kavita",
    lastName: "Joshi",
    email: "kavita.joshi@constructionsurvey.in",
    phone: "+91 99123 45678",
    role: "Admin",
    status: "Active",
    department: "Administration",
    designation: "System Administrator",
    lastLogin: "2026-07-11 09:30 AM",
    projectsAssigned: 0,
    isOnline: true,
    employeeId: "EMP-011",
    dateOfJoining: "2022-11-25",
  },
  {
    id: "USR-012",
    firstName: "Ravi",
    lastName: "Shankar",
    email: "ravi.shankar@constructionsurvey.in",
    phone: "+91 98456 78901",
    role: "Client",
    status: "Active",
    department: "External",
    designation: "Project Director - Client",
    lastLogin: "2026-07-08 03:45 PM",
    projectsAssigned: 2,
    isOnline: false,
    employeeId: "EMP-012",
    dateOfJoining: "2023-07-01",
  },
  {
    id: "USR-013",
    firstName: "Anand",
    lastName: "Sharma",
    email: "anand.sharma@constructionsurvey.in",
    phone: "+91 11 23456789",
    role: "Engineer",
    status: "Active",
    department: "Engineering",
    designation: "MEP Engineer",
    lastLogin: "2026-07-11 07:45 AM",
    projectsAssigned: 3,
    isOnline: true,
    employeeId: "EMP-013",
    dateOfJoining: "2023-08-20",
  },
  {
    id: "USR-014",
    firstName: "Meera",
    lastName: "Rao",
    email: "meera.rao@constructionsurvey.in",
    phone: "+91 99456 23456",
    role: "Accountant",
    status: "Inactive",
    department: "Finance",
    designation: "Junior Accountant",
    lastLogin: "2026-05-20 10:15 AM",
    projectsAssigned: 0,
    isOnline: false,
    employeeId: "EMP-014",
    dateOfJoining: "2024-01-10",
  },
  {
    id: "USR-015",
    firstName: "Suresh",
    lastName: "Patel",
    email: "suresh.patel@constructionsurvey.in",
    phone: "+91 98765 43211",
    role: "Surveyor",
    status: "Active",
    department: "Survey",
    designation: "Junior Surveyor",
    lastLogin: "2026-07-11 06:30 AM",
    projectsAssigned: 3,
    isOnline: true,
    employeeId: "EMP-015",
    dateOfJoining: "2024-02-15",
  },
  {
    id: "USR-016",
    firstName: "Karan",
    lastName: "Bhatt",
    email: "karan.bhatt@constructionsurvey.in",
    phone: "+91 98345 12345",
    role: "Manager",
    status: "Active",
    department: "Project Management",
    designation: "Deputy Project Manager",
    lastLogin: "2026-07-10 06:00 PM",
    projectsAssigned: 4,
    isOnline: false,
    employeeId: "EMP-016",
    dateOfJoining: "2024-03-20",
  },
  {
    id: "USR-017",
    firstName: "Pooja",
    lastName: "Desai",
    email: "pooja.desai@constructionsurvey.in",
    phone: "+91 98765 54321",
    role: "Super Admin",
    status: "Active",
    department: "Administration",
    designation: "Chief Operating Officer",
    lastLogin: "2026-07-11 08:30 AM",
    projectsAssigned: 10,
    isOnline: true,
    employeeId: "EMP-017",
    dateOfJoining: "2021-01-05",
  },
]

const roles = ["Super Admin", "Admin", "Manager", "Engineer", "Surveyor", "Client", "Accountant"]
const statuses = ["Active", "Inactive"]

const roleColorMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  "Super Admin": "destructive",
  "Admin": "info",
  "Manager": "warning",
  "Engineer": "success",
  "Surveyor": "secondary",
  "Client": "outline",
  "Accountant": "default",
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const pageSize = 10

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`
      const matchesSearch =
        searchQuery === "" ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)

      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchQuery, roleFilter, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter((u) => u.status === "Active").length
  const inactiveUsers = mockUsers.filter((u) => u.status === "Inactive").length
  const onlineUsers = mockUsers.filter((u) => u.isOnline).length

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedUsers(paginatedUsers.map((u) => u.id))
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
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users" },
        ]}
        actions={
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Total Users"
          value={totalUsers}
          change={5}
          trend="up"
          color="info"
        />
        <StatCard
          icon={<UserCheck className="h-6 w-6" />}
          label="Active Users"
          value={activeUsers}
          change={3}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<UserX className="h-6 w-6" />}
          label="Inactive Users"
          value={inactiveUsers}
          change={-2}
          trend="down"
          color="danger"
        />
        <StatCard
          icon={<Wifi className="h-6 w-6" />}
          label="Online Now"
          value={onlineUsers}
          change={8}
          trend="up"
          color="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Users</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search users..."
                className="w-[250px]"
                onSearch={setSearchQuery}
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3.5 w-3.5" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <UserMinus className="mr-2 h-3.5 w-3.5" />
                Deactivate Selected
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedUsers.length > 0 &&
                      selectedUsers.length === paginatedUsers.length
                        ? true
                        : selectedUsers.length > 0
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-center">Projects</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, checked === true)
                      }
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
                        showOnline={user.isOnline}
                      />
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.designation}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm">{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={roleColorMap[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        user.status === "Active" ? "success" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="info">{user.projectsAssigned}</Badge>
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
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
