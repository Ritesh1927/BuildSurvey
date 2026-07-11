"use client"

import { useState } from "react"
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Settings,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { cn, getStatusColor } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { StatCard } from "@/components/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  permissions: string[]
  status: "active" | "revoked" | "expired"
  createdAt: string
  expiresAt: string
  lastUsed: string
  totalCalls: number
}

const apiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production Server",
    key: "csp_live_abc123def456ghi789jkl012mno345",
    maskedKey: "csp_live_abc1****345",
    permissions: ["read", "write", "projects", "surveys"],
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    expiresAt: "2027-01-15T10:00:00Z",
    lastUsed: "2026-07-11T08:23:00Z",
    totalCalls: 24589,
  },
  {
    id: "2",
    name: "Mobile App API",
    key: "csp_live_mno456pqr789stu012vwx345yza678",
    maskedKey: "csp_live_mno1****678",
    permissions: ["read", "surveys", "media"],
    status: "active",
    createdAt: "2026-03-20T14:30:00Z",
    expiresAt: "2026-09-20T14:30:00Z",
    lastUsed: "2026-07-11T09:15:00Z",
    totalCalls: 12340,
  },
  {
    id: "3",
    name: "Webhook Integration",
    key: "csp_test_abc789def012ghi345jkl678mno901",
    maskedKey: "csp_test_abc1****901",
    permissions: ["read", "webhooks"],
    status: "active",
    createdAt: "2026-05-01T08:00:00Z",
    expiresAt: "2027-05-01T08:00:00Z",
    lastUsed: "2026-07-10T22:45:00Z",
    totalCalls: 8956,
  },
  {
    id: "4",
    name: "Third-Party CRM",
    key: "csp_live_pqr123stu456vwx789yza012bcd345",
    maskedKey: "csp_live_pqr1****345",
    permissions: ["read", "clients", "leads"],
    status: "revoked",
    createdAt: "2026-02-10T12:00:00Z",
    expiresAt: "2026-08-10T12:00:00Z",
    lastUsed: "2026-06-28T16:30:00Z",
    totalCalls: 5621,
  },
  {
    id: "5",
    name: "Analytics Dashboard",
    key: "csp_live_vwx456yza789bcd012efg345hij678",
    maskedKey: "csp_live_vwx1****678",
    permissions: ["read", "analytics", "reports"],
    status: "active",
    createdAt: "2026-04-05T09:30:00Z",
    expiresAt: "2027-04-05T09:30:00Z",
    lastUsed: "2026-07-11T07:00:00Z",
    totalCalls: 18923,
  },
  {
    id: "6",
    name: "Development Testing",
    key: "csp_test_yza789bcd012efg345hij678klm901",
    maskedKey: "csp_test_yza1****901",
    permissions: ["read", "write", "admin"],
    status: "expired",
    createdAt: "2025-12-01T10:00:00Z",
    expiresAt: "2026-06-01T10:00:00Z",
    lastUsed: "2026-05-30T18:45:00Z",
    totalCalls: 34521,
  },
]

const usageChartData = [
  { day: "Mon", calls: 1240, errors: 12 },
  { day: "Tue", calls: 1580, errors: 8 },
  { day: "Wed", calls: 1420, errors: 15 },
  { day: "Thu", calls: 1890, errors: 22 },
  { day: "Fri", calls: 2100, errors: 10 },
  { day: "Sat", calls: 980, errors: 5 },
  { day: "Sun", calls: 650, errors: 3 },
]

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
}

const permissionsList = [
  { id: "read", label: "Read", description: "View data and resources" },
  { id: "write", label: "Write", description: "Create and update data" },
  { id: "projects", label: "Projects", description: "Access project data" },
  { id: "surveys", label: "Surveys", description: "Access survey data" },
  { id: "clients", label: "Clients", description: "Access client data" },
  { id: "leads", label: "Leads", description: "Access lead data" },
  { id: "media", label: "Media", description: "Upload and manage files" },
  { id: "reports", label: "Reports", description: "Generate and view reports" },
  { id: "analytics", label: "Analytics", description: "Access analytics data" },
  { id: "webhooks", label: "Webhooks", description: "Configure webhooks" },
  { id: "admin", label: "Admin", description: "Full administrative access" },
]

export default function ApiManagerPage() {
  const [keys, setKeys] = useState<ApiKey[]>(apiKeys)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"])
  const [newKeyExpiry, setNewKeyExpiry] = useState("12months")
  const [rateLimit, setRateLimit] = useState("1000")
  const [rateWindow, setRateWindow] = useState("1")

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleGenerateKey = () => {
    const newKey: ApiKey = {
      id: String(keys.length + 1),
      name: newKeyName,
      key: `csp_live_${Math.random().toString(36).substring(2, 38)}`,
      maskedKey: `csp_live_${Math.random().toString(36).substring(2, 6)}****${Math.random().toString(36).substring(32, 36)}`,
      permissions: newKeyPermissions,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() +
          (newKeyExpiry === "1month"
            ? 30
            : newKeyExpiry === "6months"
              ? 180
              : newKeyExpiry === "12months"
                ? 365
                : 730) *
            86400000
      ).toISOString(),
      lastUsed: "Never",
      totalCalls: 0,
    }
    setKeys([newKey, ...keys])
    setNewKeyName("")
    setNewKeyPermissions(["read"])
    setShowGenerateModal(false)
    setShowKeyModal(true)
  }

  const handleRevokeKey = (id: string) => {
    setKeys(
      keys.map((key) =>
        key.id === id ? { ...key, status: "revoked" as const } : key
      )
    )
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const totalCallsToday = keys.reduce((sum, k) => sum + k.totalCalls, 0)
  const successRate = 98.7
  const avgResponseTime = 142
  const errorRate = 1.3

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Manager"
        description="Manage API keys, monitor usage, and configure rate limiting"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "API Manager" },
        ]}
        actions={
          <Button onClick={() => setShowGenerateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate API Key
          </Button>
        }
      />

      {/* Usage Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Total Calls Today"
          value={totalCallsToday.toLocaleString()}
          change={12}
          trend="up"
          color="info"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Success Rate"
          value={`${successRate}%`}
          change={2}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Avg Response Time"
          value={`${avgResponseTime}ms`}
          change={-5}
          trend="down"
          color="success"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Error Rate"
          value={`${errorRate}%`}
          change={-8}
          trend="down"
          color="warning"
        />
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Usage (Last 7 Days)</CardTitle>
            <CardDescription>Total API calls and errors per day</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="API Calls"
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys and access tokens</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              API Docs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {revealedKeys[apiKey.id] ? apiKey.key : apiKey.maskedKey}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRevealKey(apiKey.id)}
                        >
                          {revealedKeys[apiKey.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-[10px]">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          apiKey.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : apiKey.status === "revoked"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {apiKey.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(apiKey.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(apiKey.expiresAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apiKey.lastUsed === "Never"
                        ? "Never"
                        : new Date(apiKey.lastUsed).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {apiKey.totalCalls.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopyKey(apiKey.key)}
                          title="Copy Key"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {apiKey.status === "active" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRevokeKey(apiKey.id)}
                            title="Revoke Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
          <CardDescription>Configure API rate limits to prevent abuse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Requests per Window</label>
              <Input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Window (Hours)</label>
              <Input
                type="number"
                value={rateWindow}
                onChange={(e) => setRateWindow(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Rate limit: <span className="font-medium text-foreground">{rateLimit} requests</span> per{" "}
              <span className="font-medium text-foreground">{rateWindow} hour(s)</span> per API key.
              Requests exceeding this limit will receive a <code>429 Too Many Requests</code> response.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generate API Key Modal */}
      <Modal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        title="Generate New API Key"
        description="Create a new API key with specific permissions"
        onConfirm={handleGenerateKey}
        onCancel={() => {
          setShowGenerateModal(false)
          setNewKeyName("")
          setNewKeyPermissions(["read"])
        }}
        confirmLabel="Generate Key"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Key Name</label>
            <Input
              placeholder="e.g., Production Server, Mobile App"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {permissionsList.map((perm) => (
                <div
                  key={perm.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors",
                    newKeyPermissions.includes(perm.id)
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  )}
                  onClick={() => {
                    setNewKeyPermissions((prev) =>
                      prev.includes(perm.id)
                        ? prev.filter((p) => p !== perm.id)
                        : [...prev, perm.id]
                    )
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newKeyPermissions.includes(perm.id)}
                    onChange={() => {}}
                    className="rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry</label>
            <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>

      {/* Key Generated Modal */}
      <Modal
        open={showKeyModal}
        onOpenChange={setShowKeyModal}
        title="API Key Generated"
        description="Copy and save your new API key. It won't be shown again."
        confirmLabel="Done"
        onConfirm={() => setShowKeyModal(false)}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                Save this key securely. It will not be displayed again.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your New API Key</label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={keys[0]?.key || ""}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyKey(keys[0]?.key || "")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
