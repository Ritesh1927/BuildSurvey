"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Building2,
  Download,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
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

const mockClients = [
  {
    id: "CLT-001",
    companyName: "L&T Realty",
    contactPerson: "Rajesh Kumar",
    email: "rajesh.kumar@lntrealty.com",
    phone: "+91 98765 43210",
    city: "Mumbai",
    state: "Maharashtra",
    projectsCount: 5,
    totalRevenue: 42500000,
    status: "Active",
    rating: 4.8,
    gstNumber: "27AABCL1234F1ZP",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-002",
    companyName: "Tata Projects Ltd",
    contactPerson: "Anand Sharma",
    email: "anand.sharma@tataprojects.com",
    phone: "+91 98123 45678",
    city: "Hyderabad",
    state: "Telangana",
    projectsCount: 8,
    totalRevenue: 78900000,
    status: "Active",
    rating: 4.9,
    gstNumber: "36AABCT1234F1ZQ",
    type: "Construction Company",
  },
  {
    id: "CLT-003",
    companyName: "DLF Limited",
    contactPerson: "Priya Mehta",
    email: "priya.mehta@dlf.in",
    phone: "+91 99876 54321",
    city: "Gurugram",
    state: "Haryana",
    projectsCount: 12,
    totalRevenue: 125000000,
    status: "Active",
    rating: 4.7,
    gstNumber: "06AABCD1234F1ZR",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-004",
    companyName: "NHAI (National Highways Authority)",
    contactPerson: "Suresh Patel",
    email: "suresh.patel@nhai.gov.in",
    phone: "+91 11 24365789",
    city: "New Delhi",
    state: "Delhi",
    projectsCount: 15,
    totalRevenue: 234000000,
    status: "Active",
    rating: 4.5,
    gstNumber: "07AAACN1234F1ZS",
    type: "Government Body",
  },
  {
    id: "CLT-005",
    companyName: "Godrej Properties",
    contactPerson: "Neha Agarwal",
    email: "neha.agarwal@godrejprop.com",
    phone: "+91 98234 56789",
    city: "Pune",
    state: "Maharashtra",
    projectsCount: 7,
    totalRevenue: 67800000,
    status: "Active",
    rating: 4.6,
    gstNumber: "27AABCG1234F1ZT",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-006",
    companyName: "Shapoorji Pallonji & Co",
    contactPerson: "Vikram Joshi",
    email: "vikram.joshi@shapoorji.com",
    phone: "+91 98765 12345",
    city: "Mumbai",
    state: "Maharashtra",
    projectsCount: 4,
    totalRevenue: 35600000,
    status: "Active",
    rating: 4.4,
    gstNumber: "27AABCS1234F1ZU",
    type: "Construction Company",
  },
  {
    id: "CLT-007",
    companyName: "Brigade Enterprises",
    contactPerson: "Arjun Reddy",
    email: "arjun.reddy@brigade.in",
    phone: "+91 99456 78901",
    city: "Bangalore",
    state: "Karnataka",
    projectsCount: 6,
    totalRevenue: 54300000,
    status: "Active",
    rating: 4.3,
    gstNumber: "29AABCB1234F1ZV",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-008",
   companyName: "Ircon International Ltd",
    contactPerson: "Manish Gupta",
    email: "manish.gupta@ircon.co.in",
    phone: "+91 11 23456789",
    city: "New Delhi",
    state: "Delhi",
    projectsCount: 9,
    totalRevenue: 156700000,
    status: "Active",
    rating: 4.6,
    gstNumber: "07AABCI1234F1ZW",
    type: "Government Body",
  },
  {
    id: "CLT-009",
    companyName: "Oberoi Realty",
    contactPerson: "Sanjay Kulkarni",
    email: "sanjay.kulkarni@oberoirealty.com",
    phone: "+91 98345 67890",
    city: "Mumbai",
    state: "Maharashtra",
    projectsCount: 3,
    totalRevenue: 28900000,
    status: "Active",
    rating: 4.8,
    gstNumber: "27AABCO1234F1ZX",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-010",
    companyName: "Adani Realty",
    contactPerson: "Karan Bhatt",
    email: "karan.bhatt@adanirealty.com",
    phone: "+91 99876 12345",
    city: "Ahmedabad",
    state: "Gujarat",
    projectsCount: 10,
    totalRevenue: 189000000,
    status: "Active",
    rating: 4.5,
    gstNumber: "24AABCA1234F1ZY",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-011",
   companyName: "Larsen & Toubro (Construction)",
    contactPerson: "Deepak Nair",
    email: "deepak.nair@lt.com",
    phone: "+91 98123 98765",
    city: "Chennai",
    state: "Tamil Nadu",
    projectsCount: 11,
    totalRevenue: 210000000,
    status: "Active",
    rating: 4.7,
    gstNumber: "33AABCL1234F1ZA",
    type: "Construction Company",
  },
  {
    id: "CLT-012",
    companyName: "Hindustan Construction Co",
    contactPerson: "Ravi Shankar",
    email: "ravi.shankar@hcc.in",
    phone: "+91 98234 87654",
    city: "Mumbai",
    state: "Maharashtra",
    projectsCount: 6,
    totalRevenue: 78900000,
    status: "Active",
    rating: 4.2,
    gstNumber: "27AABCH1234F1ZB",
    type: "Construction Company",
  },
  {
    id: "CLT-013",
    companyName: "Jaypee Infratech",
    contactPerson: "Ashok Verma",
    email: "ashok.verma@jaypee.in",
    phone: "+91 99123 45678",
    city: "Noida",
    state: "Uttar Pradesh",
    projectsCount: 4,
    totalRevenue: 32100000,
    status: "Inactive",
    rating: 3.8,
    gstNumber: "09AABCJ1234F1ZC",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-014",
    companyName: "Bengaluru Metro Rail Corp",
    contactPerson: "Venkatesh Iyer",
    email: "venkatesh.iyer@bmrcl.co.in",
    phone: "+91 80 23456789",
    city: "Bangalore",
    state: "Karnataka",
    projectsCount: 3,
    totalRevenue: 45600000,
    status: "Active",
    rating: 4.4,
    gstNumber: "29AABCB1234F1ZD",
    type: "Government Body",
  },
  {
    id: "CLT-015",
    companyName: "Prestige Estates Projects",
    contactPerson: "Meera Rao",
    email: "meera.rao@prestigeestates.com",
    phone: "+91 99456 23456",
    city: "Bangalore",
    state: "Karnataka",
    projectsCount: 5,
    totalRevenue: 61200000,
    status: "Active",
    rating: 4.5,
    gstNumber: "29AABCP1234F1ZE",
    type: "Real Estate Developer",
  },
  {
    id: "CLT-016",
    companyName: "GMR Infrastructure Ltd",
    contactPerson: "Rakesh Sachdev",
    email: "rakesh.sachdev@gmrgroup.in",
    phone: "+91 11 47654321",
    city: "New Delhi",
    state: "Delhi",
    projectsCount: 7,
    totalRevenue: 98700000,
    status: "Active",
    rating: 4.3,
    gstNumber: "07AABCG1234F1ZF",
    type: "Infrastructure Developer",
  },
  {
    id: "CLT-017",
    companyName: "Nagaraj Construction Co",
    contactPerson: "Srinivas Murthy",
    email: "srinivas@nagarajconstruction.com",
    phone: "+91 98456 78901",
    city: "Mysore",
    state: "Karnataka",
    projectsCount: 2,
    totalRevenue: 12400000,
    status: "Inactive",
    rating: 3.9,
    gstNumber: "29AABCN1234F1ZG",
    type: "Construction Company",
  },
]

const cities = [...new Set(mockClients.map((c) => c.city))].sort()
const statuses = ["Active", "Inactive"]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredClients = useMemo(() => {
    return mockClients.filter((client) => {
      const matchesSearch =
        searchQuery === "" ||
        client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCity =
        cityFilter === "all" || client.city === cityFilter

      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter

      return matchesSearch && matchesCity && matchesStatus
    })
  }, [searchQuery, cityFilter, statusFilter])

  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const activeProjects = mockClients.reduce((sum, c) => sum + c.projectsCount, 0)
  const avgRating =
    mockClients.reduce((sum, c) => sum + c.rating, 0) / mockClients.length

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
          <Link href="/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-6 w-6" />}
          label="Total Clients"
          value={mockClients.length}
          change={12}
          trend="up"
          color="info"
        />
        <StatCard
          icon={<FolderIcon />}
          label="Active Projects"
          value={activeProjects}
          change={8}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={18}
          trend="up"
          color="default"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          label="Average Rating"
          value={avgRating.toFixed(1)}
          change={3}
          trend="up"
          color="warning"
        />
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
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-center">Projects</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Status</TableHead>
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
                        <p className="text-xs text-muted-foreground">{client.type}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{client.contactPerson}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.email}
                  </TableCell>
                  <TableCell className="text-sm">{client.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{client.city}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="info">{client.projectsCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(client.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        client.status === "Active" ? "success" : "secondary"
                      }
                    >
                      {client.status}
                    </Badge>
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
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}
