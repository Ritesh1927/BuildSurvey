"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2, Eye, EyeOff } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/ui/page-header"
import { PhoneInput } from "@/components/ui/phone-input"

interface ClientOption { id: string; companyName: string }
interface RoleOption { id: string; key: string; name: string; isSystem: boolean }

export default function NewUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [clientList, setClientList] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91",
    role: "",
    secondaryRole: "",
    clientId: "",
    isActive: true,
    initialPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/clients?limit=200')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setClientList(data.data)
      })
      .catch(() => {})
      .finally(() => setClientsLoading(false))

    fetch('/api/roles/assignable')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setRoleOptions(data.data)
      })
      .catch(() => {})
      .finally(() => setRolesLoading(false))
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.firstName.trim()) newErrors.firstName = "First name is required"
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Please enter a valid email address"
    if (!form.phone || form.phone === "+91" || form.phone.length <= 3)
      newErrors.phone = "Phone number is required"
    else {
      const codes = ['+880','+971','+977','+94','+92','+61','+49','+33','+81','+86','+65','+91','+44','+1']
      const matchedCode = codes.find(c => form.phone.startsWith(c)) || '+91'
      const digits = form.phone.slice(matchedCode.length)
      if (digits.length < 6) newErrors.phone = "Phone number is too short"
    }
    if (!form.role) newErrors.role = "Role is required"
    if (form.role === "CLIENT" && !form.clientId) newErrors.clientId = "Select which client company this login belongs to"
    if (!form.initialPassword.trim())
      newErrors.initialPassword = "Password is required"
    else if (form.initialPassword.length < 8)
      newErrors.initialPassword = "Password must be at least 8 characters"
    if (form.confirmPassword !== form.initialPassword)
      newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          role: form.role,
          ...(form.role !== "CLIENT" && form.secondaryRole ? { secondaryRole: form.secondaryRole } : {}),
          initialPassword: form.initialPassword,
          isActive: form.isActive,
          ...(form.role === "CLIENT" ? { clientId: form.clientId } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "Failed to create employee")
        return
      }

      setShowSuccess(true)
      setTimeout(() => router.push("/users"), 2000)
    } catch {
      setSubmitError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Employee"
        description="Create a new employee account with the appropriate role and access"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Employees", href: "/users" },
          { label: "New Employee" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
        }
      />

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Employee created successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic personal details of the employee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      error={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      error={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@constructionsurvey.in"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(val) => updateField("phone", val)}
                    error={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Access */}
            <Card>
              <CardHeader>
                <CardTitle>Access & Security</CardTitle>
                <CardDescription>
                  Role assignment and account access settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) => updateField("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                          {role.name}{!role.isSystem && " (Custom)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>

                {form.role && form.role !== "CLIENT" && (
                  <div className="space-y-2">
                    <Label>Secondary Role (optional)</Label>
                    <Select
                      value={form.secondaryRole || "__none"}
                      onValueChange={(value) => updateField("secondaryRole", value === "__none" ? "" : value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {["ENGINEER", "SURVEYOR"].filter((r) => r !== form.role).map((r) => (
                          <SelectItem key={r} value={r}>{roleOptions.find((ro) => ro.key === r)?.name ?? r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">For someone who does both jobs - grants the other role&apos;s eligibility (site visits, survey work) on top of their primary role.</p>
                  </div>
                )}

                {form.role === "CLIENT" && (
                  <div className="space-y-2">
                    <Label>
                      Client Company <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.clientId}
                      onValueChange={(value) => updateField("clientId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select which client this login is for"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clientList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.clientId && (
                      <p className="text-sm text-destructive">{errors.clientId}</p>
                    )}
                    <p className="text-xs text-muted-foreground">A Client-role login is tied to one client company and only sees that company&apos;s data.</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="initialPassword">
                      Initial Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="initialPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={form.initialPassword}
                        onChange={(e) => updateField("initialPassword", e.target.value)}
                        error={!!errors.initialPassword}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.initialPassword && (
                      <p className="text-sm text-destructive">{errors.initialPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        error={!!errors.confirmPassword}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {form.isActive
                        ? "Employee will be able to log in immediately"
                        : "Account will be created but disabled"}
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => updateField("isActive", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {submitError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                    {submitError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating Employee...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Employee
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/users">Cancel</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
