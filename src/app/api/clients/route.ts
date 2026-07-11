import { NextRequest, NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  type: string
  status: string
  totalProjects: number
  totalRevenue: number
  createdAt: string
  updatedAt: string
}

const mockClients: Client[] = [
  {
    id: 'CLIENT-2026-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@buildtech.in',
    phone: '+91 98765 43210',
    company: 'BuildTech Construction',
    address: 'Mumbai, Maharashtra',
    type: 'contractor',
    status: 'active',
    totalProjects: 12,
    totalRevenue: 45000000,
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'CLIENT-2026-002',
    name: 'Priya Sharma',
    email: 'priya@urbaninfra.com',
    phone: '+91 87654 32109',
    company: 'Urban Infrastructure Ltd',
    address: 'Pune, Maharashtra',
    type: 'developer',
    status: 'active',
    totalProjects: 8,
    totalRevenue: 32000000,
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'CLIENT-2026-003',
    name: 'Amit Patel',
    email: 'amit@greenhomes.co',
    phone: '+91 76543 21098',
    company: 'Green Homes Pvt Ltd',
    address: 'Nashik, Maharashtra',
    type: 'developer',
    status: 'active',
    totalProjects: 5,
    totalRevenue: 18000000,
    createdAt: '2025-10-05T10:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
  },
  {
    id: 'CLIENT-2026-004',
    name: 'Neha Gupta',
    email: 'neha@skylinegroup.in',
    phone: '+91 65432 10987',
    company: 'Skyline Group',
    address: 'Thane, Maharashtra',
    type: 'builder',
    status: 'inactive',
    totalProjects: 3,
    totalRevenue: 12000000,
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    let filteredClients = [...mockClients]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.company.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredClients = filteredClients.filter((client) => client.status === status)
    }

    if (type) {
      filteredClients = filteredClients.filter((client) => client.type === type)
    }

    return NextResponse.json({
      success: true,
      data: filteredClients,
      total: filteredClients.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, address, type } = body

    if (!name || !email || !company) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and company are required' },
        { status: 400 }
      )
    }

    const newClient: Client = {
      id: generateId('CLIENT'),
      name,
      email,
      phone: phone || '',
      company,
      address: address || '',
      type: type || 'contractor',
      status: 'active',
      totalProjects: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockClients.push(newClient)

    return NextResponse.json(
      { success: true, data: newClient },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
