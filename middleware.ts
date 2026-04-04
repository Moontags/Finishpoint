import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // TÄRKEÄÄ: älä kirjoita logiikkaa ennen tätä getUser-kutsua
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isLogin    = pathname === '/admin/login'
  const isCallback = pathname === '/admin/auth/callback'
  const isSignout  = pathname === '/admin/auth/signout'
  const isAdmin    = pathname.startsWith('/admin')

  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  if (isAdmin && !isLogin && !isCallback && !isSignout && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // TÄRKEÄÄ: palauta supabaseResponse eikä NextResponse.next()
  // jotta cookiet välittyvät oikein
  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
