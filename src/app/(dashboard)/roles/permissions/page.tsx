"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Printer,
  Shield,
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
import { PageHeader } from "@/components/ui/page-header"

const roles = [
  { id: "ROLE-001", name: "Super Admin", color: "#EF4444" },
  { id: "ROLE-002", name: "Admin", color: "#3B82F6" },
  { id: "ROLE-003", name: "Manager", color: "#F59E0B" },
  { id: "ROLE-004", name: "Engineer", color: "#10B981" },
  { id: "ROLE-005", name: "Surveyor", color: "#8B5CF6" },
  { id: "ROLE-006", name: "Client", color: "#6B7280" },
  { id: "ROLE-007", name: "Accountant", color: "#EC4899" },
]

const moduleGroups = [
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

const permissionMatrix: Record<string, Record<string, string[]>> = {
  "Super Admin": {
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
  Admin: {
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
  Manager: {
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
  Engineer: {
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
  Surveyor: {
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
  Client: {
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
  Accountant: {
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
}

export default function PermissionsPage() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const handleExport = () => {
    const rows: string[] = []
    rows.push(["Module", "Permission", ...roles.map((r) => r.name)].join(","))
    moduleGroups.forEach((group) => {
      group.actions.forEach((action) => {
        const row = [
          group.module,
          action,
          ...roles.map((role) => {
            const perms = permissionMatrix[role.name] || {}
            const modulePerms = perms[group.module] || []
            return modulePerms.includes(action) ? "Yes" : "No"
          }),
        ]
        rows.push(row.join(","))
      })
    })
    const csv = rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "permissions-matrix.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions Matrix"
        description="Global view of all role permissions across the platform"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Roles", href: "/roles" },
          { label: "Permissions Matrix" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Platform Permissions Overview
          </CardTitle>
          <CardDescription>
            {moduleGroups.length} modules | {roles.length} roles |{" "}
            {moduleGroups.reduce((sum, g) => sum + g.actions.length, 0)} unique
            permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-background border-b-2 border-r p-3 text-left text-sm font-semibold min-w-[180px]">
                  Module / Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="border-b-2 border-r p-3 text-center text-sm font-semibold min-w-[100px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span>{role.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moduleGroups.map((group) => {
                const isExpanded = expandedModule === group.module
                return (
                  <>
                    <tr
                      key={`${group.module}-header`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedModule(
                          expandedModule === group.module ? null : group.module
                        )
                      }
                    >
                      <td className="sticky left-0 z-10 bg-background border-b border-r p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          >
                            ▶
                          </span>
                          <span className="font-medium">{group.module}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {group.actions.length}
                          </Badge>
                        </div>
                      </td>
                      {roles.map((role) => {
                        const perms = permissionMatrix[role.name] || {}
                        const modulePerms = perms[group.module] || []
                        const count = modulePerms.length
                        const total = group.actions.length
                        return (
                          <td
                            key={role.id}
                            className="border-b border-r p-3 text-center"
                          >
                            <Badge
                              variant={
                                count === total
                                  ? "success"
                                  : count > 0
                                    ? "warning"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {count}/{total}
                            </Badge>
                          </td>
                        )
                      })}
                    </tr>
                    {isExpanded &&
                      group.actions.map((action) => (
                        <tr
                          key={`${group.module}-${action}`}
                          className="hover:bg-muted/30"
                        >
                          <td className="sticky left-0 z-10 bg-background border-b border-r p-3 pl-10">
                            <span className="text-sm text-muted-foreground">
                              {action}
                            </span>
                          </td>
                          {roles.map((role) => {
                            const perms = permissionMatrix[role.name] || {}
                            const modulePerms = perms[group.module] || []
                            const hasPermission = modulePerms.includes(action)
                            return (
                              <td
                                key={role.id}
                                className="border-b border-r p-3 text-center"
                              >
                                {hasPermission ? (
                                  <div className="flex items-center justify-center">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                                      <X className="h-3 w-3 text-muted-foreground/50" />
                                    </div>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
