import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requirePermission, hasPermission, hasRole } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const permError = await requirePermission('site_visits:read:all', 'site_visits:read:own')
  if (permError) return permError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id: projectId } = await params

    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project || project.isDeleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Scoped to own led project unless holding full access - everyone
    // with read:all sees any project's visits (oversight).
    if (!hasPermission(session!.user!, 'site_visits:read:all')) {
      if (!hasRole(session!.user!, 'ENGINEER') || project.leadUserId !== userId) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
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
