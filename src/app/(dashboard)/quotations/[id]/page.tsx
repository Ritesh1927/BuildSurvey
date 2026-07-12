"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Download,
  Edit,
  FileText,
  Mail,
  Send,
  XCircle,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { showSuccess } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const quotationData = {
  id: "QUO-2024-001",
  title: "Interior Fit-out Works - Worli Sky Residences Tower A",
  project: "Worli Sky Residences Tower A",
  client: "L&T Realty",
  clientContact: "Mr. Rajesh Sharma, Director Projects",
  createdAt: "2024-10-15",
  validUntil: "2025-01-15",
  status: "Accepted",
  lineItems: [
    { sno: 1, description: "Demolition and removal of existing partitions", unit: "Sqm", qty: 4500, rate: 85, amount: 382500 },
    { sno: 2, description: "Gypsum partition walls 4 inch thick", unit: "Sqm", qty: 12000, rate: 320, amount: 3840000 },
    { sno: 3, description: "False ceiling - mineral fiber grid system", unit: "Sqm", qty: 10000, rate: 280, amount: 2800000 },
    { sno: 4, description: "Vitrified tile flooring 800x800mm", unit: "Sqm", qty: 8500, rate: 680, amount: 5780000 },
    { sno: 5, description: "Marble flooring in lobby areas", unit: "Sqm", qty: 2200, rate: 1800, amount: 3960000 },
    { sno: 6, description: "Internal painting - 2 coats primer + 2 coats emulsion", unit: "Sqm", qty: 24000, rate: 95, amount: 2280000 },
    { sno: 7, description: "Modular electrical switches and sockets", unit: "Nos", qty: 1800, rate: 450, amount: 810000 },
    { sno: 8, description: "LED panel lights 2x2 ft", unit: "Nos", qty: 650, rate: 1200, amount: 780000 },
    { sno: 9, description: "Fire rated wooden doors with hardware", unit: "Nos", qty: 120, rate: 18000, amount: 2160000 },
    { sno: 10, description: "Aluminium windows with toughened glass", unit: "Sqm", qty: 3200, rate: 2400, amount: 7680000 },
  ],
  subtotal: 30472500,
  gstPercent: 18,
  discountPercent: 3,
  discountAmount: 914175,
  gstAmount: 5321895,
  grandTotal: 34880220,
  terms: [
    "This quotation is valid for 90 days from the date of issue.",
    "Prices are inclusive of all applicable taxes (GST @ 18%).",
    "Payment Terms: 30% advance, 40% at mid-stage, 30% on completion.",
    "Material delivery within 2-3 weeks from date of order.",
    "Warranty: 12 months from date of commissioning.",
    "Price escalation clause: Rates subject to change after validity period.",
    "All disputes subject to Mumbai jurisdiction.",
  ],
  timeline: [
    { status: "Created", date: "2024-10-15", time: "10:30 AM", by: "Amit Deshmukh", icon: FileText },
    { status: "Reviewed", date: "2024-10-18", time: "02:15 PM", by: "Priya Nair", icon: Check },
    { status: "Sent to Client", date: "2024-10-20", time: "11:00 AM", by: "Amit Deshmukh", icon: Send },
    { status: "Client Review", date: "2024-11-05", time: "04:30 PM", by: "L&T Realty", icon: Clock },
    { status: "Negotiation", date: "2024-11-12", time: "03:00 PM", by: "Rajesh Sharma", icon: Mail },
    { status: "Accepted", date: "2024-11-20", time: "01:45 PM", by: "L&T Realty", icon: CheckCircle },
  ],
}

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  Accepted: "success",
  Sent: "info",
  Draft: "secondary",
  Rejected: "destructive",
  Cancelled: "destructive",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function QuotationDetailPage({ params: _params }: { params: Promise<{ id: string }> }) {
  const q = quotationData

  const handleDownloadPDF = () => {
    showSuccess("PDF download started — the quotation will be saved to your downloads folder")
    const content = `Quotation: ${q.id}\nTitle: ${q.title}\nProject: ${q.project}\nClient: ${q.client}\n\nLine Items:\n${q.lineItems.map(i => `${i.sno}. ${i.description} | ${i.unit} | ${i.qty} | ₹${i.rate} | ₹${i.amount}`).join("\n")}\n\nSubtotal: ₹${q.subtotal}\nDiscount: ₹${q.discountAmount}\nGST: ₹${q.gstAmount}\nGrand Total: ₹${q.grandTotal}\n\nTerms:\n${q.terms.join("\n")}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${q.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={q.id}
        description={q.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Quotations", href: "/quotations" },
          { label: q.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/quotations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
            {q.status !== "Accepted" && (
              <Button variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept
              </Button>
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
                    <h2 className="text-xl font-bold">BuildRight Construction Pvt Ltd</h2>
                    <p className="text-sm text-muted-foreground mt-1">Survey & Estimation Division</p>
                    <p className="text-sm text-muted-foreground">402, Marathon Futurex, Mafatlal Mills Compounds</p>
                    <p className="text-sm text-muted-foreground">N.M. Joshi Marg, Lower Parel, Mumbai - 400013</p>
                    <p className="text-sm text-muted-foreground mt-1">CIN: U45200MH2015PTC123456</p>
                    <p className="text-sm text-muted-foreground">GSTIN: 27AABCB1234C1Z5</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-base px-4 py-1.5">QUOTATION</Badge>
                    <p className="text-sm font-mono font-bold mt-2">{q.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Valid Until: {new Date(q.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">To,</p>
                    <p className="font-semibold">{q.client}</p>
                    <p className="text-muted-foreground">{q.clientContact}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Project,</p>
                    <p className="font-semibold">{q.project}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Subject: {q.title}</p>
                  <p className="text-sm text-muted-foreground">
                    We are pleased to submit our quotation for the above-mentioned scope of work.
                    Please find below the detailed breakdown of costs.
                  </p>
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
                    {q.lineItems.map((item) => (
                      <TableRow key={item.sno}>
                        <TableCell className="font-mono text-xs">{item.sno}</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.qty.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(q.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({q.discountPercent}%)</span>
                    <span>-{formatCurrency(q.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST @ {q.gstPercent}%</span>
                    <span className="font-medium">{formatCurrency(q.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-primary pt-3">
                    <span>Grand Total</span>
                    <span>{formatCurrency(q.grandTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    (Rupees Thirty Four Lakhs Eighty Eight Thousand Two Hundred Twenty Only)
                  </p>
                </div>

                <div className="text-xs space-y-1 border-t pt-4">
                  <p className="font-semibold mb-2">Terms & Conditions:</p>
                  {q.terms.map((term, i) => (
                    <p key={i} className="text-muted-foreground">{term}</p>
                  ))}
                </div>

                <div className="flex justify-between items-end border-t pt-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">For BuildRight Construction Pvt Ltd</p>
                    <div className="mt-8 border-b border-foreground w-48" />
                    <p className="text-xs font-medium mt-1">Authorised Signatory</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Accepted by {q.client}</p>
                    <div className="mt-8 border-b border-foreground w-48 ml-auto" />
                    <p className="text-xs font-medium mt-1">Client Signature & Stamp</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[q.status] || "secondary"}>{q.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client</span>
                <span className="font-medium">{q.client}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Project</span>
                <span className="font-medium text-right max-w-[180px]">{q.project}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(q.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valid Until</span>
                <span>{new Date(q.validUntil).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{q.lineItems.length}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold text-lg">{formatCurrency(q.grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {q.timeline.map((event, i) => {
                  const Icon = event.icon
                  const isLast = i === q.timeline.length - 1
                  return (
                    <div key={i} className="relative flex items-start gap-4 pl-1">
                      <div className={cn(
                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                        isLast ? "border-primary bg-primary/10" : "border-muted"
                      )}>
                        <Icon className={cn("h-4 w-4", isLast ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{event.status}</span>
                          {isLast && <Badge variant="success" className="text-[10px]">Current</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.by} · {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {event.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Quotation
            </Button>
            <Button className="w-full" variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button className="w-full" variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Send to Client
            </Button>
            {q.status === "Sent" && (
              <>
                <Button className="w-full" variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Quotation
                </Button>
                <Button className="w-full" variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Quotation
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
