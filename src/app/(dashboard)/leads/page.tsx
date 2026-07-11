'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
import { Input } from '@/components/ui/input'
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
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils'

interface LeadData {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  statusLabel: string
  statusColor: string
  priority: string
  priorityLabel: string
  priorityColor: string
  estimatedValue: number
  assignedTo: { firstName: string; lastName: string } | null
  createdAt: string
  source: string
}

const leads: LeadData[] = [
  {
    id: 'LED-001', name: 'Vikram Patel', email: 'vikram@heritagebuilders.in', phone: '+91 98765 43210',
    company: 'Heritage Builders', status: 'NEW', statusLabel: 'New', statusColor: 'bg-blue-100 text-blue-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 2500000, assignedTo: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: '2026-07-10T10:00:00',
    source: 'Website',
  },
  {
    id: 'LED-002', name: 'Ananya Reddy', email: 'ananya@urbanspaces.co', phone: '+91 87654 32109',
    company: 'Urban Spaces Pvt. Ltd.', status: 'CONTACTED', statusLabel: 'Contacted', statusColor: 'bg-violet-100 text-violet-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 1800000, assignedTo: { firstName: 'Raj', lastName: 'Mehta' }, createdAt: '2026-07-09T14:30:00',
    source: 'Referral',
  },
  {
    id: 'LED-003', name: 'Deepak Joshi', email: 'deepak@greenfielddev.com', phone: '+91 76543 21098',
    company: 'Greenfield Developers', status: 'QUALIFIED', statusLabel: 'Qualified', statusColor: 'bg-emerald-100 text-emerald-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 4200000, assignedTo: { firstName: 'Neha', lastName: 'Gupta' }, createdAt: '2026-07-08T09:15:00',
    source: 'LinkedIn',
  },
  {
    id: 'LED-004', name: 'Meera Iyer', email: 'meera@skylinebuilders.in', phone: '+91 65432 10987',
    company: 'Skyline Builders', status: 'PROPOSAL_SENT', statusLabel: 'Proposal Sent', statusColor: 'bg-amber-100 text-amber-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 3100000, assignedTo: { firstName: 'Saurabh', lastName: 'Verma' }, createdAt: '2026-07-07T11:00:00',
    source: 'Referral',
  },
  {
    id: 'LED-005', name: 'Arjun Nair', email: 'arjun@metrohousing.co.in', phone: '+91 54321 09876',
    company: 'Metro Housing Ltd.', status: 'NEGOTIATION', statusLabel: 'Negotiation', statusColor: 'bg-orange-100 text-orange-800',
    priority: 'CRITICAL', priorityLabel: 'Critical', priorityColor: 'bg-red-100 text-red-800 border-red-200',
    estimatedValue: 5600000, assignedTo: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: '2026-07-06T16:45:00',
    source: 'Exhibition',
  },
  {
    id: 'LED-006', name: 'Kavitha Menon', email: 'kavitha@sunriseinfra.com', phone: '+91 43210 98765',
    company: 'Sunrise Infrastructure', status: 'WON', statusLabel: 'Won', statusColor: 'bg-emerald-100 text-emerald-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 2800000, assignedTo: { firstName: 'Raj', lastName: 'Mehta' }, createdAt: '2026-07-05T13:20:00',
    source: 'Website',
  },
  {
    id: 'LED-007', name: 'Rohan Gupta', email: 'rohan@pioneerconstruct.in', phone: '+91 32109 87654',
    company: 'Pioneer Constructions', status: 'NEW', statusLabel: 'New', statusColor: 'bg-blue-100 text-blue-800',
    priority: 'LOW', priorityLabel: 'Low', priorityColor: 'bg-gray-100 text-gray-700 border-gray-200',
    estimatedValue: 950000, assignedTo: null, createdAt: '2026-07-10T08:30:00',
    source: 'Cold Call',
  },
  {
    id: 'LED-008', name: 'Sneha Kapoor', email: 'sneha@apexrealty.co', phone: '+91 21098 76543',
    company: 'Apex Realty Corp.', status: 'CONTACTED', statusLabel: 'Contacted', statusColor: 'bg-violet-100 text-violet-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 1500000, assignedTo: { firstName: 'Neha', lastName: 'Gupta' }, createdAt: '2026-07-09T10:00:00',
    source: 'LinkedIn',
  },
  {
    id: 'LED-009', name: 'Manish Tiwari', email: 'manish@buildcraft.in', phone: '+91 10987 65432',
    company: 'BuildCraft India', status: 'LOST', statusLabel: 'Lost', statusColor: 'bg-red-100 text-red-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 1200000, assignedTo: { firstName: 'Saurabh', lastName: 'Verma' }, createdAt: '2026-07-04T09:00:00',
    source: 'Referral',
  },
  {
    id: 'LED-010', name: 'Pooja Singh', email: 'pooja@landmarkdev.com', phone: '+91 09876 54321',
    company: 'Landmark Developers', status: 'QUALIFIED', statusLabel: 'Qualified', statusColor: 'bg-emerald-100 text-emerald-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 3800000, assignedTo: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: '2026-07-07T15:30:00',
    source: 'Website',
  },
  {
    id: 'LED-011', name: 'Kiran Deshmukh', email: 'kiran@premierinfra.co.in', phone: '+91 98712 34567',
    company: 'Premier Infrastructure', status: 'PROPOSAL_SENT', statusLabel: 'Proposal Sent', statusColor: 'bg-amber-100 text-amber-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 2200000, assignedTo: { firstName: 'Raj', lastName: 'Mehta' }, createdAt: '2026-07-06T10:00:00',
    source: 'Referral',
  },
  {
    id: 'LED-012', name: 'Aishwarya Rao', email: 'aishwarya@zenithgroup.in', phone: '+91 87612 34567',
    company: 'Zenith Group', status: 'NEW', statusLabel: 'New', statusColor: 'bg-blue-100 text-blue-800',
    priority: 'LOW', priorityLabel: 'Low', priorityColor: 'bg-gray-100 text-gray-700 border-gray-200',
    estimatedValue: 800000, assignedTo: { firstName: 'Neha', lastName: 'Gupta' }, createdAt: '2026-07-10T11:00:00',
    source: 'Cold Call',
  },
  {
    id: 'LED-013', name: 'Sanjay Bhatt', email: 'sanjay@vistarahomes.com', phone: '+91 76512 34567',
    company: 'Vistaar Homes', status: 'NEGOTIATION', statusLabel: 'Negotiation', statusColor: 'bg-orange-100 text-orange-800',
    priority: 'CRITICAL', priorityLabel: 'Critical', priorityColor: 'bg-red-100 text-red-800 border-red-200',
    estimatedValue: 6200000, assignedTo: { firstName: 'Saurabh', lastName: 'Verma' }, createdAt: '2026-07-05T11:30:00',
    source: 'Exhibition',
  },
  {
    id: 'LED-014', name: 'Nisha Agarwal', email: 'nisha@primestructures.in', phone: '+91 65412 34567',
    company: 'Prime Structures', status: 'DISQUALIFIED', statusLabel: 'Disqualified', statusColor: 'bg-gray-100 text-gray-800',
    priority: 'LOW', priorityLabel: 'Low', priorityColor: 'bg-gray-100 text-gray-700 border-gray-200',
    estimatedValue: 500000, assignedTo: { firstName: 'Raj', lastName: 'Mehta' }, createdAt: '2026-07-03T14:00:00',
    source: 'Website',
  },
  {
    id: 'LED-015', name: 'Harsh Vardhan', email: 'harsh@atlasconstruction.co', phone: '+91 54312 34567',
    company: 'Atlas Construction', status: 'WON', statusLabel: 'Won', statusColor: 'bg-emerald-100 text-emerald-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 4500000, assignedTo: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: '2026-07-04T16:00:00',
    source: 'LinkedIn',
  },
  {
    id: 'LED-016', name: 'Tanvi Malhotra', email: 'tanvi@nobleedificers.com', phone: '+91 43212 34567',
    company: 'Noble Edificers', status: 'NEW', statusLabel: 'New', statusColor: 'bg-blue-100 text-blue-800',
    priority: 'MEDIUM', priorityLabel: 'Medium', priorityColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedValue: 1900000, assignedTo: null, createdAt: '2026-07-10T15:00:00',
    source: 'Referral',
  },
  {
    id: 'LED-017', name: 'Aditya Sharma', email: 'aditya@consortiumdev.in', phone: '+91 32112 34567',
    company: 'Consortium Developers', status: 'CONTACTED', statusLabel: 'Contacted', statusColor: 'bg-violet-100 text-violet-800',
    priority: 'HIGH', priorityLabel: 'High', priorityColor: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedValue: 3400000, assignedTo: { firstName: 'Neha', lastName: 'Gupta' }, createdAt: '2026-07-08T10:30:00',
    source: 'Website',
  },
]

const statusCounts = {
  total: leads.length,
  new: leads.filter((l) => l.status === 'NEW').length,
  converted: leads.filter((l) => l.status === 'WON').length,
  conversionRate: Math.round(
    (leads.filter((l) => l.status === 'WON').length / leads.length) * 100,
  ),
}

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false
      return true
    })
  }, [statusFilter, priorityFilter])

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
            <p className="text-xs text-muted-foreground">{row.original.company}</p>
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
            <span className="truncate max-w-[160px]">{row.original.email}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{row.original.phone}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={cn('text-[10px]', row.original.statusColor)}>
          {row.original.statusLabel}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('text-[10px]', row.original.priorityColor)}>
          {row.original.priorityLabel}
        </Badge>
      ),
    },
    {
      accessorKey: 'estimatedValue',
      header: 'Value',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{formatCurrency(row.original.estimatedValue)}</span>
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/leads/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/leads/${row.original.id}?edit=true`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Convert to Client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
          <Button asChild>
            <Link href="/leads/new">
              <Plus className="mr-1 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Leads"
          value={statusCounts.total}
          color="info"
        />
        <StatCard
          icon={<UserPlus className="h-5 w-5" />}
          label="New Leads"
          value={statusCounts.new}
          color="default"
        />
        <StatCard
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Converted"
          value={statusCounts.converted}
          color="success"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Conversion Rate"
          value={`${statusCounts.conversionRate}%`}
          change={8}
          trend="up"
          color="success"
        />
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
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUALIFIED">Qualified</SelectItem>
            <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
            <SelectItem value="DISQUALIFIED">Disqualified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
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
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No leads found"
          description="No leads match your current filters. Try adjusting the filters or add a new lead."
          action={{
            label: 'Add Lead',
            onClick: () => (window.location.href = '/leads/new'),
          }}
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
