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
  "Super Admin",
  "Admin",
  "Manager",
  "Engineer",
  "Surveyor",
  "Client",
  "Accountant",
]

export default function NewUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
      newErrors.email = "Invalid email format"
    if (!form.phone.trim()) newErrors.phone = "Phone is required"
    if (!form.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!form.department) newErrors.department = "Department is required"
    if (!form.designation.trim()) newErrors.designation = "Designation is required"
    if (!form.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required"
    if (!form.role) newErrors.role = "Role is required"
    if (!form.initialPassword.trim())
      newErrors.initialPassword = "Initial password is required"
    else if (form.initialPassword.length < 8)
      newErrors.initialPassword = "Password must be at least 8 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/users")
    }, 1500)
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
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
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
                    <Label htmlFor="employeeId">
                      Employee ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="employeeId"
                      placeholder="EMP-XXX"
                      value={form.employeeId}
                      onChange={(e) => updateField("employeeId", e.target.value)}
                      error={!!errors.employeeId}
                    />
                    {errors.employeeId && (
                      <p className="text-sm text-destructive">{errors.employeeId}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Department <span className="text-destructive">*</span>
                    </Label>
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
                    {errors.department && (
                      <p className="text-sm text-destructive">{errors.department}</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="designation">
                      Designation <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="designation"
                      placeholder="e.g. Senior Civil Engineer"
                      value={form.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                      error={!!errors.designation}
                    />
                    {errors.designation && (
                      <p className="text-sm text-destructive">{errors.designation}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">
                      Date of Joining <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={form.dateOfJoining}
                      onChange={(e) => updateField("dateOfJoining", e.target.value)}
                      error={!!errors.dateOfJoining}
                    />
                    {errors.dateOfJoining && (
                      <p className="text-sm text-destructive">{errors.dateOfJoining}</p>
                    )}
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
                          <SelectItem key={role} value={role}>
                            {role}
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
