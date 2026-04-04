'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SessionRefresher() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/admin/login')
        }
        if (event === 'TOKEN_REFRESHED') {
          router.refresh()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
