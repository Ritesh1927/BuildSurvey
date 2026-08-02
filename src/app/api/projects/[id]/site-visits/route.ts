import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...READ_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const role = session!.user!.role
    const userId = session!.user!.id

    const { id: projectId } = await params

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project || project.isDeleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Engineer can only see this if they're the project's lead - everyone
    // else in READ_ROLES sees any project's visits (oversight).
    if (role === 'ENGINEER' && project.leadUserId !== userId) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const visits = await db.siteVisit.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { checkedInAt: 'desc' },
      include: {
        engineer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, data: visits })
  } catch (error) {
    console.error('GET /api/projects/[id]/site-visits error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
