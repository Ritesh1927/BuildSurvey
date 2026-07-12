"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Save } from "lucide-react"

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

const departments = [
  "Administration",
  "Engineering",
  "Project Management",
  "Survey",
  "Finance",
  "External",
  "Human Resources",
  "IT & Infrastructure",
]

const roles = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "ENGINEER", label: "Engineer" },
  { value: "SURVEYOR", label: "Surveyor" },
  { value: "CLIENT", label: "Client" },
  { value: "ACCOUNTANT", label: "Accountant" },
]

export default function NewUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91",
    employeeId: "",
    department: "",
    designation: "",
    dateOfJoining: "",
    role: "",
    isActive: true,
    initialPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const digits = form.phone.replace(/^\+\d+/, "")
      if (digits.length < 6) newErrors.phone = "Phone number is too short"
    }
    if (!form.role) newErrors.role = "Role is required"
    if (!form.initialPassword.trim())
      newErrors.initialPassword = "Password is required"
    else if (form.initialPassword.length < 8)
      newErrors.initialPassword = "Password must be at least 8 characters"

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
          initialPassword: form.initialPassword,
          isActive: form.isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || "Failed to create user")
        return
      }

      router.push("/users")
    } catch (err) {
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
        title="Create New User"
        description="Add a new user to the platform with appropriate role and permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users", href: "/users" },
          { label: "New User" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic personal details of the user
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

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Work details and department assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      placeholder="EMP-XXX"
                      value={form.employeeId}
                      onChange={(e) => updateField("employeeId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={form.department}
                      onValueChange={(value) => updateField("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="e.g. Senior Civil Engineer"
                      value={form.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">Date of Joining</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={form.dateOfJoining}
                      onChange={(e) => updateField("dateOfJoining", e.target.value)}
                    />
                  </div>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.role}
                      onValueChange={(value) => updateField("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-destructive">{errors.role}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initialPassword">
                      Initial Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="initialPassword"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.initialPassword}
                      onChange={(e) => updateField("initialPassword", e.target.value)}
                      error={!!errors.initialPassword}
                    />
                    {errors.initialPassword && (
                      <p className="text-sm text-destructive">{errors.initialPassword}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {form.isActive
                        ? "User will be able to log in immediately"
                        : "User account will be created but disabled"}
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
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" type="button">
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </CardContent>
            </Card>

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
                      Creating User...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create User
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
