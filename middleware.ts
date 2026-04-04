import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLogin    = pathname === '/admin/login'
  const isCallback = pathname === '/admin/auth/callback'
  const isSignout  = pathname === '/admin/auth/signout'
  const isAdmin    = pathname.startsWith('/admin')

  // Tarkista Supabase-auth-cookie (esim. sb-access-token tai sb-refresh-token)
  const hasAuthCookie = request.cookies.has('sb-access-token') || request.cookies.has('sb-refresh-token')

  if (isLogin && hasAuthCookie) {
    return NextResponse.redirect(`${request.nextUrl.origin}/admin`)
  }

  if (isAdmin && !isLogin && !isCallback && !isSignout && !hasAuthCookie) {
    return NextResponse.redirect(`${request.nextUrl.origin}/admin/login`)
  }

  return NextResponse.next()
}

