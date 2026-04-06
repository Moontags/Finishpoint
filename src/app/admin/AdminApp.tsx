'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { Session } from '@supabase/supabase-js'

import { LoginView } from './views/LoginView'
import { KeikkaView } from './views/KeikkaView'
import { TilastotView } from './views/TilastotView'
import { AsiakkaatView } from './views/AsiakkaatView'
import { HinnatView } from './views/HinnatView'
import { PaivamaatatView } from './views/PaivamaatatView'
import { TarjouspyynnotView } from './views/TarjouspyynnotView'
import { AsetuksetView } from './views/AsetuksetView'

type View = 'keikat' | 'tilastot' | 'asiakkaat' | 'hinnat' | 'paivamaarat' | 'tarjouspyynnot' | 'asetukset'

const NAV_ITEMS: [View, string][] = [
  ['keikat', 'Keikat'],
  ['tilastot', 'Tilastot'],
  ['asiakkaat', 'Asiakkaat'],
  ['hinnat', 'Laskuri & hinnat'],
  ['paivamaarat', 'Päivämäärät'],
  ['tarjouspyynnot', 'Tarjouspyynnöt'],
  ['asetukset', 'Asetukset'],
]

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('keikat')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#252525] flex items-center justify-center">
        <div className="text-zinc-400">Ladataan...</div>
      </div>
    )
  }

  if (!session) {
    return <LoginView />
  }

  return (
    <div className="flex min-h-screen bg-[#252525] text-zinc-100">
      <nav className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="font-semibold text-zinc-100">Finishpoint</div>
          <div className="text-xs text-zinc-500">Hallintapaneeli</div>
        </div>

        <div className="flex-1 py-4">
          {NAV_ITEMS.map(([view, label]) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`w-full text-left px-4 py-2 text-sm transition flex items-center gap-2 ${
                currentView === view
                  ? 'text-zinc-100 bg-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === view ? 'bg-blue-400' : 'bg-zinc-600'}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full text-left text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            Kirjaudu ulos
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-auto">
        {currentView === 'keikat' && <KeikkaView />}
        {currentView === 'tilastot' && <TilastotView />}
        {currentView === 'asiakkaat' && <AsiakkaatView />}
        {currentView === 'hinnat' && <HinnatView />}
        {currentView === 'paivamaarat' && <PaivamaatatView />}
        {currentView === 'tarjouspyynnot' && <TarjouspyynnotView />}
        {currentView === 'asetukset' && <AsetuksetView />}
      </main>
    </div>
  )
}
