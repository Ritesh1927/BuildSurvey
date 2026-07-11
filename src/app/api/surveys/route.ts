import { NextRequest, NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'

interface Survey {
  id: string
  projectId: string
  projectName: string
  title: string
  type: string
  status: string
  assignee: string
  location: string
  scheduledDate: string
  completedDate: string | null
  findings: string
  priority: string
  createdAt: string
  updatedAt: string
}

const mockSurveys: Survey[] = [
  {
    id: 'SURVEY-2026-001',
    projectId: 'PROJ-2026-001',
    projectName: 'Green Valley Residency - Phase 2',
    title: 'Foundation Assessment Survey',
    type: 'structural',
    status: 'completed',
    assignee: 'Saurabh Patil',
    location: 'Plot A, Green Valley',
    scheduledDate: '2026-01-10',
    completedDate: '2026-01-10',
    findings: 'Foundation integrity verified. Soil bearing capacity: 250 kN/m². Recommended for next phase.',
    priority: 'high',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-10T16:00:00Z',
  },
  {
    id: 'SURVEY-2026-002',
    projectId: 'PROJ-2026-002',
    projectName: 'Metro Station Rehabilitation',
    title: 'Structural Load Testing',
    type: 'structural',
    status: 'in_progress',
    assignee: 'Saurabh Patil',
    location: 'Metro Station - Platform Level',
    scheduledDate: '2026-01-15',
    completedDate: null,
    findings: '',
    priority: 'critical',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'SURVEY-2026-003',
    projectId: 'PROJ-2026-001',
    projectName: 'Green Valley Residency - Phase 2',
    title: 'Site Topography Survey',
    type: 'topography',
    status: 'completed',
    assignee: 'Saurabh Patil',
    location: 'Plot B, Green Valley',
    scheduledDate: '2026-01-08',
    completedDate: '2026-01-08',
    findings: 'Site elevation: 635m ASL. Natural slope: 2.5%. Drainage pattern identified.',
    priority: 'medium',
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'SURVEY-2026-004',
    projectId: 'PROJ-2026-003',
    projectName: 'Commercial Office Tower',
    title: 'Geotechnical Investigation',
    type: 'geotechnical',
    status: 'scheduled',
    assignee: 'Saurabh Patil',
    location: 'Site Plot, Nashik',
    scheduledDate: '2026-02-01',
    completedDate: null,
    findings: '',
    priority: 'high',
    createdAt: '2026-01-13T10:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'SURVEY-2026-005',
    projectId: 'PROJ-2026-002',
    projectName: 'Metro Station Rehabilitation',
    title: 'Environmental Assessment',
    type: 'environmental',
    status: 'completed',
    assignee: 'Saurabh Patil',
    location: 'Metro Station - All Levels',
    scheduledDate: '2026-01-05',
    completedDate: '2026-01-07',
    findings: 'Asbestos detected in ceiling panels. Lead paint on structural columns. Remediation required.',
    priority: 'critical',
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-07T18:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const projectId = searchParams.get('projectId') || ''
    const assignee = searchParams.get('assignee') || ''

    let filteredSurveys = [...mockSurveys]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredSurveys = filteredSurveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(searchLower) ||
          survey.projectName.toLowerCase().includes(searchLower) ||
          survey.location.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredSurveys = filteredSurveys.filter((survey) => survey.status === status)
    }

    if (type) {
      filteredSurveys = filteredSurveys.filter((survey) => survey.type === type)
    }

    if (projectId) {
      filteredSurveys = filteredSurveys.filter((survey) => survey.projectId === projectId)
    }

    if (assignee) {
      filteredSurveys = filteredSurveys.filter((survey) =>
        survey.assignee.toLowerCase().includes(assignee.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredSurveys,
      total: filteredSurveys.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, projectName, title, type, assignee, location, scheduledDate, priority } =
      body

    if (!projectId || !title || !type || !scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'Project, title, type, and scheduled date are required' },
        { status: 400 }
      )
    }

    const newSurvey: Survey = {
      id: generateId('SURVEY'),
      projectId,
      projectName: projectName || '',
      title,
      type,
      status: 'scheduled',
      assignee: assignee || 'Unassigned',
      location: location || '',
      scheduledDate,
      completedDate: null,
      findings: '',
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockSurveys.push(newSurvey)

    return NextResponse.json(
      { success: true, data: newSurvey },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}
