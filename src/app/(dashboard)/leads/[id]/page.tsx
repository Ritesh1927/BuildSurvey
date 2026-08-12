'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ArrowLeft,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  IndianRupee,
  Tag,
  Save,
  X,
  Building,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { showSuccess, showError } from '@/components/ui/toast'
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'

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

interface LeadDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  source: string | null
  status: string
  priority: string
  estimatedValue: number | null
  notes: string | null
  convertedAt: string | null
  clientId: string | null
  assignedToId: string | null
  assignedTo: { id: string; firstName: string; lastName: string; email: string } | null
  client: { id: string; companyName: string } | null
  createdAt: string
  updatedAt: string
}

interface UserOption {
  id: string
  firstName: string
  lastName: string
  role: string
}

// Only a Manager owns a lead through its lifecycle (status changes,
// eventual conversion to a client) - matches the assignedToId check in
// POST/PATCH /api/leads, not just hidden here in the picker.
const LEAD_ASSIGNABLE_ROLES = ['MANAGER']

const STATUS_META: Record<string, { label: string; color: string }> = {
  NEW: { label: 'New', color: 'bg-blue-600 text-white' },
  CONTACTED: { label: 'Contacted', color: 'bg-violet-600 text-white' },
  QUALIFIED: { label: 'Qualified', color: 'bg-emerald-600 text-white' },
  PROPOSAL: { label: 'Proposal Sent', color: 'bg-amber-600 text-white' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-orange-600 text-white' },
  WON: { label: 'Won', color: 'bg-emerald-600 text-white' },
  LOST: { label: 'Lost', color: 'bg-red-600 text-white' },
}

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'text-gray-600 border-gray-300' },
  MEDIUM: { label: 'Medium', color: 'text-blue-700 border-blue-300' },
  HIGH: { label: 'High', color: 'text-orange-700 border-orange-300' },
  CRITICAL: { label: 'Critical', color: 'text-red-700 border-red-400' },
}

// Forward pipeline order for the progress display. LOST is a terminal
// state reached from anywhere and doesn't fit a linear step, so it's
// shown separately rather than forced into this sequence.
const PIPELINE = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON']

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const leadId = params.id as string

  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', source: '',
    status: 'NEW', priority: 'MEDIUM', estimatedValue: '', notes: '', assignedToId: '',
  })
  const [convertForm, setConvertForm] = useState({
    address: '', city: '', state: '', zipCode: '', country: 'India',
    gstNumber: '', panNumber: '', website: '', clientType: '',
  })

  const canWrite = hasPermission(session?.user, 'leads:write')
  const canDelete = hasPermission(session?.user, 'leads:delete')
  const canConvert = canWrite && lead?.status === 'WON' && !lead?.clientId
  // Live against the in-progress form, not the loaded lead, so the client
  // fields appear the instant Status is switched to Won during editing.
  const willConvertOnSave = form.status === 'WON' && !lead?.clientId
  // Same required set as the standalone "New Client" form (company/contact/
  // email/phone/city/state) — company/contact/name always exist on a lead
  // already, so only email, phone, city, and state can actually be missing.
  const missingConvertFields = willConvertOnSave
    ? [
        !form.email.trim() && 'email',
        !form.phone.trim() && 'phone',
        !convertForm.city.trim() && 'city',
        !convertForm.state && 'state',
      ].filter((v): v is string => !!v)
    : []
  const convertBlocked = missingConvertFields.length > 0

  const fetchLead = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leads/${leadId}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load lead')
        return
      }
      setLead(data.data)
      setForm({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        company: data.data.company || '',
        source: data.data.source || '',
        status: data.data.status,
        priority: data.data.priority,
        estimatedValue: data.data.estimatedValue != null ? String(data.data.estimatedValue) : '',
        notes: data.data.notes || '',
        assignedToId: data.data.assignedToId || '',
      })
    } catch {
      setError('Network error while loading lead')
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  useEffect(() => {
    if (!canWrite) return
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        const list: UserOption[] = Array.isArray(data) ? data : data.users || []
        setUsers(list.filter((u) => LEAD_ASSIGNABLE_ROLES.includes(u.role)))
      })
      .catch(() => {})
  }, [canWrite])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          source: form.source.trim() || null,
          status: form.status,
          priority: form.priority,
          estimatedValue: form.estimatedValue !== '' ? form.estimatedValue : null,
          notes: form.notes.trim() || null,
          assignedToId: form.assignedToId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to save lead')
        return
      }

      // Won and "converted" are the same real-world moment now — saving
      // a lead as Won converts it to a client in the same action, using
      // whatever client-only details were filled in below the status field.
      if (willConvertOnSave) {
        const convertRes = await fetch(`/api/leads/${leadId}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: convertForm.address.trim() || undefined,
            city: convertForm.city.trim() || undefined,
            state: convertForm.state || undefined,
            zipCode: convertForm.zipCode.trim() || undefined,
            country: convertForm.country || undefined,
            gstNumber: convertForm.gstNumber.trim() || undefined,
            panNumber: convertForm.panNumber.trim() || undefined,
            website: convertForm.website.trim() || undefined,
            clientType: convertForm.clientType || undefined,
          }),
        })
        const convertData = await convertRes.json()
        if (!convertRes.ok || !convertData.success) {
          showError(convertData.error || 'Lead was saved, but converting it to a client failed')
          setIsEditing(false)
          router.replace(`/leads/${leadId}`)
          fetchLead()
          return
        }
        showSuccess('Lead updated and converted to client')
        router.push(`/clients/${convertData.data.clientId}`)
        return
      }

      showSuccess('Lead updated')
      setIsEditing(false)
      router.replace(`/leads/${leadId}`)
      fetchLead()
    } catch {
      showError('Network error while saving lead')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!lead || !confirm(`Delete lead "${lead.name}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete lead')
        return
      }
      showSuccess('Lead deleted')
      router.push('/leads')
    } catch {
      showError('Network error while deleting lead')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading lead...</div>
  }

  if (error || !lead) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Lead not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/leads"><ArrowLeft className="mr-1 h-4 w-4" />Back to Leads</Link>
        </Button>
      </div>
    )
  }

  // Won + converted is one state now, not two - a Won lead is converted
  // to a client in the same save, so show a single "Converted" badge
  // instead of stacking Won next to it once that's happened.
  const isConverted = lead.status === 'WON' && !!lead.clientId
  const statusMeta = isConverted
    ? { label: 'Converted', color: 'bg-emerald-600 text-white' }
    : STATUS_META[lead.status] || { label: lead.status, color: 'bg-gray-600 text-white' }
  const priorityMeta = PRIORITY_META[lead.priority] || { label: lead.priority, color: '' }
  const currentStepIndex = PIPELINE.indexOf(lead.status)

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.name}
        description={[lead.company, lead.source].filter(Boolean).join(' · ') || undefined}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Leads', href: '/leads' },
          { label: lead.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/leads">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/leads/${leadId}`) }}>
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || convertBlocked} title={convertBlocked ? `Add ${missingConvertFields.join(', ')} before saving a Won lead` : undefined}>
                  <Save className="mr-1 h-4 w-4" />
                  {saving ? (willConvertOnSave ? 'Converting...' : 'Saving...') : willConvertOnSave ? 'Save & Convert' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                {canWrite && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {canConvert && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <ArrowRightLeft className="mr-1 h-4 w-4" />
                    Convert to Client
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Lead Information</CardTitle>
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-[10px]', statusMeta.color)}>{statusMeta.label}</Badge>
                    <Badge variant="outline" className={cn('text-[10px]', priorityMeta.color)}>{priorityMeta.label}</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_META).map(([value, meta]) => (
                          <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_META).map(([value, meta]) => (
                          <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Value (INR)</Label>
                    <Input type="number" value={form.estimatedValue} onChange={(e) => setForm((f) => ({ ...f, estimatedValue: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select value={form.assignedToId || '__unassigned'} onValueChange={(v) => setForm((f) => ({ ...f, assignedToId: v === '__unassigned' ? '' : v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned">Unassigned</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Notes</Label>
                    <Textarea rows={4} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>

                {willConvertOnSave && (
                  <div className="mt-6 space-y-4 rounded-lg border border-emerald-300/60 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <ArrowRightLeft className="h-4 w-4" />
                        Convert to Client
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Saving this lead as Won converts it to a client. Name, company, email, and phone
                        carry over automatically — fill in what a client record needs but a lead never
                        captured.
                      </p>
                      {convertBlocked && (
                        <p className="mt-2 text-xs font-medium text-destructive">
                          Missing {missingConvertFields.join(', ')} — required for a client record.
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Client Type</Label>
                        <Select value={convertForm.clientType} onValueChange={(v) => setConvertForm((f) => ({ ...f, clientType: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {clientTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input placeholder="https://www.example.com" value={convertForm.website} onChange={(e) => setConvertForm((f) => ({ ...f, website: e.target.value }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Street Address</Label>
                      <Input placeholder="e.g., 123, Brigade Road" value={convertForm.address} onChange={(e) => setConvertForm((f) => ({ ...f, address: e.target.value }))} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>City <span className="text-destructive">*</span></Label>
                        <Input placeholder="e.g., Mumbai" value={convertForm.city} onChange={(e) => setConvertForm((f) => ({ ...f, city: e.target.value }))} />
                        {!convertForm.city.trim() && <p className="text-xs text-destructive">City is required</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>State <span className="text-destructive">*</span></Label>
                        <Select value={convertForm.state} onValueChange={(v) => setConvertForm((f) => ({ ...f, state: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {!convertForm.state && <p className="text-xs text-destructive">State is required</p>}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>PIN Code</Label>
                        <Input placeholder="e.g., 400001" value={convertForm.zipCode} onChange={(e) => setConvertForm((f) => ({ ...f, zipCode: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input value={convertForm.country} onChange={(e) => setConvertForm((f) => ({ ...f, country: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>GST Number</Label>
                        <Input placeholder="27AABCL1234F1ZP" className="font-mono" value={convertForm.gstNumber} onChange={(e) => setConvertForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <Input placeholder="ABCDE1234F" className="font-mono" value={convertForm.panNumber} onChange={(e) => setConvertForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))} />
                      </div>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-sm font-medium text-primary hover:underline">{lead.email}</a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="text-sm font-medium text-primary hover:underline">{lead.phone}</a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">{lead.company || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Value</p>
                      <p className="text-sm font-semibold">
                        {lead.estimatedValue != null ? formatCurrency(lead.estimatedValue) : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="text-sm font-medium">{lead.source || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>

                  {lead.client && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Converted To</p>
                        <Link href={`/clients/${lead.client.id}`} className="text-sm font-medium text-primary hover:underline">
                          {lead.client.companyName}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isEditing && lead.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Pipeline */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Lead Progression</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.status === 'LOST' ? (
                  <Badge className="bg-red-600 text-white">Lost — pipeline ended</Badge>
                ) : (
                  <div className="flex items-center justify-between overflow-x-auto pb-2">
                    {PIPELINE.map((step, index) => {
                      const meta = STATUS_META[step]
                      const isCompleted = currentStepIndex >= 0 && index < currentStepIndex
                      const isCurrent = index === currentStepIndex
                      return (
                        <div key={step} className="flex items-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                                isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                                isCurrent && 'border-primary bg-primary text-primary-foreground',
                                !isCompleted && !isCurrent && 'border-muted-foreground/20 bg-muted text-muted-foreground',
                              )}
                            >
                              <span className="text-[10px]">{index + 1}</span>
                            </div>
                            <span className={cn('text-[10px] font-medium whitespace-nowrap', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                              {meta.label}
                            </span>
                          </div>
                          {index < PIPELINE.length - 1 && (
                            <div className={cn('mx-2 h-[2px] w-8 sm:w-12', isCompleted ? 'bg-emerald-500' : 'bg-muted')} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        {!isEditing && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(lead.assignedTo.firstName, lead.assignedTo.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{lead.assignedTo.firstName} {lead.assignedTo.lastName}</p>
                      <p className="text-xs text-muted-foreground">{lead.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deal Value</span>
                  <span className="text-sm font-semibold">
                    {lead.estimatedValue != null ? formatCurrency(lead.estimatedValue) : '—'}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days Since Created</span>
                  <span className="text-sm font-semibold">
                    {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                {lead.convertedAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Converted</span>
                      <span className="text-sm font-semibold">{formatDate(lead.convertedAt)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
