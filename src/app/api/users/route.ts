import { NextRequest, NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: string
  avatar: string
  lastLogin: string
  createdAt: string
  updatedAt: string
}

const mockUsers: User[] = [
  {
    id: 'USER-2026-001',
    name: 'Saurabh Patil',
    email: 'saurabh@buildsurvey.in',
    phone: '+91 98765 43210',
    role: 'admin',
    department: 'Management',
    status: 'active',
    avatar: '/avatars/saurabh.jpg',
    lastLogin: '2026-01-15T08:00:00Z',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'USER-2026-002',
    name: 'Rahul Deshmukh',
    email: 'rahul@buildsurvey.in',
    phone: '+91 87654 32109',
    role: 'project_manager',
    department: 'Projects',
    status: 'active',
    avatar: '/avatars/rahul.jpg',
    lastLogin: '2026-01-15T09:00:00Z',
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'USER-2026-003',
    name: 'Priya Jadhav',
    email: 'priya@buildsurvey.in',
    phone: '+91 76543 21098',
    role: 'surveyor',
    department: 'Field Operations',
    status: 'active',
    avatar: '/avatars/priya.jpg',
    lastLogin: '2026-01-14T10:00:00Z',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'USER-2026-004',
    name: 'Amit Kulkarni',
    email: 'amit@buildsurvey.in',
    phone: '+91 65432 10987',
    role: 'analyst',
    department: 'Analytics',
    status: 'active',
    avatar: '/avatars/amit.jpg',
    lastLogin: '2026-01-13T10:00:00Z',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'USER-2026-005',
    name: 'Neha More',
    email: 'neha@buildsurvey.in',
    phone: '+91 54321 09876',
    role: 'document_controller',
    department: 'Document Control',
    status: 'inactive',
    avatar: '/avatars/neha.jpg',
    lastLogin: '2025-12-20T10:00:00Z',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const department = searchParams.get('department') || ''

    let filteredUsers = [...mockUsers]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.department.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status)
    }

    if (department) {
      filteredUsers = filteredUsers.filter(
        (user) => user.department.toLowerCase() === department.toLowerCase()
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role, department } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    const existingUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const newUser: User = {
      id: generateId('USER'),
      name,
      email,
      phone: phone || '',
      role,
      department: department || 'General',
      status: 'active',
      avatar: `/avatars/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      lastLogin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
