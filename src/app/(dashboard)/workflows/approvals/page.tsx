'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  GitBranch,
  Layers,
  MessageSquare,
  Eye,
  Filter,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatDate } from '@/lib/utils'

const mockApprovals = [
  {
    id: 'APR-001',
    type: 'workflow',
    title: 'Site Survey Approval',
    subtitle: 'WF-001 · Sunrise Enclave Phase 2',
    requestedBy: 'Amit Kumar',
    requestedDate: '2026-07-05',
    status: 'pending',
    step: 'Manager Approval',
    category: 'my-approvals',
  },
  {
    id: 'APR-002',
    type: 'quotation',
    title: 'Quotation #QT-2026-045',
    subtitle: 'Metro Residency Tower B · ₹4,85,000',
    requestedBy: 'Priya Sharma',
    requestedDate: '2026-07-08',
    status: 'pending',
    step: 'Director Review',
    category: 'my-approvals',
  },
  {
    id: 'APR-003',
    type: 'boq',
    title: 'BOQ for Phoenix Tower',
    subtitle: 'WF-003 · Phoenix Tower Commercial',
    requestedBy: 'Saurabh Joshi',
    requestedDate: '2026-07-09',
    status: 'pending',
    step: 'Technical Review',
    category: 'my-approvals',
  },
  {
    id: 'APR-004',
    type: 'drawing',
    title: 'Structural Drawing - Floor 12',
    subtitle: 'WF-004 · Greenfield Estates Block C',
    requestedBy: 'Neha Gupta',
    requestedDate: '2026-07-06',
    status: 'pending',
    step: 'Architect Review',
    category: 'my-approvals',
  },
  {
    id: 'APR-005',
    type: 'change-order',
    title: 'Change Order #CO-012',
    subtitle: 'WF-008 · Greenfield Estates Block C · ₹2,30,000',
    requestedBy: 'Priya Sharma',
    requestedDate: '2026-07-07',
    status: 'pending',
    step: 'Impact Analysis',
    category: 'my-requests',
  },
  {
    id: 'APR-006',
    type: 'invoice',
    title: 'Invoice #INV-2026-078',
    subtitle: 'Metro Residency Tower B · ₹6,20,000',
    requestedBy: 'Vikram Patel',
    requestedDate: '2026-07-04',
    status: 'pending',
    step: 'Accounts Review',
    category: 'my-approvals',
  },
  {
    id: 'APR-007',
    type: 'safety',
    title: 'Safety Compliance Report',
    subtitle: 'WF-011 · Phoenix Tower Commercial',
    requestedBy: 'Amit Kumar',
    requestedDate: '2026-07-03',
    status: 'approved',
    step: 'Safety Officer Review',
    category: 'my-requests',
  },
  {
    id: 'APR-008',
    type: 'procurement',
    title: 'Material Purchase Order',
    subtitle: 'WF-005 · Sunrise Enclave Phase 2 · ₹8,50,000',
    requestedBy: 'Raj Mehta',
    requestedDate: '2026-07-02',
    status: 'approved',
    step: 'Purchase Order',
    category: 'my-requests',
  },
  {
    id: 'APR-009',
    type: 'workflow',
    title: 'Progress Billing Approval',
    subtitle: 'WF-010 · Metro Residency Tower B',
    requestedBy: 'Vikram Patel',
    requestedDate: '2026-07-10',
    status: 'pending',
    step: 'Engineer Certification',
    category: 'my-approvals',
  },
  {
    id: 'APR-010',
    type: 'quotation',
    title: 'Quotation #QT-2026-051',
    subtitle: 'Sunrise Enclave Phase 2 · ₹3,20,000',
    requestedBy: 'Raj Mehta',
    requestedDate: '2026-07-09',
    status: 'pending',
    step: 'Finance Review',
    category: 'my-requests',
  },
]

const typeIcons: Record<string, React.ReactNode> = {
  workflow: <GitBranch className="h-4 w-4 text-blue-600" />,
  quotation: <FileText className="h-4 w-4 text-violet-600" />,
  boq: <Layers className="h-4 w-4 text-amber-600" />,
  drawing: <FileText className="h-4 w-4 text-emerald-600" />,
  'change-order': <GitBranch className="h-4 w-4 text-orange-600" />,
  invoice: <FileText className="h-4 w-4 text-rose-600" />,
  safety: <CheckCircle className="h-4 w-4 text-teal-600" />,
  procurement: <Layers className="h-4 w-4 text-indigo-600" />,
}

const typeBgColors: Record<string, string> = {
  workflow: 'bg-blue-50',
  quotation: 'bg-violet-50',
  boq: 'bg-amber-50',
  drawing: 'bg-emerald-50',
  'change-order': 'bg-orange-50',
  invoice: 'bg-rose-50',
  safety: 'bg-teal-50',
  procurement: 'bg-indigo-50',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [comment, setComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApprovals = mockApprovals.filter((a) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'my-approvals' && a.category === 'my-approvals') ||
      (activeTab === 'my-requests' && a.category === 'my-requests')
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const pendingCount = mockApprovals.filter((a) => a.status === 'pending').length

  const handleAction = (id: string, type: 'approve' | 'reject') => {
    setSelectedApproval(id)
    setActionType(type)
    setCommentDialogOpen(true)
  }

  const confirmAction = () => {
    setCommentDialogOpen(false)
    setComment('')
    setSelectedApproval(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Pending Approvals
          </h1>
          <p className="text-muted-foreground">
            Review and approve pending items across all workflows.
          </p>
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1">
          {pendingCount} Pending
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All ({mockApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="my-approvals">
              My Approvals ({mockApprovals.filter((a) => a.category === 'my-approvals').length})
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              My Requests ({mockApprovals.filter((a) => a.category === 'my-requests').length})
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[220px]"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <ApprovalList
            approvals={filteredApprovals}
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="my-approvals" className="mt-4">
          <ApprovalList
            approvals={filteredApprovals}
            onAction={handleAction}
          />
        </TabsContent>
        <TabsContent value="my-requests" className="mt-4">
          <ApprovalList
            approvals={filteredApprovals}
            onAction={handleAction}
          />
        </TabsContent>
      </Tabs>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder={
                actionType === 'approve'
                  ? 'Add approval comments (optional)...'
                  : 'Provide reason for rejection...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                onClick={confirmAction}
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Confirm Approve
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-4 w-4" />
                    Confirm Reject
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApprovalList({
  approvals,
  onAction,
}: {
  approvals: typeof mockApprovals
  onAction: (id: string, type: 'approve' | 'reject') => void
}) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-sm text-muted-foreground">No pending approvals at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    typeBgColors[approval.type]
                  )}
                >
                  {typeIcons[approval.type]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{approval.title}</h4>
                    <Badge
                      className={cn(
                        'text-[10px] capitalize',
                        statusColors[approval.status]
                      )}
                    >
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{approval.subtitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(approval.requestedDate)}
                    </span>
                    <span>Requested by {approval.requestedBy}</span>
                    <span className="text-blue-600">&middot; {approval.step}</span>
                  </div>
                </div>
              </div>
              {approval.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onAction(approval.id, 'approve')}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onAction(approval.id, 'reject')}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/workflows/${approval.id.replace('APR', 'WF')}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
              {approval.status === 'approved' && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
