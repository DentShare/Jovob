import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const isProtected = pathname.startsWith('/create') || pathname.startsWith('/dashboard')

  // Redirect authenticated users away from login page
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtected && !isAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/create/:path*', '/dashboard/:path*'],
}
