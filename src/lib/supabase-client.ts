import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Yleinen client (kirjautumiseen)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client — lazy singleton (vältetään build-aikainen heitto tyhjällä avaimella)
let _adminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || ''
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_KEY puuttuu')
  _adminClient = createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _adminClient
}
