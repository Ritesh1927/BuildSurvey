"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  Building2,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Trash2,
  User,
  X,
  Globe,
  Users,
} from "lucide-react"

import { cn, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { showSuccess, showError } from "@/components/ui/toast"

interface ClientDetail {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  gstNumber?: string | null
  panNumber?: string | null
  website: string | null
  clientType: string | null
  notes: string | null
  createdAt: string
  projects: { id: string; name: string; code: string; status: string }[]
  leads?: { id: string; name: string; status: string; createdAt: string }[]
}

const statusVariantMap: Record<string, "success" | "info" | "warning" | "destructive" | "secondary"> = {
  IN_PROGRESS: "success",
  PLANNING: "info",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const DELETE_ROLES = ['SUPER_ADMIN']

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const role = session?.user?.role
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', email: '', phone: '', address: '',
    city: '', state: '', zipCode: '', country: '', gstNumber: '', panNumber: '',
    website: '', clientType: '', notes: '',
  })

  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)

  const fetchClient = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${clientId}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load client')
        return
      }
      setClient(data.data)
      setForm({
        companyName: data.data.companyName || '',
        contactPerson: data.data.contactPerson || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        address: data.data.address || '',
        city: data.data.city || '',
        state: data.data.state || '',
        zipCode: data.data.zipCode || '',
        country: data.data.country || '',
        gstNumber: data.data.gstNumber || '',
        panNumber: data.data.panNumber || '',
        website: data.data.website || '',
        clientType: data.data.clientType || '',
        notes: data.data.notes || '',
      })
    } catch {
      setError('Network error while loading client')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          zipCode: form.zipCode || null,
          country: form.country || null,
          gstNumber: form.gstNumber || null,
          panNumber: form.panNumber || null,
          website: form.website || null,
          clientType: form.clientType || null,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to save client')
        return
      }
      showSuccess('Client updated')
      setIsEditing(false)
      router.replace(`/clients/${clientId}`)
      fetchClient()
    } catch {
      showError('Network error while saving client')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!client || !confirm(`Delete client "${client.companyName}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete client')
        return
      }
      showSuccess('Client deleted')
      router.push('/clients')
    } catch {
      showError('Network error while deleting client')
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading client...</div>
  }

  if (error || !client) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Client not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/clients"><ArrowLeft className="mr-1 h-4 w-4" />Back to Clients</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.companyName}
        description={client.clientType || undefined}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: client.companyName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/clients"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/clients/${clientId}`) }}>
                  <X className="mr-2 h-4 w-4" />Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                {canWrite && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />Edit
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {client.companyName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{client.companyName}</h2>
                <p className="text-sm text-muted-foreground">{client.clientType || 'No type set'}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} /></div>
                <div className="space-y-2"><Label>ZIP Code</Label><Input value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
                <div className="space-y-2"><Label>GST Number</Label><Input value={form.gstNumber} onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))} /></div>
                <div className="space-y-2"><Label>PAN Number</Label><Input value={form.panNumber} onChange={(e) => setForm((f) => ({ ...f, panNumber: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Client Type</Label><Input value={form.clientType} onChange={(e) => setForm((f) => ({ ...f, clientType: e.target.value }))} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">Contact Person</p><p className="text-sm font-medium">{client.contactPerson}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Mail className="h-5 w-5 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><a href={`mailto:${client.email}`} className="text-sm font-medium text-primary hover:underline">{client.email}</a></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Phone className="h-5 w-5 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">Phone</p><a href={`tel:${client.phone}`} className="text-sm font-medium text-primary hover:underline">{client.phone}</a></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                    <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{[client.city, client.state].filter(Boolean).join(', ') || 'Not set'}</p></div>
                  </div>
                  {client.website && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
                      <div><p className="text-xs text-muted-foreground">Website</p><a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">{client.website}</a></div>
                    </div>
                  )}
                </div>

                {client.address && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="text-sm">{[client.address, client.city, client.state, client.zipCode, client.country].filter(Boolean).join(', ')}</p>
                  </div>
                )}

                {(client.gstNumber || client.panNumber) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {client.gstNumber !== undefined && client.gstNumber !== null && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">GST Number</p>
                        <p className="text-sm font-mono font-medium mt-1">{client.gstNumber || '—'}</p>
                      </div>
                    )}
                    {client.panNumber !== undefined && client.panNumber !== null && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">PAN Number</p>
                        <p className="text-sm font-mono font-medium mt-1">{client.panNumber || '—'}</p>
                      </div>
                    )}
                  </div>
                )}

                {client.notes && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!isEditing && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="text-lg font-bold">{client.projects.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client Since</span>
                  <span className="text-sm font-medium">{formatDate(client.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {!isEditing && (
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects" className="gap-2"><FolderOpen className="h-4 w-4" />Projects</TabsTrigger>
            {client.leads && (
              <TabsTrigger value="leads" className="gap-2"><Users className="h-4 w-4" />Leads</TabsTrigger>
            )}
            <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" />Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {client.projects.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No projects yet</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {client.projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm">{project.name}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{project.code}</p>
                        </div>
                        <Badge variant={statusVariantMap[project.status] || "secondary"}>{project.status}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {client.leads && (
            <TabsContent value="leads" className="space-y-4">
              {client.leads.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No leads linked to this client</CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    {client.leads.map((lead) => (
                      <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                        <span className="text-sm font-medium">{lead.name}</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{lead.status}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          <TabsContent value="documents">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Document uploads aren't wired to this page yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
