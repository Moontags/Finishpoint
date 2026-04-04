import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Aseta cookiet sekä requestiin että responseen
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
              })
            )
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Middleware auth error:', error)
    }

    const pathname = request.nextUrl.pathname
    const isLogin    = pathname === '/admin/login'
    const isCallback = pathname === '/admin/auth/callback'
    const isSignout  = pathname === '/admin/auth/signout'
    const isAdmin    = pathname.startsWith('/admin')

    if (isLogin && user) {
      return NextResponse.redirect(`${request.nextUrl.origin}/admin`)
    }

    if (isAdmin && !isLogin && !isCallback && !isSignout && !user) {
      return NextResponse.redirect(`${request.nextUrl.origin}/admin/login`)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    // Jos middleware kaatuu, anna käyttäjän jatkaa
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}


