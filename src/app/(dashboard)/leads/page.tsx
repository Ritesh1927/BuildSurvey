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
  NEW: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  CONTACTED: { label: 'Contacted', color: 'bg-violet-100 text-violet-800' },
  QUALIFIED: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-800' },
  PROPOSAL: { label: 'Proposal Sent', color: 'bg-amber-100 text-amber-800' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  WON: { label: 'Won', color: 'bg-emerald-100 text-emerald-800' },
  LOST: { label: 'Lost', color: 'bg-red-100 text-red-800' },
}

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
}

// Roles allowed to write via the API — matches src/app/api/leads route
// gates. Kept in sync manually since there's no shared source of truth
// for role tiers between frontend and backend yet.
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const DELETE_ROLES = ['SUPER_ADMIN', 'ADMIN']

export default function LeadsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role

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
    const won = leads.filter((l) => l.status === 'WON').length
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'NEW').length,
      converted: won,
      conversionRate: leads.length ? Math.round((won / leads.length) * 100) : 0,
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

  const handleConvert = (lead: LeadData) => {
    // Conversion itself (and the dialog that collects the client-only
    // fields a lead never captures) lives on the lead detail page — this
    // just gets there and opens it, rather than duplicating that form here
    // or converting instantly with everything left blank.
    router.push(`/leads/${lead.id}?convert=true`)
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
        const meta = STATUS_META[row.original.status] || { label: row.original.status, color: 'bg-gray-100 text-gray-800' }
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
        const canWrite = role && WRITE_ROLES.includes(role)
        const canDelete = role && DELETE_ROLES.includes(role)
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
          role && WRITE_ROLES.includes(role) ? (
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Leads" value={statusCounts.total} color="info" />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New Leads" value={statusCounts.new} color="default" />
        <StatCard icon={<ArrowUpRight className="h-5 w-5" />} label="Converted" value={statusCounts.converted} color="success" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Conversion Rate" value={`${statusCounts.conversionRate}%`} color="success" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[160px]">
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
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(PRIORITY_META).map(([value, meta]) => (
              <SelectItem key={value} value={value}>{meta.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all')
              setPriorityFilter('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

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
            role && WRITE_ROLES.includes(role)
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
        />
      )}
    </div>
  )
}
