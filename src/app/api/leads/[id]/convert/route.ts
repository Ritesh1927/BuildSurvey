import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requireAuth, requireRole } from '@/lib/api-auth'

const CONVERT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const roleError = await requireRole([...CONVERT_ROLES])
  if (roleError) return roleError

  try {
    const session = await auth()
    const userId = session!.user!.id

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { clientId } = body

    const lead = await db.lead.findUnique({ where: { id } })
    if (!lead || lead.isDeleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status !== 'WON') {
      return NextResponse.json(
        { success: false, error: 'Only a WON lead can be converted to a client' },
        { status: 400 }
      )
    }

    if (lead.clientId) {
      return NextResponse.json(
        { success: false, error: 'This lead has already been converted' },
        { status: 409 }
      )
    }

    let resolvedClientId: string

    if (clientId) {
      // Linking to an existing client — e.g. this lead represents
      // repeat/additional business from a company already onboarded.
      const existingClient = await db.client.findUnique({ where: { id: clientId } })
      if (!existingClient || existingClient.isDeleted) {
        return NextResponse.json({ success: false, error: 'Client not found' }, { status: 400 })
      }
      resolvedClientId = existingClient.id
    } else {
      // Default path — the lead becomes a brand-new Client. Client
      // requires email and phone; Lead's are optional, so a lead
      // missing either can't be auto-converted into a valid client.
      if (!lead.email || !lead.phone) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lead is missing email or phone — fill these in before converting, or pass clientId to link to an existing client instead',
          },
          { status: 400 }
        )
      }

      try {
        const newClient = await db.client.create({
          data: {
            companyName: lead.company || lead.name,
            contactPerson: lead.name,
            email: lead.email,
            phone: lead.phone,
            notes: lead.notes || null,
            createdBy: userId,
          },
        })
        resolvedClientId = newClient.id
      } catch (error: any) {
        if (error?.code === 'P2002') {
          return NextResponse.json(
            {
              success: false,
              error: 'A client with this email already exists — pass clientId to link to it instead of creating a duplicate',
            },
            { status: 409 }
          )
        }
        throw error
      }
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        clientId: resolvedClientId,
        convertedAt: new Date(),
        updatedBy: userId,
      },
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      },
    })

    return NextResponse.json({ success: true, data: updatedLead })
  } catch (error) {
    console.error('POST /api/leads/[id]/convert error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
