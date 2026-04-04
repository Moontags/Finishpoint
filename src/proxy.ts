import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isLogin    = pathname === '/admin/login'
  const isCallback = pathname === '/admin/auth/callback'
  const isSignout  = pathname === '/admin/auth/signout'
  const isAdmin    = pathname.startsWith('/admin')

  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (isLogin && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  if (isAdmin && !isLogin && !isCallback && !isSignout && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
