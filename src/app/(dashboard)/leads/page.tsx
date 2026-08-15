'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Users,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowRightLeft,
  Trash2,
  UserPlus,
  Filter,
  Activity,
  XCircle,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { showSuccess, showError } from '@/components/ui/toast'
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'
import { generateLeadsReport, downloadPdf } from '@/lib/pdf-generator'

interface LeadData {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: string
  priority: string
  estimatedValue: number | null
  clientId: string | null
  assignedTo: { firstName: string; lastName: string } | null
  createdAt: string
  source: string | null
}

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

export default function LeadsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [leads, setLeads] = useState<LeadData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads?limit=100')
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load leads')
        setLeads([])
        return
      }
      setLeads(data.data)
    } catch {
      setError('Network error while loading leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false
      return true
    })
  }, [leads, statusFilter, priorityFilter])

  const statusCounts = useMemo(() => {
    const converted = leads.filter((l) => !!l.clientId).length
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'NEW').length,
      won: leads.filter((l) => l.status === 'WON').length,
      conversionRate: leads.length ? Math.round((converted / leads.length) * 100) : 0,
      inProgress: leads.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length,
      lost: leads.filter((l) => l.status === 'LOST').length,
    }
  }, [leads])

  const handleDelete = async (lead: LeadData) => {
    if (!confirm(`Delete lead "${lead.name}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete lead')
        return
      }
      showSuccess('Lead deleted')
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
    } catch {
      showError('Network error while deleting lead')
    }
  }

  const handleExportPdf = async (rows: LeadData[]) => {
    try {
      const bytes = await generateLeadsReport({
        generatedAt: formatDate(new Date()),
        rows: rows.map((lead) => ({
          name: lead.name,
          company: lead.company || '-',
          contact: lead.email || lead.phone || '-',
          status: STATUS_META[lead.status]?.label || lead.status,
          priority: PRIORITY_META[lead.priority]?.label || lead.priority,
          estimatedValue: lead.estimatedValue,
          assignedTo: lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned',
          createdAt: formatDate(lead.createdAt),
        })),
      })
      downloadPdf(bytes, `leads-export-${new Date().toISOString().slice(0, 10)}.pdf`)
      showSuccess('Download started — the leads report will be saved to your downloads folder')
    } catch {
      showError('Failed to generate the leads PDF')
    }
  }

  const handleConvert = (lead: LeadData) => {
    // Conversion is just saving the lead as Won — the detail page's edit
    // form reveals the client-only fields inline once status is Won, then
    // Save both updates the lead and creates the client in one step.
    router.push(`/leads/${lead.id}?edit=true`)
  }

  const columns: ColumnDef<LeadData, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {getInitials(row.original.name.split(' ')[0], row.original.name.split(' ')[1] || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.company || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[160px]">{row.original.email || '—'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{row.original.phone || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        // Won + converted is one state now, not two - a Won lead is
        // converted to a client in the same save (see the lead edit
        // form), so show a single "Converted" badge instead of stacking
        // Won next to it once that's happened.
        const isConverted = row.original.status === 'WON' && !!row.original.clientId
        const meta = isConverted
          ? { label: 'Converted', color: 'bg-emerald-600 text-white' }
          : STATUS_META[row.original.status] || { label: row.original.status, color: 'bg-gray-600 text-white' }
        return <Badge className={cn('text-[10px]', meta.color)}>{meta.label}</Badge>
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const meta = PRIORITY_META[row.original.priority] || { label: row.original.priority, color: '' }
        return <Badge variant="outline" className={cn('text-[10px]', meta.color)}>{meta.label}</Badge>
      },
    },
    {
      accessorKey: 'estimatedValue',
      header: 'Value',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.estimatedValue != null ? formatCurrency(row.original.estimatedValue) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const user = row.original.assignedTo
        if (!user) return <span className="text-xs text-muted-foreground">Unassigned</span>
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-muted text-[10px] font-medium">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{user.firstName} {user.lastName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const lead = row.original
        const canWrite = hasPermission(session?.user, 'leads:write')
        const canDelete = hasPermission(session?.user, 'leads:delete')
        const canConvert = canWrite && lead.status === 'WON' && !lead.clientId

        if (!canWrite && !canDelete) {
          return (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/leads/${lead.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          )
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/leads/${lead.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {canWrite && (
                <DropdownMenuItem asChild>
                  <Link href={`/leads/${lead.id}?edit=true`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              {canConvert && (
                <DropdownMenuItem onClick={() => handleConvert(lead)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Convert to Client
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(lead)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description="Track and manage your sales pipeline from inquiry to conversion."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Leads' },
        ]}
        actions={
          hasPermission(session?.user, 'leads:write') ? (
            <Button asChild>
              <Link href="/leads/new">
                <Plus className="mr-1 h-4 w-4" />
                Add Lead
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Leads" value={statusCounts.total} color="info" />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New Leads" value={statusCounts.new} color="default" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="In Progress" value={statusCounts.inProgress} color="warning" />
        <StatCard icon={<ArrowUpRight className="h-5 w-5" />} label="Won" value={statusCounts.won} color="success" />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Lost" value={statusCounts.lost} color="danger" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Conversion Rate" value={`${statusCounts.conversionRate}%`} color="success" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(PRIORITY_META).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setPriorityFilter('all')
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <div className="text-sm text-muted-foreground">{filteredLeads.length} of {leads.length} leads</div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading leads...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No leads found"
          description="No leads match your current filters. Try adjusting the filters or add a new lead."
          action={
            hasPermission(session?.user, 'leads:write')
              ? { label: 'Add Lead', onClick: () => (window.location.href = '/leads/new') }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          searchKey="name"
          searchPlaceholder="Search leads by name..."
          pageSize={10}
          showColumnVisibility={false}
          showExport
          onExport={handleExportPdf}
        />
      )}
    </div>
  )
}
