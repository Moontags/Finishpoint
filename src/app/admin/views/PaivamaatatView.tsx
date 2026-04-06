'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { Toast, useToast } from './Toast'

type BlockedDate = { id: string; blocked_date: string; reason: string | null }

export function PaivamaatatView() {
  const [dates, setDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast, showSuccess, showError, hideToast } = useToast()

  async function loadDates() {
    const { data, error } = await getSupabaseAdmin()
      .from('blocked_dates')
      .select('*')
      .order('blocked_date')
    if (error) showError('Lataus epäonnistui: ' + error.message)
    else setDates(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadDates() }, [])

  async function addDate(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('blocked_dates')
      .insert({ blocked_date: date, reason: reason || null })
    if (error) {
      showError(error.message.includes('duplicate') ? 'Päivä on jo suljettu' : error.message)
    } else {
      showSuccess('Suljettu päivä lisätty!')
      setDate('')
      setReason('')
      await loadDates()
    }
    setSaving(false)
  }

  async function removeDate(id: string) {
    if (!confirm('Poistetaanko suljettu päivä?')) return
    const { error } = await getSupabaseAdmin().from('blocked_dates').delete().eq('id', id)
    if (error) showError('Poisto epäonnistui: ' + error.message)
    else { showSuccess('Päivä poistettu.'); await loadDates() }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <h1 className="text-xl font-semibold text-zinc-100">Päivämäärien hallinta</h1>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
        <h2 className="text-base font-medium text-zinc-100 mb-4">Lisää suljettu päivä</h2>
        <form onSubmit={addDate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Päivämäärä *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Syy (valinnainen)</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="esim. loma, huolto"
                className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            {saving ? 'Tallennetaan...' : 'Lisää suljettu päivä'}
          </button>
        </form>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
        <h2 className="text-base font-medium text-zinc-100 mb-4">
          Suljetut päivät ({dates.length})
        </h2>
        {loading ? (
          <p className="text-zinc-500 text-sm">Ladataan...</p>
        ) : dates.length === 0 ? (
          <p className="text-zinc-500 text-sm">Ei suljettuja päiviä.</p>
        ) : (
          <div className="space-y-2">
            {dates.map(bd => (
              <div key={bd.id} className="flex items-center justify-between bg-zinc-700/50 rounded px-4 py-3 border border-zinc-600">
                <div>
                  <span className="text-zinc-100 text-sm font-medium">
                    {new Date(bd.blocked_date + 'T00:00:00').toLocaleDateString('fi-FI', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                  {bd.reason && <span className="text-zinc-400 text-sm ml-3">— {bd.reason}</span>}
                </div>
                <button
                  onClick={() => removeDate(bd.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                >
                  Poista
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
