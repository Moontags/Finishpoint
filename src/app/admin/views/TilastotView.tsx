'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-client'

type VarausRow = {
  id: string
  created_at: string | null
  varaus_pvm: string | null
  palvelutyyppi: string | null
  status: string | null
  hinta_alv?: number | null
}

type MonthlyStat = { key: string; label: string; count: number; revenue: number }

function toAmount(v: VarausRow): number {
  return typeof v.hinta_alv === 'number' ? v.hinta_alv : 0
}

function normalizeService(s: string | null): string {
  const v = (s ?? '').toLowerCase()
  if (v.includes('kappale')) return 'kappaletavara'
  if (v.includes('muutto')) return 'muutto'
  if (v.includes('kierr')) return 'kierratys'
  if (v.includes('ajoneuvo')) return 'ajoneuvo'
  return 'muu'
}

function normalizeStatus(s: string | null): 'new' | 'confirmed' | 'completed' | 'cancelled' {
  const v = (s ?? '').toLowerCase()
  if (v === 'confirmed' || v === 'vahvistettu') return 'confirmed'
  if (v === 'completed' || v === 'valmis') return 'completed'
  if (v === 'cancelled' || v === 'peruttu') return 'cancelled'
  return 'new'
}

function formatEuro(v: number) {
  return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function formatPercent(v: number) {
  if (!Number.isFinite(v)) return '-'
  if (v > 0) return `+${Math.round(v)} %`
  if (v < 0) return `${Math.round(v)} %`
  return '-'
}

function monthLabel(d: Date) {
  return new Intl.DateTimeFormat('fi-FI', { month: 'long', year: 'numeric' }).format(d)
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{ background: '#3f3f46', borderRadius: 4, height: 8, width: '100%', marginTop: 4 }}>
      <div style={{
        background: '#2563eb', borderRadius: 4, height: 8,
        width: `${Math.min(100, Math.max(0, percent))}%`, transition: 'width .3s',
      }} />
    </div>
  )
}

export function TilastotView() {
  const [list, setList] = useState<VarausRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabaseAdmin()
      .from('varaukset')
      .select('*')
      .order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        setList((data ?? []) as VarausRow[])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-zinc-400">Ladataan...</div>

  const totalBookings = list.length
  const totalRevenue = list.reduce((sum, b) => sum + toAmount(b), 0)
  const avgPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthMap = new Map<string, MonthlyStat>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, { key, label: monthLabel(d), count: 0, revenue: 0 })
  }

  const serviceCounts: Record<string, number> = { kappaletavara: 0, muutto: 0, kierratys: 0, ajoneuvo: 0 }
  const statusCounts: Record<string, number> = { new: 0, confirmed: 0, completed: 0, cancelled: 0 }
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]

  for (const varaus of list) {
    const created = varaus.created_at ? new Date(varaus.created_at) : null
    if (created && !isNaN(created.getTime())) {
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`
      const item = monthMap.get(key)
      if (item) { item.count++; item.revenue += toAmount(varaus) }
    }
    const sk = normalizeService(varaus.palvelutyyppi)
    if (sk in serviceCounts) serviceCounts[sk]++
    statusCounts[normalizeStatus(varaus.status)]++
    const ds = varaus.varaus_pvm ?? varaus.created_at
    if (ds) { const d = new Date(ds); if (!isNaN(d.getTime())) weekdayCounts[d.getDay()]++ }
  }

  const monthStats = Array.from(monthMap.values()).reverse()
  const thisMonthCount = monthMap.get(thisMonthKey)?.count ?? 0
  const mostUsedService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const weekdayNames = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai']
  const busiestWeekday = weekdayCounts.some(n => n > 0)
    ? weekdayNames[weekdayCounts.indexOf(Math.max(...weekdayCounts))]
    : '-'
  const lastTen = [...list].reverse().slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Keikat yhteensä', value: totalBookings },
          { label: 'Tulot yhteensä', value: formatEuro(totalRevenue) },
          { label: 'Keskihinta', value: formatEuro(avgPrice) },
          { label: 'Tänä kuuna', value: thisMonthCount },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Kuukausitulot (6 kk)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-300">
                <th className="px-2 py-2 text-left">Kuukausi</th>
                <th className="px-2 py-2 text-left">Keikat</th>
                <th className="px-2 py-2 text-left">Tulot</th>
                <th className="px-2 py-2 text-left">Muutos</th>
              </tr>
            </thead>
            <tbody>
              {monthStats.map((item, i) => {
                const prev = monthStats[i + 1]
                const change = prev && prev.revenue > 0 ? ((item.revenue - prev.revenue) / prev.revenue) * 100 : NaN
                return (
                  <tr key={item.key} className="border-b border-zinc-700/60 text-zinc-200">
                    <td className="px-2 py-2">{item.label}</td>
                    <td className="px-2 py-2">{item.count}</td>
                    <td className="px-2 py-2">{formatEuro(item.revenue)}</td>
                    <td className="px-2 py-2">{formatPercent(change)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-zinc-100">Palvelutyypit</h3>
          <div className="space-y-3">
            {[
              { label: 'Kappaletavara', value: serviceCounts.kappaletavara },
              { label: 'Muutto', value: serviceCounts.muutto },
              { label: 'Kierrätys', value: serviceCounts.kierratys },
              { label: 'Ajoneuvo', value: serviceCounts.ajoneuvo },
            ].map(row => {
              const pct = totalBookings > 0 ? (row.value / totalBookings) * 100 : 0
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-zinc-200">
                    <span>{row.label}</span><span>{Math.round(pct)} %</span>
                  </div>
                  <ProgressBar percent={pct} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-zinc-100">Status-jakauma</h3>
          <div className="space-y-3">
            {[
              { label: 'Vahvistettu', value: statusCounts.confirmed },
              { label: 'Valmis', value: statusCounts.completed },
              { label: 'Peruttu', value: statusCounts.cancelled },
              { label: 'Uusi', value: statusCounts.new },
            ].map(row => {
              const pct = totalBookings > 0 ? (row.value / totalBookings) * 100 : 0
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-zinc-200">
                    <span>{row.label}</span><span>{Math.round(pct)} %</span>
                  </div>
                  <ProgressBar percent={pct} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: 'Eniten käytetty palvelu', value: mostUsedService },
          { label: 'Vilkkain päivä', value: busiestWeekday },
          { label: 'Keskiarvo per keikka', value: formatEuro(avgPrice) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Viimeiset 10 keikkaa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-300">
                <th className="px-2 py-2 text-left">Päivä</th>
                <th className="px-2 py-2 text-left">Palvelu</th>
                <th className="px-2 py-2 text-left">Hinta</th>
                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {lastTen.map(v => (
                <tr key={v.id} className="border-b border-zinc-700/60 text-zinc-200">
                  <td className="px-2 py-2">
                    {v.varaus_pvm
                      ? new Date(v.varaus_pvm).toLocaleDateString('fi-FI')
                      : v.created_at ? new Date(v.created_at).toLocaleDateString('fi-FI') : '-'}
                  </td>
                  <td className="px-2 py-2">{v.palvelutyyppi ?? '-'}</td>
                  <td className="px-2 py-2">{formatEuro(toAmount(v))}</td>
                  <td className="px-2 py-2">{normalizeStatus(v.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
