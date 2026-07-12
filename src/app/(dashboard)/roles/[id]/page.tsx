"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Shield,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

const ROLE_META: Record<string, { name: string; description: string; color: string }> = {
  SUPER_ADMIN: { name: "Super Admin", description: "Full platform access with all administrative privileges.", color: "#EF4444" },
  ADMIN: { name: "Admin", description: "Administrative access for managing users, projects, and most platform features.", color: "#3B82F6" },
  MANAGER: { name: "Manager", description: "Project management access with team oversight and reporting capabilities.", color: "#F59E0B" },
  ENGINEER: { name: "Engineer", description: "Engineering team access for technical work, surveys, and documentation.", color: "#10B981" },
  SURVEYOR: { name: "Surveyor", description: "Field survey team access for data collection and site documentation.", color: "#8B5CF6" },
  CLIENT: { name: "Client", description: "External client access for viewing project progress and reports.", color: "#6B7280" },
  ACCOUNTANT: { name: "Accountant", description: "Finance team access for billing, BOQ, quotations, and financial reports.", color: "#EC4899" },
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
}

export default function RoleDetailPage() {
  const params = useParams()
  const roleKey = (params?.id as string) || "ENGINEER"
  const meta = ROLE_META[roleKey] || { name: roleKey, description: "", color: "#6B7280" }

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/users?role=${roleKey}&limit=1000`)
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        setUsers(data.users ?? [])
        setTotal(data.total ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [roleKey])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${meta.name} — Users`}
        description={`Users assigned to the ${meta.name} role`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Roles", href: "/roles" },
          { label: meta.name },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/roles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Role Name</p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="font-medium">{meta.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{meta.description}</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    Total Users
                  </span>
                  <Badge variant="info">{loading ? "—" : total}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Users with this Role</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Users className="mb-2 h-8 w-8 opacity-50" />
                  <p>No users assigned to this role</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Last Login
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="py-3">
                            <Badge variant={user.isActive ? "success" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString()
                              : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
