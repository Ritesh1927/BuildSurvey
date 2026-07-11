"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  Users,
  Plus,
  Pencil,
  Trash2,
  Lock,
  ChevronRight,
  Key,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"

const mockRoles = [
  {
    id: "ROLE-001",
    name: "Super Admin",
    description: "Full platform access with all administrative privileges. Can manage users, roles, settings, and all modules.",
    color: "#EF4444",
    usersCount: 2,
    permissionsCount: 86,
    isSystem: true,
    permissions: {
      dashboard: ["View"],
      leadManagement: ["Create", "Read", "Update", "Delete"],
      clientManagement: ["Create", "Read", "Update", "Delete"],
      projectManagement: ["Create", "Read", "Update", "Delete", "Approve"],
      surveyManagement: ["Create", "Read", "Update", "Delete", "Approve", "Assign"],
      mediaManagement: ["Upload", "View", "Delete"],
      boq: ["Create", "Read", "Update", "Delete", "Approve"],
      quotation: ["Create", "Read", "Update", "Delete", "Approve", "Send"],
      workflow: ["Create", "Read", "Update", "Approve"],
      reports: ["Generate", "View", "Export"],
      analytics: ["View", "Export"],
      documents: ["Upload", "View", "Delete", "Share"],
      userManagement: ["Create", "Read", "Update", "Delete"],
      roleManagement: ["Create", "Read", "Update", "Delete"],
      settings: ["Read", "Update"],
      auditLog: ["View", "Export"],
    },
  },
  {
    id: "ROLE-002",
    name: "Admin",
    description: "Administrative access for managing users, projects, and most platform features.",
    color: "#3B82F6",
    usersCount: 3,
    permissionsCount: 72,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: ["Create", "Read", "Update", "Delete"],
      clientManagement: ["Create", "Read", "Update"],
      projectManagement: ["Create", "Read", "Update", "Delete"],
      surveyManagement: ["Create", "Read", "Update", "Delete", "Assign"],
      mediaManagement: ["Upload", "View", "Delete"],
      boq: ["Create", "Read", "Update", "Delete"],
      quotation: ["Create", "Read", "Update", "Delete", "Send"],
      workflow: ["Create", "Read", "Update"],
      reports: ["Generate", "View", "Export"],
      analytics: ["View"],
      documents: ["Upload", "View", "Delete"],
      userManagement: ["Create", "Read", "Update"],
      roleManagement: ["Read"],
      settings: ["Read"],
      auditLog: ["View"],
    },
  },
  {
    id: "ROLE-003",
    name: "Manager",
    description: "Project management access with team oversight and reporting capabilities.",
    color: "#F59E0B",
    usersCount: 4,
    permissionsCount: 56,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: ["Read", "Update"],
      clientManagement: ["Read", "Update"],
      projectManagement: ["Create", "Read", "Update"],
      surveyManagement: ["Create", "Read", "Update", "Assign"],
      mediaManagement: ["Upload", "View"],
      boq: ["Create", "Read", "Update"],
      quotation: ["Create", "Read", "Update"],
      workflow: ["Create", "Read", "Update", "Approve"],
      reports: ["Generate", "View"],
      analytics: ["View"],
      documents: ["Upload", "View"],
      userManagement: ["Read"],
      roleManagement: [],
      settings: ["Read"],
      auditLog: ["View"],
    },
  },
  {
    id: "ROLE-004",
    name: "Engineer",
    description: "Engineering team access for technical work, surveys, and documentation.",
    color: "#10B981",
    usersCount: 4,
    permissionsCount: 42,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: ["Read"],
      clientManagement: ["Read"],
      projectManagement: ["Read", "Update"],
      surveyManagement: ["Create", "Read", "Update"],
      mediaManagement: ["Upload", "View"],
      boq: ["Read", "Update"],
      quotation: ["Read"],
      workflow: ["Create", "Read"],
      reports: ["View"],
      analytics: [],
      documents: ["Upload", "View"],
      userManagement: [],
      roleManagement: [],
      settings: [],
      auditLog: [],
    },
  },
  {
    id: "ROLE-005",
    name: "Surveyor",
    description: "Field survey team access for data collection and site documentation.",
    color: "#8B5CF6",
    usersCount: 3,
    permissionsCount: 28,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: [],
      clientManagement: [],
      projectManagement: ["Read"],
      surveyManagement: ["Create", "Read", "Update"],
      mediaManagement: ["Upload", "View"],
      boq: ["Read"],
      quotation: [],
      workflow: ["Read"],
      reports: ["View"],
      analytics: [],
      documents: ["Upload", "View"],
      userManagement: [],
      roleManagement: [],
      settings: [],
      auditLog: [],
    },
  },
  {
    id: "ROLE-006",
    name: "Client",
    description: "External client access for viewing project progress and reports.",
    color: "#6B7280",
    usersCount: 2,
    permissionsCount: 15,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: [],
      clientManagement: [],
      projectManagement: ["Read"],
      surveyManagement: ["Read"],
      mediaManagement: ["View"],
      boq: ["Read"],
      quotation: ["Read"],
      workflow: ["Read"],
      reports: ["View"],
      analytics: ["View"],
      documents: ["View"],
      userManagement: [],
      roleManagement: [],
      settings: [],
      auditLog: [],
    },
  },
  {
    id: "ROLE-007",
    name: "Accountant",
    description: "Finance team access for billing, BOQ, quotations, and financial reports.",
    color: "#EC4899",
    usersCount: 2,
    permissionsCount: 32,
    isSystem: false,
    permissions: {
      dashboard: ["View"],
      leadManagement: [],
      clientManagement: ["Read"],
      projectManagement: ["Read"],
      surveyManagement: [],
      mediaManagement: [],
      boq: ["Create", "Read", "Update", "Approve"],
      quotation: ["Create", "Read", "Update", "Approve", "Send"],
      workflow: ["Read"],
      reports: ["Generate", "View", "Export"],
      analytics: ["View", "Export"],
      documents: ["View"],
      userManagement: [],
      roleManagement: [],
      settings: [],
      auditLog: ["View"],
    },
  },
]

export default function RolesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  })

  const handleCreateRole = () => {
    setCreateModalOpen(false)
    setNewRole({ name: "", description: "", color: "#3B82F6" })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Define and manage user roles with granular permission control"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Roles" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/roles/permissions">
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Permissions Matrix
              </Button>
            </Link>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockRoles.map((role) => (
          <Card key={role.id} className="relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ backgroundColor: role.color }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="mr-1 h-3 w-3" />
                        System
                      </Badge>
                    )}
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
                <Badge variant="info">{role.usersCount}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Permissions
                </span>
                <Badge variant="outline">{role.permissionsCount}</Badge>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Link href={`/roles/${role.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                {!role.isSystem && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Role Modal */}
      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create New Role"
        description="Define a new role with a name, description, and color."
        confirmLabel="Create Role"
        onConfirm={handleCreateRole}
        onCancel={() => setCreateModalOpen(false)}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              placeholder="e.g. Site Supervisor"
              value={newRole.name}
              onChange={(e) =>
                setNewRole((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Describe what this role can do..."
              rows={3}
              value={newRole.description}
              onChange={(e) =>
                setNewRole((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Role Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newRole.color}
                onChange={(e) =>
                  setNewRole((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-10 w-10 rounded-md border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{newRole.color}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
