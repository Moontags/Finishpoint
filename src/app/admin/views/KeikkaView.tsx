'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { Toast, useToast } from './Toast'

type Varaus = {
  id: string
  asiakas_nimi: string | null
  asiakas_email: string | null
  asiakas_puhelin: string | null
  palvelutyyppi: string | null
  lahto_osoite: string | null
  kohde_osoite: string | null
  varaus_pvm: string | null
  aloitusaika: string | null
  lopetusaika: string | null
  hinta_alv: number | null
  hinta_alv0: number | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

type EditMode = 'list' | 'new' | string // string = varauksen id

const STATUS_COLORS: Record<string, string> = {
  vahvistettu: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  peruttu: 'bg-red-500/20 text-red-300 border-red-500/40',
  valmis: 'bg-green-500/20 text-green-300 border-green-500/40',
}

export function KeikkaView() {
  const [varaukset, setVaraukset] = useState<Varaus[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<EditMode>('list')
  const { toast, showSuccess, showError, hideToast } = useToast()

  async function loadVaraukset() {
    const { data, error } = await getSupabaseAdmin()
      .from('varaukset')
      .select('*')
      .order('varaus_pvm', { ascending: false })
    if (error) showError('Lataus epäonnistui: ' + error.message)
    else setVaraukset(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadVaraukset() }, [])

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const stats = {
    total: varaukset.length,
    today: varaukset.filter(v => v.varaus_pvm === today).length,
    thisWeek: varaukset.filter(v => v.varaus_pvm && v.varaus_pvm >= today && v.varaus_pvm <= weekEndStr).length,
    open: varaukset.filter(v => v.status === 'vahvistettu').length,
  }

  if (mode !== 'list') {
    const existing = mode === 'new' ? null : varaukset.find(v => v.id === mode) ?? null
    return (
      <VarausForm
        varaus={existing}
        onSaved={async (msg) => { showSuccess(msg); setMode('list'); await loadVaraukset() }}
        onDeleted={async () => { showSuccess('Varaus poistettu.'); setMode('list'); await loadVaraukset() }}
        onError={showError}
        onCancel={() => setMode('list')}
      />
    )
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Keikat yhteensä', value: stats.total },
          { label: 'Tänään', value: stats.today },
          { label: 'Tällä viikolla', value: stats.thisWeek },
          { label: 'Avoimet', value: stats.open },
        ].map(s => (
          <div key={s.label} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="text-xs text-zinc-400 mb-1">{s.label}</div>
            <div className="text-2xl font-semibold text-zinc-100">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-zinc-100">Varaukset</h2>
        <button
          onClick={() => setMode('new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Lisää varaus
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-400 py-8">Ladataan...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                {['Päivä', 'Palvelu', 'Mistä', 'Minne', 'Hinta', 'Tila', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-zinc-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {varaukset.map(v => (
                <tr key={v.id} className="border-b border-zinc-700/50 hover:bg-zinc-800/30 transition">
                  <td className="px-4 py-3 text-zinc-300">
                    {v.varaus_pvm ? new Date(v.varaus_pvm + 'T00:00:00').toLocaleDateString('fi-FI') : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{v.palvelutyyppi ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[140px] truncate">{v.lahto_osoite ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[140px] truncate">{v.kohde_osoite ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {v.hinta_alv != null ? `${v.hinta_alv.toFixed(2)} €` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-medium ${STATUS_COLORS[v.status ?? ''] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                      {v.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setMode(v.id)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      Muokkaa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {varaukset.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              Ei varauksia.{' '}
              <button onClick={() => setMode('new')} className="text-blue-400 hover:underline">
                Lisää ensimmäinen varaus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VarausForm({
  varaus, onSaved, onDeleted, onError, onCancel,
}: {
  varaus: Varaus | null
  onSaved: (msg: string) => void
  onDeleted: () => void
  onError: (msg: string) => void
  onCancel: () => void
}) {
  const isNew = varaus === null
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    asiakas_nimi: varaus?.asiakas_nimi ?? '',
    asiakas_email: varaus?.asiakas_email ?? '',
    asiakas_puhelin: varaus?.asiakas_puhelin ?? '',
    palvelutyyppi: varaus?.palvelutyyppi ?? '',
    lahto_osoite: varaus?.lahto_osoite ?? '',
    kohde_osoite: varaus?.kohde_osoite ?? '',
    varaus_pvm: varaus?.varaus_pvm ?? '',
    aloitusaika: varaus?.aloitusaika ?? '',
    lopetusaika: varaus?.lopetusaika ?? '',
    hinta_alv: varaus?.hinta_alv != null ? String(varaus.hinta_alv) : '',
    hinta_alv0: varaus?.hinta_alv0 != null ? String(varaus.hinta_alv0) : '',
    status: varaus?.status ?? 'vahvistettu',
  })

  function set(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      asiakas_nimi: form.asiakas_nimi || null,
      asiakas_email: form.asiakas_email,
      asiakas_puhelin: form.asiakas_puhelin || null,
      palvelutyyppi: form.palvelutyyppi,
      lahto_osoite: form.lahto_osoite,
      kohde_osoite: form.kohde_osoite,
      varaus_pvm: form.varaus_pvm,
      aloitusaika: form.aloitusaika,
      lopetusaika: form.lopetusaika,
      hinta_alv: form.hinta_alv ? parseFloat(form.hinta_alv) : null,
      hinta_alv0: form.hinta_alv0 ? parseFloat(form.hinta_alv0) : null,
      status: form.status,
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getSupabaseAdmin() as any
    let error
    if (isNew) {
      ;({ error } = await db.from('varaukset').insert({ ...data, created_at: new Date().toISOString() }))
    } else {
      ;({ error } = await db.from('varaukset').update(data).eq('id', varaus!.id))
    }

    setSaving(false)
    if (error) onError('Tallennus epäonnistui: ' + error.message)
    else onSaved(isNew ? 'Varaus lisätty!' : 'Muutokset tallennettu!')
  }

  async function handleDelete() {
    if (!varaus || !confirm('Poistetaanko varaus?')) return
    setDeleting(true)
    const { error } = await getSupabaseAdmin().from('varaukset').delete().eq('id', varaus.id)
    setDeleting(false)
    if (error) onError('Poisto epäonnistui: ' + error.message)
    else onDeleted()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-zinc-100">
          {isNew ? 'Uusi varaus' : 'Muokkaa varausta'}
        </h1>
        <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-300 text-sm">
          ← Takaisin
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Asiakkaan nimi</label>
          <input type="text" value={form.asiakas_nimi} onChange={e => set('asiakas_nimi', e.target.value)}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Sähköposti *</label>
            <input type="email" value={form.asiakas_email} onChange={e => set('asiakas_email', e.target.value)} required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Puhelin</label>
            <input type="tel" value={form.asiakas_puhelin} onChange={e => set('asiakas_puhelin', e.target.value)}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Palvelun tyyppi *</label>
          <select value={form.palvelutyyppi} onChange={e => set('palvelutyyppi', e.target.value)} required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm">
            <option value="">Valitse...</option>
            <option value="Ajoneuvokuljetukset">Ajoneuvokuljetukset</option>
            <option value="Kappaletavara">Kappaletavara</option>
            <option value="Muutot ja kierrätys">Muutot ja kierrätys</option>
            <option value="Muu kuljetus">Muu kuljetus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Mistä (osoite) *</label>
          <input type="text" value={form.lahto_osoite} onChange={e => set('lahto_osoite', e.target.value)} required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Minne (osoite) *</label>
          <input type="text" value={form.kohde_osoite} onChange={e => set('kohde_osoite', e.target.value)} required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Päivämäärä *</label>
            <input type="date" value={form.varaus_pvm} onChange={e => set('varaus_pvm', e.target.value)} required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Aloitusaika *</label>
            <input type="time" value={form.aloitusaika} onChange={e => set('aloitusaika', e.target.value)} required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Lopetusaika *</label>
            <input type="time" value={form.lopetusaika} onChange={e => set('lopetusaika', e.target.value)} required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Hinta (sis. ALV) €</label>
            <input type="number" step="0.01" value={form.hinta_alv} onChange={e => set('hinta_alv', e.target.value)}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Hinta (ALV 0%) €</label>
            <input type="number" step="0.01" value={form.hinta_alv0} onChange={e => set('hinta_alv0', e.target.value)}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Tila *</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm">
            <option value="vahvistettu">Vahvistettu</option>
            <option value="peruttu">Peruttu</option>
            <option value="valmis">Valmis</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition text-sm">
            {saving ? 'Tallennetaan...' : isNew ? 'Luo varaus' : 'Tallenna muutokset'}
          </button>
          <button type="button" onClick={onCancel}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded font-medium transition text-sm">
            Peruuta
          </button>
        </div>
      </form>

      {!isNew && (
        <div className="mt-4">
          <button onClick={handleDelete} disabled={deleting}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition text-sm">
            {deleting ? 'Poistetaan...' : 'Poista varaus'}
          </button>
        </div>
      )}
    </div>
  )
}
