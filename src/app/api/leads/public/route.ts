import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Deliberately unauthenticated — this is the public "Get a Quote" intake
// endpoint. Only accepts the safe subset of Lead fields a website visitor
// should ever be able to set: source/status/priority/assignedToId are all
// forced server-side, never taken from the request body, same trust
// boundary as the authenticated /api/leads POST already enforces for
// non-Admin roles.
const MAX_LENGTH = 2000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, message } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !/^\+?[\d\s-]{10,}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'A valid phone number is required' }, { status: 400 })
    }

    for (const [field, value] of Object.entries({ name, email, phone, company, message })) {
      if (typeof value === 'string' && value.length > MAX_LENGTH) {
        return NextResponse.json({ success: false, error: `${field} is too long` }, { status: 400 })
      }
    }

    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: typeof company === 'string' ? company.trim() || null : null,
        source: 'Website',
        status: 'NEW',
        priority: 'MEDIUM',
        notes: typeof message === 'string' ? message.trim() || null : null,
      },
    })

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/leads/public error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
