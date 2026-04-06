'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { Toast, useToast } from './Toast'

type Price = { id: string; key: string; value: number; label: string }

const PRICE_CATEGORIES: Record<string, { key: string; label: string }[]> = {
  'Kappaletavara': [
    { key: 'base_kappaletavara', label: 'Perustaksa' },
    { key: 'km_rate_tavara', label: 'Km-hinta' },
    { key: 'floor_extra', label: 'Kerrosraha' },
  ],
  'Muutto & kierrätys': [
    { key: 'base_muutto', label: 'Muuton perustaksa' },
    { key: 'base_kierratys', label: 'Kierrätyksen perustaksa' },
    { key: 'km_rate_muutto', label: 'Km-hinta' },
  ],
  'Ajoneuvokuljetukset': [
    { key: 'base_ajoneuvo_40', label: 'Perustaksa (4t)' },
    { key: 'base_ajoneuvo_80', label: 'Perustaksa (8t)' },
    { key: 'km_rate_ajoneuvo', label: 'Km-hinta' },
  ],
  'Verotus': [
    { key: 'vat_rate', label: 'ALV-prosentti' },
  ],
}

export function HinnatView() {
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const { toast, showSuccess, showError, hideToast } = useToast()

  async function loadPrices() {
    const { data, error } = await getSupabaseAdmin().from('prices').select('*')
    if (error) showError('Lataus epäonnistui')
    else setPrices(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadPrices() }, [])

  async function updatePrice(key: string, value: number, label: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('prices')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
    if (error) showError('Tallennus epäonnistui: ' + error.message)
    else showSuccess(`${label} päivitetty!`)
  }

  const priceMap = new Map(prices.map(p => [p.key, p.value]))

  if (loading) return <div className="text-zinc-400">Ladataan...</div>

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Laskuri & hinnat</h1>

      <div className="space-y-8">
        {Object.entries(PRICE_CATEGORIES).map(([category, items]) => (
          <div key={category} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-base font-semibold text-zinc-100 mb-4">{category}</h2>
            <div className="space-y-3">
              {items.map(({ key, label }) => (
                <PriceRow
                  key={key}
                  priceKey={key}
                  label={label}
                  initialValue={priceMap.get(key) ?? 0}
                  isPercent={key === 'vat_rate'}
                  onSave={(value) => updatePrice(key, value, label)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceRow({
  priceKey, label, initialValue, isPercent, onSave,
}: {
  priceKey: string; label: string; initialValue: number; isPercent: boolean
  onSave: (value: number) => Promise<void>
}) {
  const [value, setValue] = useState(String(initialValue))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(parseFloat(value))
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm text-zinc-400 mb-1">{label}</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={saving}
            className="flex-1 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
          <span className="text-zinc-400 text-sm self-center">{isPercent ? '%' : '€'}</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded text-sm font-medium transition"
      >
        {saving ? 'Tallennetaan...' : 'Tallenna'}
      </button>
    </form>
  )
}
