"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Edit,
  Save,
  Send,
  X,
  XCircle,
} from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/utils"
import { showSuccess, showError } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"

interface QuotationDetail {
  id: string
  quotationNumber: string
  title: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
  validUntil: string | null
  terms: string | null
  notes: string | null
  status: string
  quotationStatus: string
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    code: string
    client: { companyName: string; contactPerson: string }
  }
  items: { id: string; description: string; unit: string; quantity: number; unitRate: number; amount: number }[]
}

const STATUS_META: Record<string, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Sent", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const role = session?.user?.role
  const quotationId = params.id as string

  const [q, setQ] = useState<QuotationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', validUntil: '', terms: '', notes: '', discountAmount: '' })

  const canWrite = !!role && WRITE_ROLES.includes(role)
  const canDelete = !!role && DELETE_ROLES.includes(role)

  const fetchQuotation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/quotations/${quotationId}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load quotation')
        return
      }
      setQ(data.data)
      setForm({
        title: data.data.title || '',
        validUntil: data.data.validUntil ? data.data.validUntil.slice(0, 10) : '',
        terms: data.data.terms || '',
        notes: data.data.notes || '',
        discountAmount: String(data.data.discountAmount || 0),
      })
    } catch {
      setError('Network error while loading quotation')
    } finally {
      setLoading(false)
    }
  }, [quotationId])

  useEffect(() => {
    fetchQuotation()
  }, [fetchQuotation])

  const patchQuotation = async (body: Record<string, unknown>, successMsg: string) => {
    try {
      const res = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to update quotation')
        return false
      }
      showSuccess(successMsg)
      fetchQuotation()
      return true
    } catch {
      showError('Network error while updating quotation')
      return false
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await patchQuotation({
      title: form.title,
      validUntil: form.validUntil || null,
      terms: form.terms || null,
      notes: form.notes || null,
      discountAmount: form.discountAmount,
    }, 'Quotation updated')
    setSaving(false)
    if (ok) {
      setIsEditing(false)
      router.replace(`/quotations/${quotationId}`)
    }
  }

  const handleDownloadPDF = () => {
    if (!q) return
    showSuccess("Download started — the quotation will be saved to your downloads folder")
    const content = `Quotation: ${q.quotationNumber}\nTitle: ${q.title}\nProject: ${q.project.name}\nClient: ${q.project.client.companyName}\n\nLine Items:\n${q.items.map((i, idx) => `${idx + 1}. ${i.description} | ${i.unit} | ${i.quantity} | ₹${i.unitRate} | ₹${i.amount}`).join("\n")}\n\nTotal: ₹${q.totalAmount}\nDiscount: ₹${q.discountAmount}\nTax: ₹${q.taxAmount}\nGrand Total: ₹${q.grandTotal}\n\nTerms:\n${q.terms || ''}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${q.quotationNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading quotation...</div>
  }

  if (error || !q) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error || 'Quotation not found'}</p>
        <Button variant="outline" asChild>
          <Link href="/quotations"><ArrowLeft className="mr-1 h-4 w-4" />Back to Quotations</Link>
        </Button>
      </div>
    )
  }

  const statusMeta = STATUS_META[q.quotationStatus] || { label: q.quotationStatus, variant: 'secondary' as const }

  return (
    <div className="space-y-6">
      <PageHeader
        title={q.quotationNumber}
        description={q.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Quotations", href: "/quotations" },
          { label: q.quotationNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/quotations"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/quotations/${quotationId}`) }}>
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
                    <Edit className="mr-2 h-4 w-4" />Edit
                  </Button>
                )}
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />Download
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="border rounded-lg p-6 space-y-6 bg-background">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold">BuildSurvey Pro</h2>
                    <p className="text-sm text-muted-foreground mt-1">Survey & Estimation Division</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-base px-4 py-1.5">QUOTATION</Badge>
                    <p className="text-sm font-mono font-bold mt-2">{q.quotationNumber}</p>
                    <p className="text-sm text-muted-foreground">Date: {formatDate(q.createdAt)}</p>
                    {q.validUntil && <p className="text-sm text-muted-foreground">Valid Until: {formatDate(q.validUntil)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">To,</p>
                    <p className="font-semibold">{q.project.client.companyName}</p>
                    <p className="text-muted-foreground">{q.project.client.contactPerson}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Project,</p>
                    <Link href={`/projects/${q.project.id}`} className="font-semibold text-primary hover:underline">{q.project.name}</Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Subject: {q.title}</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">S.No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.quantity.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitRate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(q.totalAmount)}</span>
                  </div>
                  {q.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(q.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span className="font-medium">{formatCurrency(q.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-primary pt-3">
                    <span>Grand Total</span>
                    <span>{formatCurrency(q.grandTotal)}</span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2"><Label>Valid Until</Label><Input type="date" value={form.validUntil} onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))} /></div>
                      <div className="space-y-2"><Label>Discount Amount</Label><Input type="number" value={form.discountAmount} onChange={(e) => setForm((f) => ({ ...f, discountAmount: e.target.value }))} /></div>
                    </div>
                    <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea rows={4} value={form.terms} onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                    <p className="text-xs text-muted-foreground">Line items aren't editable here yet — create a new quotation for a different scope of work.</p>
                  </div>
                ) : (
                  q.terms && (
                    <div className="text-xs space-y-1 border-t pt-4">
                      <p className="font-semibold mb-2">Terms & Conditions:</p>
                      <p className="text-muted-foreground whitespace-pre-line">{q.terms}</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!isEditing && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Quotation Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{q.project.client.companyName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Project</span>
                  <span className="font-medium text-right max-w-[180px]">{q.project.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(q.createdAt)}</span>
                </div>
                {q.validUntil && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span>{formatDate(q.validUntil)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{q.items.length}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Grand Total</span>
                    <span className="font-bold text-lg">{formatCurrency(q.grandTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canWrite && (
              <div className="flex flex-col gap-2">
                {q.quotationStatus === 'DRAFT' && (
                  <Button className="w-full" onClick={() => patchQuotation({ quotationStatus: 'SENT' }, 'Quotation marked as sent')}>
                    <Send className="mr-2 h-4 w-4" />Mark as Sent
                  </Button>
                )}
                {q.quotationStatus === 'SENT' && (
                  <>
                    <Button className="w-full" onClick={() => patchQuotation({ quotationStatus: 'ACCEPTED' }, 'Quotation accepted')}>
                      <CheckCircle className="mr-2 h-4 w-4" />Mark Accepted
                    </Button>
                    <Button className="w-full" variant="destructive" onClick={() => patchQuotation({ quotationStatus: 'REJECTED' }, 'Quotation rejected')}>
                      <XCircle className="mr-2 h-4 w-4" />Mark Rejected
                    </Button>
                  </>
                )}
                {canDelete && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={async () => {
                      if (!confirm(`Delete quotation "${q.quotationNumber}"? This cannot be undone from here.`)) return
                      const res = await fetch(`/api/quotations/${quotationId}`, { method: 'DELETE' })
                      const data = await res.json()
                      if (!res.ok || !data.success) { showError(data.error || 'Failed to delete quotation'); return }
                      showSuccess('Quotation deleted')
                      router.push('/quotations')
                    }}
                  >
                    Delete Quotation
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
