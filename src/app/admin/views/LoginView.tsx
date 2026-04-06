'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Virheellinen sähköposti tai salasana')
      setLoading(false)
    }
    // Onnistuminen: onAuthStateChange päivittää session automaattisesti
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-100">Finishpoint Admin</h1>
          <p className="text-sm text-zinc-400 mt-1">Kirjaudu hallintapaneeliin</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Sähköposti</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="admin@finishpoint.fi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Salasana</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded text-sm font-medium transition"
          >
            {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
          </button>
        </form>
      </div>
    </div>
  )
}
