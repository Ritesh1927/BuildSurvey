"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Shield,
  Users,
  ChevronRight,
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

const ROLES = [
  { key: "SUPER_ADMIN", name: "Super Admin", description: "Full platform access with all administrative privileges.", color: "#EF4444" },
  { key: "ADMIN", name: "Admin", description: "Administrative access for managing users, projects, and most platform features.", color: "#3B82F6" },
  { key: "MANAGER", name: "Manager", description: "Project management access with team oversight and reporting capabilities.", color: "#F59E0B" },
  { key: "ENGINEER", name: "Engineer", description: "Engineering team access for technical work, surveys, and documentation.", color: "#10B981" },
  { key: "SURVEYOR", name: "Surveyor", description: "Field survey team access for data collection and site documentation.", color: "#8B5CF6" },
  { key: "CLIENT", name: "Client", description: "External client access for viewing project progress and reports.", color: "#6B7280" },
  { key: "ACCOUNTANT", name: "Accountant", description: "Finance team access for billing, BOQ, quotations, and financial reports.", color: "#EC4899" },
]

export default function RolesPage() {
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users?limit=1000")
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        const counts: Record<string, number> = {}
        ROLES.forEach((r) => (counts[r.key] = 0))
        for (const user of data.users ?? []) {
          if (counts[user.role] !== undefined) {
            counts[user.role]++
          }
        }
        setRoleCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="View user roles and their assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Roles" },
        ]}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role.key} className="relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ backgroundColor: role.color }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {role.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Users Assigned
                </span>
                <Badge variant="info">
                  {loading ? "—" : roleCounts[role.key] ?? 0}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Link href={`/roles/${role.key}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Users
                    <ChevronRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
