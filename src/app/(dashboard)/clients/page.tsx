"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Building2,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  FolderOpen,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { showSuccess, showError } from "@/components/ui/toast"

interface ClientRow {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  city: string | null
  state: string | null
  clientType: string | null
  totalProjects: number
  totalLeads: number
}

export default function ClientsPage() {
  const { data: session } = useSession()

  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients?limit=200${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load clients')
        setClients([])
        return
      }
      setClients(data.data)
    } catch {
      setError('Network error while loading clients')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Grouped case-insensitively so "ghaziabad" and "Ghaziabad" collapse
  // into one filter option instead of showing as two different cities -
  // new saves are normalized server-side, but older records may still
  // have inconsistent casing.
  const cities = useMemo(() => {
    const byKey = new Map<string, string>()
    for (const c of clients) {
      if (!c.city) continue
      const key = c.city.trim().toLowerCase()
      if (!byKey.has(key)) byKey.set(key, c.city.trim())
    }
    return [...byKey.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => cityFilter === "all" || client.city?.trim().toLowerCase() === cityFilter)
  }, [clients, cityFilter])

  const hasActiveFilters = !!searchQuery || cityFilter !== "all"
  const clearFilters = () => {
    setSearchQuery("")
    setCityFilter("all")
  }

  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // A client has totalLeads > 0 only if it was reached via lead conversion
  // (clientId on a Lead is exclusively set by that action - see
  // POST/PATCH /api/leads). Clients with no converted lead are the
  // "direct" ones - added straight to Clients, never a Lead.
  const directClientsCount = clients.filter((c) => c.totalLeads === 0).length

  const handleDelete = async (client: ClientRow) => {
    if (!confirm(`Delete client "${client.companyName}"? This cannot be undone from here.`)) return
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to delete client')
        return
      }
      showSuccess('Client deleted')
      setClients((prev) => prev.filter((c) => c.id !== client.id))
    } catch {
      showError('Network error while deleting client')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Management"
        description="Manage your construction clients, contractors, and government bodies"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Clients" },
        ]}
        actions={
          hasPermission(session?.user, 'clients:create') ? (
            <Link href="/clients/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Building2 className="h-6 w-6" />} label="Total Clients" value={clients.length} color="info" />
        <StatCard icon={<FolderOpen className="h-6 w-6" />} label="Direct Clients" value={directClientsCount} color="success" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Converted Leads" value={clients.reduce((sum, c) => sum + c.totalLeads, 0)} color="default" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <SearchInput
              placeholder="Search clients..."
              className="w-full max-w-sm"
              value={searchQuery}
              onSearch={setSearchQuery}
            />
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading clients...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-center">Projects</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link
                          href={`/clients/${client.id}`}
                          className="flex items-center gap-3 font-medium hover:text-primary transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {client.companyName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.companyName}</p>
                            <p className="text-xs text-muted-foreground">{client.clientType || '—'}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">{client.contactPerson}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="max-w-[160px] truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="max-w-[100px] truncate text-sm">{client.city || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="info">{client.totalProjects}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {hasPermission(session?.user, 'clients:write') && (
                              <DropdownMenuItem asChild>
                                <Link href={`/clients/${client.id}?edit=true`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${client.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`tel:${client.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </a>
                            </DropdownMenuItem>
                            {hasPermission(session?.user, 'clients:delete') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client)}>
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredClients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No clients found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredClients.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
