"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Shield,
  Users,
  Check,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader } from "@/components/ui/page-header"

interface Permission {
  module: string
  actions: string[]
}

const moduleGroups: Permission[] = [
  { module: "Dashboard", actions: ["View"] },
  { module: "Lead Management", actions: ["Create", "Read", "Update", "Delete"] },
  { module: "Client Management", actions: ["Create", "Read", "Update", "Delete"] },
  { module: "Project Management", actions: ["Create", "Read", "Update", "Delete", "Approve"] },
  { module: "Survey Management", actions: ["Create", "Read", "Update", "Delete", "Approve", "Assign"] },
  { module: "Media Management", actions: ["Upload", "View", "Delete"] },
  { module: "BOQ", actions: ["Create", "Read", "Update", "Delete", "Approve"] },
  { module: "Quotation", actions: ["Create", "Read", "Update", "Delete", "Approve", "Send"] },
  { module: "Workflow", actions: ["Create", "Read", "Update", "Approve"] },
  { module: "Reports", actions: ["Generate", "View", "Export"] },
  { module: "Analytics", actions: ["View", "Export"] },
  { module: "Documents", actions: ["Upload", "View", "Delete", "Share"] },
  { module: "User Management", actions: ["Create", "Read", "Update", "Delete"] },
  { module: "Role Management", actions: ["Create", "Read", "Update", "Delete"] },
  { module: "Settings", actions: ["Read", "Update"] },
  { module: "Audit Log", actions: ["View", "Export"] },
]

const rolesDb: Record<string, any> = {
  "ROLE-001": {
    id: "ROLE-001",
    name: "Super Admin",
    description: "Full platform access with all administrative privileges.",
    color: "#EF4444",
    usersCount: 2,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": ["Create", "Read", "Update", "Delete"],
      "Client Management": ["Create", "Read", "Update", "Delete"],
      "Project Management": ["Create", "Read", "Update", "Delete", "Approve"],
      "Survey Management": ["Create", "Read", "Update", "Delete", "Approve", "Assign"],
      "Media Management": ["Upload", "View", "Delete"],
      BOQ: ["Create", "Read", "Update", "Delete", "Approve"],
      Quotation: ["Create", "Read", "Update", "Delete", "Approve", "Send"],
      Workflow: ["Create", "Read", "Update", "Approve"],
      Reports: ["Generate", "View", "Export"],
      Analytics: ["View", "Export"],
      Documents: ["Upload", "View", "Delete", "Share"],
      "User Management": ["Create", "Read", "Update", "Delete"],
      "Role Management": ["Create", "Read", "Update", "Delete"],
      Settings: ["Read", "Update"],
      "Audit Log": ["View", "Export"],
    },
  },
  "ROLE-002": {
    id: "ROLE-002",
    name: "Admin",
    description: "Administrative access for managing users, projects, and most platform features.",
    color: "#3B82F6",
    usersCount: 3,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": ["Create", "Read", "Update", "Delete"],
      "Client Management": ["Create", "Read", "Update"],
      "Project Management": ["Create", "Read", "Update", "Delete"],
      "Survey Management": ["Create", "Read", "Update", "Delete", "Assign"],
      "Media Management": ["Upload", "View", "Delete"],
      BOQ: ["Create", "Read", "Update", "Delete"],
      Quotation: ["Create", "Read", "Update", "Delete", "Send"],
      Workflow: ["Create", "Read", "Update"],
      Reports: ["Generate", "View", "Export"],
      Analytics: ["View"],
      Documents: ["Upload", "View", "Delete"],
      "User Management": ["Create", "Read", "Update"],
      "Role Management": ["Read"],
      Settings: ["Read"],
      "Audit Log": ["View"],
    },
  },
  "ROLE-003": {
    id: "ROLE-003",
    name: "Manager",
    description: "Project management access with team oversight and reporting capabilities.",
    color: "#F59E0B",
    usersCount: 4,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": ["Read", "Update"],
      "Client Management": ["Read", "Update"],
      "Project Management": ["Create", "Read", "Update"],
      "Survey Management": ["Create", "Read", "Update", "Assign"],
      "Media Management": ["Upload", "View"],
      BOQ: ["Create", "Read", "Update"],
      Quotation: ["Create", "Read", "Update"],
      Workflow: ["Create", "Read", "Update", "Approve"],
      Reports: ["Generate", "View"],
      Analytics: ["View"],
      Documents: ["Upload", "View"],
      "User Management": ["Read"],
      "Role Management": [],
      Settings: ["Read"],
      "Audit Log": ["View"],
    },
  },
  "ROLE-004": {
    id: "ROLE-004",
    name: "Engineer",
    description: "Engineering team access for technical work, surveys, and documentation.",
    color: "#10B981",
    usersCount: 4,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": ["Read"],
      "Client Management": ["Read"],
      "Project Management": ["Read", "Update"],
      "Survey Management": ["Create", "Read", "Update"],
      "Media Management": ["Upload", "View"],
      BOQ: ["Read", "Update"],
      Quotation: ["Read"],
      Workflow: ["Create", "Read"],
      Reports: ["View"],
      Analytics: [],
      Documents: ["Upload", "View"],
      "User Management": [],
      "Role Management": [],
      Settings: [],
      "Audit Log": [],
    },
  },
  "ROLE-005": {
    id: "ROLE-005",
    name: "Surveyor",
    description: "Field survey team access for data collection and site documentation.",
    color: "#8B5CF6",
    usersCount: 3,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": [],
      "Client Management": [],
      "Project Management": ["Read"],
      "Survey Management": ["Create", "Read", "Update"],
      "Media Management": ["Upload", "View"],
      BOQ: ["Read"],
      Quotation: [],
      Workflow: ["Read"],
      Reports: ["View"],
      Analytics: [],
      Documents: ["Upload", "View"],
      "User Management": [],
      "Role Management": [],
      Settings: [],
      "Audit Log": [],
    },
  },
  "ROLE-006": {
    id: "ROLE-006",
    name: "Client",
    description: "External client access for viewing project progress and reports.",
    color: "#6B7280",
    usersCount: 2,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": [],
      "Client Management": [],
      "Project Management": ["Read"],
      "Survey Management": ["Read"],
      "Media Management": ["View"],
      BOQ: ["Read"],
      Quotation: ["Read"],
      Workflow: ["Read"],
      Reports: ["View"],
      Analytics: ["View"],
      Documents: ["View"],
      "User Management": [],
      "Role Management": [],
      Settings: [],
      "Audit Log": [],
    },
  },
  "ROLE-007": {
    id: "ROLE-007",
    name: "Accountant",
    description: "Finance team access for billing, BOQ, quotations, and financial reports.",
    color: "#EC4899",
    usersCount: 2,
    permissions: {
      Dashboard: ["View"],
      "Lead Management": [],
      "Client Management": ["Read"],
      "Project Management": ["Read"],
      "Survey Management": [],
      "Media Management": [],
      BOQ: ["Create", "Read", "Update", "Approve"],
      Quotation: ["Create", "Read", "Update", "Approve", "Send"],
      Workflow: ["Read"],
      Reports: ["Generate", "View", "Export"],
      Analytics: ["View", "Export"],
      Documents: ["View"],
      "User Management": [],
      "Role Management": [],
      Settings: [],
      "Audit Log": ["View"],
    },
  },
}

export default function RoleDetailPage() {
  const params = useParams()
  const roleId = (params?.id as string) || "ROLE-001"
  const role = rolesDb[roleId] || rolesDb["ROLE-001"]

  const [roleName, setRoleName] = useState(role.name)
  const [roleDescription, setRoleDescription] = useState(role.description)
  const [roleColor, setRoleColor] = useState(role.color)
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {}
      moduleGroups.forEach((group) => {
        initial[group.module] = role.permissions?.[group.module] || []
      })
      return initial
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[module] || []
      if (current.includes(action)) {
        return { ...prev, [module]: current.filter((a) => a !== action) }
      } else {
        return { ...prev, [module]: [...current, action] }
      }
    })
  }

  const toggleModuleAll = (module: string, actions: string[]) => {
    setPermissions((prev) => {
      const current = prev[module] || []
      if (current.length === actions.length) {
        return { ...prev, [module]: [] }
      } else {
        return { ...prev, [module]: [...actions] }
      }
    })
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500)
  }

  const totalPermissions = Object.values(permissions).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Role: ${roleName}`}
        description="Configure role details and permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Roles", href: "/roles" },
          { label: roleName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Role Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={roleColor}
                    onChange={(e) => setRoleColor(e.target.value)}
                    className="h-10 w-10 rounded-md border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">{roleColor}</span>
                </div>
              </div>
              <div className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users Assigned</span>
                  <Badge variant="info">{role.usersCount}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Permissions</span>
                  <Badge variant="success">{totalPermissions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>
                Toggle individual permissions or select all for each module group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleGroups.map((group) => {
                  const groupPerms = permissions[group.module] || []
                  const allSelected =
                    groupPerms.length === group.actions.length &&
                    group.actions.length > 0

                  return (
                    <div
                      key={group.module}
                      className="rounded-lg border overflow-hidden"
                    >
                      <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {group.module}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {groupPerms.length}/{group.actions.length}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            toggleModuleAll(group.module, group.actions)
                          }
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
                        {group.actions.map((action) => {
                          const isChecked = groupPerms.includes(action)
                          return (
                            <label
                              key={action}
                              className={cn(
                                "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
                                isChecked
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  togglePermission(group.module, action)
                                }
                              />
                              <span className="text-sm">{action}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
