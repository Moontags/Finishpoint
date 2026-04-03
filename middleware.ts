import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options))
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isLogin    = pathname === '/admin/login'
  const isCallback = pathname === '/admin/auth/callback'
  const isSignout  = pathname === '/admin/auth/signout'
  const isAdmin    = pathname.startsWith('/admin')

  // Jos kirjautunut → ei pääse login-sivulle, ohjataan dashboardiin
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Jos ei kirjautunut → ei pääse admin-sivuille, ohjataan loginiin
  if (isAdmin && !isLogin && !isCallback && !isSignout && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
