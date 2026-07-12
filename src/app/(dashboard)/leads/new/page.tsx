'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  Calendar,
  IndianRupee,
  AlertCircle,
  Save,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface StepConfig {
  id: number
  title: string
  description: string
  icon: React.ElementType
}

const steps: StepConfig[] = [
  { id: 1, title: 'Contact Information', description: 'Basic contact details', icon: User },
  { id: 2, title: 'Lead Details', description: 'Source, status & value', icon: FileText },
  { id: 3, title: 'Assignment & Follow-up', description: 'Team assignment & scheduling', icon: Calendar },
]

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  website: string
  source: string
  status: string
  priority: string
  estimatedValue: string
  notes: string
  assignedTo: string
  followUpDate: string
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  website: '',
  source: '',
  status: 'NEW',
  priority: 'MEDIUM',
  estimatedValue: '',
  notes: '',
  assignedTo: '',
  followUpDate: '',
}

export default function NewLeadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
      if (!formData.company.trim()) newErrors.company = 'Company name is required'
    }

    if (step === 2) {
      if (!formData.source) newErrors.source = 'Lead source is required'
      if (formData.estimatedValue && isNaN(Number(formData.estimatedValue))) {
        newErrors.estimatedValue = 'Please enter a valid number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrors({})
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          source: formData.source,
          status: formData.status,
          priority: formData.priority,
          estimatedValue: formData.estimatedValue || undefined,
          notes: formData.notes.trim() || undefined,
          assignedToId: formData.assignedTo || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to create lead' })
        setIsSubmitting(false)
        return
      }
      router.push('/leads')
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="pl-9"
              error={!!errors.name}
            />
          </div>
          {errors.name && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="email@company.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="pl-9"
              error={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="pl-9"
              error={!!errors.phone}
            />
          </div>
          {errors.phone && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-1">
            Company <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="company"
              placeholder="Company name"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="pl-9"
              error={!!errors.company}
            />
          </div>
          {errors.company && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.company}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="website"
              placeholder="https://www.company.com"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">Optional - include full URL</p>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Lead Source <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.source} onValueChange={(v) => updateField('source', v)}>
            <SelectTrigger className={cn(errors.source && 'border-destructive')}>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
              <SelectItem value="Exhibition">Exhibition / Trade Show</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.source && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.source}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
              <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => updateField('priority', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Estimated Value (INR)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="estimatedValue"
              type="number"
              placeholder="e.g. 2500000"
              value={formData.estimatedValue}
              onChange={(e) => updateField('estimatedValue', e.target.value)}
              className="pl-9"
              error={!!errors.estimatedValue}
            />
          </div>
          {errors.estimatedValue && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {errors.estimatedValue}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Approximate project value in INR</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about this lead..."
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Assign To</Label>
          <Select value={formData.assignedTo} onValueChange={(v) => updateField('assignedTo', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user-1">Saurabh Verma (Admin)</SelectItem>
              <SelectItem value="user-2">Priya Sharma (Project Manager)</SelectItem>
              <SelectItem value="user-3">Raj Mehta (Site Engineer)</SelectItem>
              <SelectItem value="user-4">Neha Gupta (Surveyor)</SelectItem>
              <SelectItem value="user-5">Amit Kumar (Surveyor)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Leave unassigned to keep it in the general pool</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="followUpDate">Next Follow-up Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => updateField('followUpDate', e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">Schedule the next follow-up reminder</p>
        </div>
      </div>

      {/* Lead Summary */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Lead Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Name:</span>{' '}
              <span className="font-medium">{formData.name || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              <span className="font-medium">{formData.email || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{' '}
              <span className="font-medium">{formData.phone || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Company:</span>{' '}
              <span className="font-medium">{formData.company || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Source:</span>{' '}
              <span className="font-medium">{formData.source || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Priority:</span>{' '}
              <span className="font-medium">{formData.priority}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-medium">{formData.status.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Estimated Value:</span>{' '}
              <span className="font-medium">
                {formData.estimatedValue ? `₹${Number(formData.estimatedValue).toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Lead"
        description="Add a new lead to your sales pipeline."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Leads', href: '/leads' },
          { label: 'New Lead' },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/leads">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Leads
            </Link>
          </Button>
        }
      />

      {/* Step Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        !isActive && !isCompleted && 'border-muted-foreground/30 bg-muted text-muted-foreground',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        Step {step.id}
                      </p>
                      <p className="hidden text-[10px] text-muted-foreground sm:block">
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-4 h-[2px] w-12 sm:w-24 lg:w-32',
                        currentStep > step.id ? 'bg-emerald-500' : 'bg-muted',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {steps[currentStep - 1].title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/leads">Cancel</Link>
          </Button>
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Save Lead
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
