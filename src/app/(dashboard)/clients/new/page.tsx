'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
]

const clientTypes = [
  'Real Estate Developer','Construction Company','Government Body','Infrastructure Developer',
  'Industrial Client','Institutional Client','Individual Client',
]

interface FormErrors { [key: string]: string }

export default function NewClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    companyName: '', contactPerson: '', email: '', phone: '', address: '',
    city: '', state: '', zip: '', country: 'India', gstNumber: '',
    panNumber: '', website: '', clientType: '', notes: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!formData.companyName.trim()) e.companyName = 'Company name is required'
    if (!formData.contactPerson.trim()) e.contactPerson = 'Contact person is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format'
    if (!formData.phone.trim()) e.phone = 'Phone number is required'
    if (!formData.city.trim()) e.city = 'City is required'
    if (!formData.state) e.state = 'State is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state || undefined,
          zipCode: formData.zip.trim() || undefined,
          country: formData.country,
          gstNumber: formData.gstNumber.trim() || undefined,
          panNumber: formData.panNumber.trim() || undefined,
          website: formData.website.trim() || undefined,
          clientType: formData.clientType || undefined,
          notes: formData.notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ submit: data.error || 'Failed to create client' }); return }

      setShowSuccess(true)
      setTimeout(() => router.push('/clients'), 2000)
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Client"
        description="Create a new client profile for your construction projects"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Clients', href: '/clients' }, { label: 'New Client' }]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/clients"><ArrowLeft className="mr-2 h-4 w-4" />Back to Clients</Link>
          </Button>
        }
      />

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Client created successfully! Redirecting...</span>
        </div>
      )}

      {errors.submit && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Company Information</CardTitle>
                <CardDescription>Basic details about the client company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g., L&T Realty" value={formData.companyName} onChange={(e) => updateField('companyName', e.target.value)} />
                    {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Client Type</Label>
                    <Select value={formData.clientType} onValueChange={(v) => updateField('clientType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select client type" /></SelectTrigger>
                      <SelectContent>
                        {clientTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Contact Person <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g., Rajesh Kumar" value={formData.contactPerson} onChange={(e) => updateField('contactPerson', e.target.value)} />
                    {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://www.example.com" value={formData.website} onChange={(e) => updateField('website', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Contact Details</CardTitle>
                <CardDescription>Email, phone, and communication preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email Address <span className="text-destructive">*</span></Label>
                    <Input type="email" placeholder="contact@company.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number <span className="text-destructive">*</span></Label>
                    <Input placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Address Information</CardTitle>
                <CardDescription>Physical address and location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input placeholder="e.g., 123, Brigade Road" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>City <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g., Mumbai" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>State <span className="text-destructive">*</span></Label>
                    <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>PIN Code</Label>
                    <Input placeholder="e.g., 400001" value={formData.zip} onChange={(e) => updateField('zip', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Tax & Registration</CardTitle>
                <CardDescription>GST, PAN, and other registration details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input placeholder="27AABCL1234F1ZP" value={formData.gstNumber} onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())} className="font-mono" />
                  <p className="text-xs text-muted-foreground">Format: 2 digits + 5 letters + 4 digits + 1 letter + Z + 1 alphanumeric</p>
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input placeholder="ABCDE1234F" value={formData.panNumber} onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())} className="font-mono" />
                  <p className="text-xs text-muted-foreground">Format: 5 letters + 4 digits + 1 letter</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Additional Notes</CardTitle>
                <CardDescription>Any additional information about the client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add any additional notes about this client..." rows={6} value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Creating Client...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Create Client</>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild><Link href="/clients">Cancel</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
