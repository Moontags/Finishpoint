import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Tarkista ensin virheet query-parametreista
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  if (error || errorCode) {
    // Ohjaa login-sivulle selkeällä virheilmoituksella
    // EI pääsivulle
    const loginUrl = new URL('/admin/login', origin)
    loginUrl.searchParams.set('error', errorCode ?? error ?? 'auth_error')
    return NextResponse.redirect(loginUrl)
  }

  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c) => c.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        }
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(new URL('/admin', origin))
    }

    // Vaihto epäonnistui — ohjaa loginiin virhekoodilla
    const loginUrl = new URL('/admin/login', origin)
    loginUrl.searchParams.set('error', 'session_error')
    return NextResponse.redirect(loginUrl)
  }

  // Ei koodia eikä virhettä — ohjaa loginiin
  return NextResponse.redirect(new URL('/admin/login', origin))
}
