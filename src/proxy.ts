import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const PUBLIC_ROUTES = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
