import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname === '/login'
  const isProtected = request.nextUrl.pathname.startsWith('/create')

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/create/:path*'],
}
