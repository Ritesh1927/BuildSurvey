'use client'

import { useState } from 'react'
import {
  Plus,
  Pen,
  Type,
  Upload,
  Trash2,
  MoreHorizontal,
  Clock,
  FileText,
  CheckCircle,
  Download,
  Eye,
  Copy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

const mockSignatures = [
  {
    id: 'SIG-001',
    name: 'Saurabh Joshi',
    type: 'drawn',
    initials: 'SJ',
    createdDate: '2026-05-15',
    isDefault: true,
    color: '#1e40af',
    fontFamily: 'cursive',
  },
  {
    id: 'SIG-002',
    name: 'Saurabh Joshi',
    type: 'typed',
    initials: 'SJ',
    createdDate: '2026-06-10',
    isDefault: false,
    color: '#047857',
    fontFamily: "'Great Vibes', cursive",
  },
  {
    id: 'SIG-003',
    name: 'Saurabh Joshi',
    type: 'uploaded',
    initials: 'SJ',
    createdDate: '2026-07-01',
    isDefault: false,
    color: '#7c3aed',
    fontFamily: 'cursive',
  },
]

const signatureHistory = [
  {
    id: 'HIS-001',
    document: 'Site Survey Report #SRV-042',
    workflow: 'WF-001 · Site Survey Approval',
    signedDate: '2026-07-03T14:15:00',
    signatureId: 'SIG-001',
    action: 'Approved',
  },
  {
    id: 'HIS-002',
    document: 'Quotation #QT-2026-038',
    workflow: 'WF-002 · Quotation Approval',
    signedDate: '2026-06-29T11:30:00',
    signatureId: 'SIG-002',
    action: 'Approved',
  },
  {
    id: 'HIS-003',
    document: 'BOQ Document #BOQ-015',
    workflow: 'WF-003 · BOQ Review',
    signedDate: '2026-07-06T16:45:00',
    signatureId: 'SIG-001',
    action: 'Reviewed',
  },
  {
    id: 'HIS-004',
    document: 'Material Purchase Order #PO-022',
    workflow: 'WF-005 · Material Procurement',
    signedDate: '2026-06-28T09:00:00',
    signatureId: 'SIG-001',
    action: 'Authorized',
  },
  {
    id: 'HIS-005',
    document: 'Safety Compliance Report',
    workflow: 'WF-011 · Safety Compliance Review',
    signedDate: '2026-07-04T13:20:00',
    signatureId: 'SIG-003',
    action: 'Certified',
  },
  {
    id: 'HIS-006',
    document: 'Invoice #INV-2026-065',
    workflow: 'WF-010 · Progress Billing',
    signedDate: '2026-07-02T10:10:00',
    signatureId: 'SIG-001',
    action: 'Approved',
  },
]

const typeLabels: Record<string, string> = {
  drawn: 'Drawn',
  typed: 'Typed',
  uploaded: 'Uploaded',
}

const typeBadgeColors: Record<string, string> = {
  drawn: 'bg-blue-100 text-blue-800',
  typed: 'bg-emerald-100 text-emerald-800',
  uploaded: 'bg-violet-100 text-violet-800',
}

export default function SignaturesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createMethod, setCreateMethod] = useState<'draw' | 'type' | 'upload'>('draw')
  const [typedText, setTypedText] = useState('Saurabh Joshi')
  const [selectedFont, setSelectedFont] = useState("'Great Vibes', cursive")
  const [activeTab, setActiveTab] = useState('signatures')

  const fonts = [
    "'Great Vibes', cursive",
    "'Dancing Script', cursive",
    "'Pacifico', cursive",
    "'Satisfy', cursive",
    "'Alex Brush', cursive",
    "'Allura', cursive",
    'cursive',
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Digital Signatures
          </h1>
          <p className="text-muted-foreground">
            Manage your digital signatures for document approvals and sign-offs.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Signature
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="signatures">My Signatures</TabsTrigger>
          <TabsTrigger value="history">Signature History</TabsTrigger>
        </TabsList>

        <TabsContent value="signatures" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockSignatures.map((sig) => (
              <Card key={sig.id} className={cn('relative', sig.isDefault && 'ring-2 ring-blue-500')}>
                {sig.isDefault && (
                  <Badge className="absolute -top-2 right-4 bg-blue-600 text-white text-[10px]">
                    Default
                  </Badge>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Pen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Signature Preview */}
                  <div className="rounded-lg border-2 border-dashed bg-white p-6 mb-4 flex items-center justify-center min-h-[80px]">
                    <span
                      className="text-2xl"
                      style={{
                        fontFamily: sig.fontFamily,
                        color: sig.color,
                      }}
                    >
                      {sig.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sig.name}</span>
                      <Badge className={cn('text-[10px]', typeBadgeColors[sig.type])}>
                        {typeLabels[sig.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Created {formatDate(sig.createdDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Signature History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signatureHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{entry.document}</h4>
                        <p className="text-xs text-muted-foreground">{entry.workflow}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(entry.signedDate)}
                          </span>
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-800">
                            {entry.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Signature Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Tabs
              value={createMethod}
              onValueChange={(v) => setCreateMethod(v as typeof createMethod)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="draw" className="flex-1">
                  <Pen className="mr-1 h-4 w-4" />
                  Draw
                </TabsTrigger>
                <TabsTrigger value="type" className="flex-1">
                  <Type className="mr-1 h-4 w-4" />
                  Type
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">
                  <Upload className="mr-1 h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed bg-white p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <Pen className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-muted-foreground mb-4">
                      Draw your signature below
                    </p>
                    <div className="w-full h-[100px] border rounded-lg bg-gray-50 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        Canvas drawing area
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Clear
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Undo
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="type" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type your name</Label>
                    <Input
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Choose font style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {fonts.map((font) => (
                        <button
                          key={font}
                          onClick={() => setSelectedFont(font)}
                          className={cn(
                            'rounded-lg border p-3 text-center transition-all',
                            selectedFont === font
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'hover:bg-muted'
                          )}
                        >
                          <span
                            className="text-lg block"
                            style={{ fontFamily: font }}
                          >
                            {typedText || 'Signature'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border-2 border-dashed bg-white p-6 flex items-center justify-center min-h-[80px]">
                    <span
                      className="text-3xl"
                      style={{ fontFamily: selectedFont, color: '#1e293b' }}
                    >
                      {typedText || 'Your Signature'}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div className="rounded-lg border-2 border-dashed bg-white p-8 flex flex-col items-center justify-center min-h-[160px]">
                  <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Drag & drop your signature image
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PNG, JPG or SVG. Max 2MB.
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Save Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
