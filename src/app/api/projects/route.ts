import { NextRequest, NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'

interface Project {
  id: string
  name: string
  clientId: string
  clientName: string
  type: string
  status: string
  priority: string
  budget: number
  spent: number
  progress: number
  startDate: string
  endDate: string
  location: string
  description: string
  createdAt: string
  updatedAt: string
}

const mockProjects: Project[] = [
  {
    id: 'PROJ-2026-001',
    name: 'Green Valley Residency - Phase 2',
    clientId: 'CLIENT-2026-001',
    clientName: 'BuildTech Construction',
    type: 'residential',
    status: 'in_progress',
    priority: 'high',
    budget: 45000000,
    spent: 18000000,
    progress: 35,
    startDate: '2026-01-01',
    endDate: '2026-08-30',
    location: 'Pune, Maharashtra',
    description: 'Multi-story residential complex with 120 units',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'PROJ-2026-002',
    name: 'Metro Station Rehabilitation',
    clientId: 'CLIENT-2026-002',
    clientName: 'Urban Infrastructure Ltd',
    type: 'infrastructure',
    status: 'in_progress',
    priority: 'critical',
    budget: 120000000,
    spent: 78000000,
    progress: 65,
    startDate: '2025-06-01',
    endDate: '2026-06-30',
    location: 'Mumbai, Maharashtra',
    description: 'Structural assessment and rehabilitation of metro station',
    createdAt: '2025-05-20T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'PROJ-2026-003',
    name: 'Commercial Office Tower',
    clientId: 'CLIENT-2026-003',
    clientName: 'Green Homes Pvt Ltd',
    type: 'commercial',
    status: 'planning',
    priority: 'medium',
    budget: 85000000,
    spent: 0,
    progress: 5,
    startDate: '2026-03-01',
    endDate: '2027-03-31',
    location: 'Nashik, Maharashtra',
    description: 'G+15 premium office tower with smart building systems',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-13T12:00:00Z',
  },
  {
    id: 'PROJ-2026-004',
    name: 'Industrial Warehouse Complex',
    clientId: 'CLIENT-2026-001',
    clientName: 'BuildTech Construction',
    type: 'industrial',
    status: 'completed',
    priority: 'low',
    budget: 28000000,
    spent: 26500000,
    progress: 100,
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    location: 'Aurangabad, Maharashtra',
    description: 'Warehousing facility with loading docks',
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-12-31T10:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const clientId = searchParams.get('clientId') || ''

    let filteredProjects = [...mockProjects]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          project.clientName.toLowerCase().includes(searchLower) ||
          project.location.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredProjects = filteredProjects.filter((project) => project.status === status)
    }

    if (type) {
      filteredProjects = filteredProjects.filter((project) => project.type === type)
    }

    if (clientId) {
      filteredProjects = filteredProjects.filter((project) => project.clientId === clientId)
    }

    return NextResponse.json({
      success: true,
      data: filteredProjects,
      total: filteredProjects.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      clientId,
      clientName,
      type,
      priority,
      budget,
      startDate,
      endDate,
      location,
      description,
    } = body

    if (!name || !clientId || !clientName || !budget || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, client, budget, start date, and end date are required',
        },
        { status: 400 }
      )
    }

    const newProject: Project = {
      id: generateId('PROJ'),
      name,
      clientId,
      clientName,
      type: type || 'residential',
      status: 'planning',
      priority: priority || 'medium',
      budget,
      spent: 0,
      progress: 0,
      startDate,
      endDate,
      location: location || '',
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProjects.push(newProject)

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
