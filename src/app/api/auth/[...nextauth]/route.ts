import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params
  const action = resolvedParams.nextauth?.[0] || ''

  switch (action) {
    case 'signin':
      return NextResponse.json({
        message: 'Sign in page',
        providers: ['credentials', 'google', 'microsoft'],
      })
    case 'session':
      return NextResponse.json({
        user: {
          id: 'USER-2026-001',
          name: 'Saurabh Patil',
          email: 'saurabh@buildsurvey.in',
          role: 'admin',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    case 'csrf':
      return NextResponse.json({
        csrfToken: 'mock-csrf-token-' + Date.now(),
      })
    case 'providers':
      return NextResponse.json({
        credentials: {
          id: 'credentials',
          name: 'Email & Password',
          type: 'credentials',
        },
        google: {
          id: 'google',
          name: 'Google',
          type: 'oauth',
          signinUrl: '/api/auth/signin/google',
        },
        microsoft: {
          id: 'microsoft',
          name: 'Microsoft',
          type: 'oauth',
          signinUrl: '/api/auth/signin/microsoft',
        },
      })
    default:
      return NextResponse.json({
        message: 'Auth endpoint',
        action,
      })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await params
  const action = resolvedParams.nextauth?.[0] || ''

  try {
    switch (action) {
      case 'signin':
        const body = await request.json()
        const { email, password } = body

        if (email && password) {
          return NextResponse.json({
            message: 'Sign in successful',
            user: {
              id: 'USER-2026-001',
              name: 'Saurabh Patil',
              email,
              role: 'admin',
            },
          })
        }

        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      case 'signout':
        return NextResponse.json({ message: 'Signed out successfully' })
      case 'callback':
        return NextResponse.json({ message: 'Callback processed' })
      default:
        return NextResponse.json({
          message: 'Auth POST endpoint',
          action,
        })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
