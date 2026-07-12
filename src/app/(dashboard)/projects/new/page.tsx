"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  Globe,
  Hash,
  MapPin,
  Save,
  Target,
  User,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"

const steps = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Financial", icon: Target },
  { id: 4, title: "Assignment", icon: Users },
]

const projectTypes = [
  "Residential Tower",
  "Commercial Complex",
  "Infrastructure",
  "Industrial",
  "Highway",
  "Bridge",
  "Institutional",
  "Mixed Use",
]

const clientList = [
  { id: "CLT-001", name: "L&T Realty" },
  { id: "CLT-002", name: "Tata Projects Ltd" },
  { id: "CLT-003", name: "DLF Limited" },
  { id: "CLT-004", name: "NHAI" },
  { id: "CLT-005", name: "Godrej Properties" },
  { id: "CLT-006", name: "Shapoorji Pallonji & Co" },
  { id: "CLT-007", name: "Brigade Enterprises" },
  { id: "CLT-008", name: "Ircon International Ltd" },
  { id: "CLT-009", name: "Oberoi Realty" },
  { id: "CLT-010", name: "Adani Realty" },
  { id: "CLT-011", name: "Larsen & Toubro (Construction)" },
  { id: "CLT-012", name: "Hindustan Construction Co" },
  { id: "CLT-015", name: "Prestige Estates Projects" },
  { id: "CLT-016", name: "GMR Infrastructure Ltd" },
]

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
]

const teamMembers = [
  { id: "USR-001", name: "Amit Deshmukh", role: "Project Manager" },
  { id: "USR-002", name: "Priya Nair", role: "Site Engineer" },
  { id: "USR-003", name: "Ravi Shankar", role: "Surveyor" },
  { id: "USR-004", name: "Neha Kulkarni", role: "Architect" },
  { id: "USR-005", name: "Vikram Desai", role: "Site Engineer" },
  { id: "USR-006", name: "Sanjay Kulkarni", role: "Surveyor" },
  { id: "USR-007", name: "Deepak Nair", role: "Project Manager" },
  { id: "USR-008", name: "Arjun Reddy", role: "Architect" },
]

interface FormData {
  // Step 1: Basic Info
  name: string
  code: string
  description: string
  type: string
  clientId: string
  // Step 2: Location
  address: string
  city: string
  state: string
  country: string
  latitude: string
  longitude: string
  area: string
  floors: string
  // Step 3: Financial
  budget: string
  estimatedCost: string
  startDate: string
  endDate: string
  // Step 4: Assignment
  managerId: string
  teamMemberIds: string[]
  notes: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    description: "",
    type: "",
    clientId: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
    area: "",
    floors: "",
    budget: "",
    estimatedCost: "",
    startDate: "",
    endDate: "",
    managerId: "",
    teamMemberIds: [],
    notes: "",
  })

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTeamMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMemberIds: prev.teamMemberIds.includes(id)
        ? prev.teamMemberIds.filter((i) => i !== id)
        : [...prev.teamMemberIds, id],
    }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.name && !!formData.type && !!formData.clientId
      case 2:
        return !!formData.city && !!formData.state
      case 3:
        return !!formData.budget && !!formData.startDate && !!formData.endDate
      case 4:
        return !!formData.managerId
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim() || undefined,
          description: formData.description.trim() || undefined,
          type: formData.type,
          clientId: formData.clientId,
          managerId: formData.managerId || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          budget: formData.budget ? Number(formData.budget) : undefined,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
          area: formData.area ? Number(formData.area) : undefined,
          floors: formData.floors ? Number(formData.floors) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to create project' })
        setIsSubmitting(false)
        return
      }
      setShowSuccess(true)
      setTimeout(() => router.push('/projects'), 2000)
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Project"
        description="Set up a new construction project with all required details"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "New Project" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        }
      />

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Project created successfully! Redirecting...</span>
        </div>
      )}

      <div className="flex items-center justify-center">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const StepIcon = step.icon
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isActive && "border-primary bg-primary/10 text-primary",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-16 sm:w-24",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = steps[currentStep - 1].icon
                  return <Icon className="h-5 w-5 text-primary" />
                })()}
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter basic project information and select the client"}
                {currentStep === 2 && "Specify the project location and site details"}
                {currentStep === 3 && "Set budget, costs, and project timeline"}
                {currentStep === 4 && "Assign project manager and team members"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Project Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Worli Sky Residences Tower A"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Project Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => updateField("code", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the project scope, objectives, and key deliverables..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Project Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => updateField("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client">
                        Client <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => updateField("clientId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientList.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Site Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., 123, Brigade Road, Near Metro Station"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="e.g., Mumbai"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        State <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => updateField("state", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        placeholder="e.g., 19.0760"
                        value={formData.latitude}
                        onChange={(e) => updateField("latitude", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        placeholder="e.g., 72.8777"
                        value={formData.longitude}
                        onChange={(e) => updateField("longitude", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">Total Area (sq.ft)</Label>
                      <Input
                        id="area"
                        type="number"
                        placeholder="e.g., 250000"
                        value={formData.area}
                        onChange={(e) => updateField("area", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floors">Number of Floors</Label>
                      <Input
                        id="floors"
                        type="number"
                        placeholder="e.g., 42"
                        value={formData.floors}
                        onChange={(e) => updateField("floors", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="budget">
                        Project Budget (INR) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 12500000"
                        value={formData.budget}
                        onChange={(e) => updateField("budget", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Total approved budget for the project
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCost">Estimated Cost (INR)</Label>
                      <Input
                        id="estimatedCost"
                        type="number"
                        placeholder="e.g., 11800000"
                        value={formData.estimatedCost}
                        onChange={(e) => updateField("estimatedCost", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Internal estimated cost for delivery
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateField("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateField("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      Project Manager <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.managerId}
                      onValueChange={(value) => updateField("managerId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers
                          .filter((m) => m.role === "Project Manager")
                          .map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <p className="text-xs text-muted-foreground">Select team members to assign to this project</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                            formData.teamMemberIds.includes(member.id)
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => toggleTeamMember(member.id)}
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border",
                              formData.teamMemberIds.includes(member.id)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {formData.teamMemberIds.includes(member.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Project Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes about this project..."
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                {currentStep < 4 ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    disabled={!canProceed()}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Step
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full"
                  asChild
                >
                  <Link href="/projects">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {formData.name && (
                <div>
                  <p className="text-muted-foreground text-xs">Project</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
              )}
              {formData.type && (
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium">{formData.type}</p>
                </div>
              )}
              {formData.clientId && (
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="font-medium">
                    {clientList.find((c) => c.id === formData.clientId)?.name}
                  </p>
                </div>
              )}
              {formData.city && (
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="font-medium">
                    {formData.city}{formData.state ? `, ${formData.state}` : ""}
                  </p>
                </div>
              )}
              {formData.budget && (
                <div>
                  <p className="text-muted-foreground text-xs">Budget</p>
                  <p className="font-medium">
                    ₹{Number(formData.budget).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
              {formData.startDate && formData.endDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Timeline</p>
                  <p className="font-medium">
                    {new Date(formData.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    {" - "}
                    {new Date(formData.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
              {formData.teamMemberIds.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs">Team</p>
                  <p className="font-medium">{formData.teamMemberIds.length} members assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
