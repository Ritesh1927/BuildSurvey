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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

const CREATE_ROLES = ['SUPER_ADMIN', 'ADMIN']
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const DELETE_ROLES = ['SUPER_ADMIN']

export default function ClientsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

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

  const cities = useMemo(
    () => [...new Set(clients.map((c) => c.city).filter((c): c is string => !!c))].sort(),
    [clients]
  )

  const filteredClients = useMemo(() => {
    return clients.filter((client) => cityFilter === "all" || client.city === cityFilter)
  }, [clients, cityFilter])

  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalProjectsAcrossClients = clients.reduce((sum, c) => sum + c.totalProjects, 0)

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
          role && CREATE_ROLES.includes(role) ? (
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
        <StatCard icon={<FolderOpen className="h-6 w-6" />} label="Total Projects" value={totalProjectsAcrossClients} color="success" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Total Leads" value={clients.reduce((sum, c) => sum + c.totalLeads, 0)} color="default" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Clients</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search clients..."
                className="w-[250px]"
                onSearch={setSearchQuery}
              />
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
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
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{client.email}</TableCell>
                      <TableCell className="text-sm">{client.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{client.city || '—'}</span>
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
                            {role && WRITE_ROLES.includes(role) && (
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
                            {role && DELETE_ROLES.includes(role) && (
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
