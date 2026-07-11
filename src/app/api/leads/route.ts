import { NextRequest, NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: string
  value: number
  assignee: string
  createdAt: string
  updatedAt: string
}

const mockLeads: Lead[] = [
  {
    id: 'LEAD-2026-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@buildtech.in',
    phone: '+91 98765 43210',
    company: 'BuildTech Construction',
    source: 'Website',
    status: 'new',
    value: 2500000,
    assignee: 'Saurabh Patil',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'LEAD-2026-002',
    name: 'Priya Sharma',
    email: 'priya@urbaninfra.com',
    phone: '+91 87654 32109',
    company: 'Urban Infrastructure Ltd',
    source: 'Referral',
    status: 'contacted',
    value: 5000000,
    assignee: 'Saurabh Patil',
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-14T14:00:00Z',
  },
  {
    id: 'LEAD-2026-003',
    name: 'Amit Patel',
    email: 'amit@greenhomes.co',
    phone: '+91 76543 21098',
    company: 'Green Homes Pvt Ltd',
    source: 'LinkedIn',
    status: 'qualified',
    value: 1800000,
    assignee: 'Saurabh Patil',
    createdAt: '2026-01-13T11:00:00Z',
    updatedAt: '2026-01-13T16:00:00Z',
  },
  {
    id: 'LEAD-2026-004',
    name: 'Neha Gupta',
    email: 'neha@skylinegroup.in',
    phone: '+91 65432 10987',
    company: 'Skyline Group',
    source: 'Trade Show',
    status: 'proposal',
    value: 8000000,
    assignee: 'Saurabh Patil',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T12:00:00Z',
  },
  {
    id: 'LEAD-2026-005',
    name: 'Vikram Singh',
    email: 'vikram@premierinfra.com',
    phone: '+91 54321 09876',
    company: 'Premier Infrastructure',
    source: 'Cold Call',
    status: 'negotiation',
    value: 12000000,
    assignee: 'Saurabh Patil',
    createdAt: '2026-01-11T07:00:00Z',
    updatedAt: '2026-01-11T15:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let filteredLeads = [...mockLeads]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLeads = filteredLeads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredLeads = filteredLeads.filter((lead) => lead.status === status)
    }

    const total = filteredLeads.length
    const startIndex = (page - 1) * limit
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      data: paginatedLeads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, source, value, assignee } = body

    if (!name || !email || !company) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and company are required' },
        { status: 400 }
      )
    }

    const newLead: Lead = {
      id: generateId('LEAD'),
      name,
      email,
      phone: phone || '',
      company,
      source: source || 'Direct',
      status: 'new',
      value: value || 0,
      assignee: assignee || 'Unassigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockLeads.push(newLead)

    return NextResponse.json(
      { success: true, data: newLead },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
