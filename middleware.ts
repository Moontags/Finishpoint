import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'


export async function middleware(request) {
  // ...existing code...

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

