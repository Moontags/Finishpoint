'use client'

import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { CustomerSearch, type Customer } from '@/components/customer-search'

type VarausRow = {
  id: string
  created_at: string | null
  varaus_pvm: string | null
  asiakas_nimi: string | null
  asiakas_email: string | null
  asiakas_puhelin: string | null
  palvelutyyppi: string | null
  status: string | null
  lahto_osoite: string | null
  kohde_osoite: string | null
  hinta_alv?: number | null
}

function varausAmount(v: VarausRow): number {
  return typeof v.hinta_alv === 'number' ? v.hinta_alv : 0
}

export function AsiakkaatView() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [newThisMonth, setNewThisMonth] = useState(0)
  const [loyalCount, setLoyalCount] = useState(0)

  useEffect(() => {
    getSupabaseAdmin()
      .from('varaukset')
      .select('*')
      .not('asiakas_email', 'is', null)
      .order('created_at', { ascending: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        const varaukset = (data ?? []) as VarausRow[]
        const grouped: Record<string, Customer> = {}

        for (const v of varaukset) {
          const email = v.asiakas_email
          if (!email) continue
          if (!grouped[email]) {
            grouped[email] = {
              name: v.asiakas_nimi,
              email,
              phone: v.asiakas_puhelin,
              bookings: [],
              totalSpent: 0,
              latestBookingAt: v.varaus_pvm ?? v.created_at,
            }
          }
          grouped[email].bookings.push({
            id: v.id,
            service_type: v.palvelutyyppi,
            pickup_address: v.lahto_osoite,
            delivery_address: v.kohde_osoite,
            status: v.status,
            starts_at: v.varaus_pvm,
            scheduled_date: v.varaus_pvm,
            price: varausAmount(v),
          })
          grouped[email].totalSpent += varausAmount(v)
          const candidate = v.varaus_pvm ?? v.created_at
          const currentLatest = grouped[email].latestBookingAt
          if (candidate && (!currentLatest || new Date(candidate) > new Date(currentLatest))) {
            grouped[email].latestBookingAt = candidate
          }
        }

        const list = Object.values(grouped).sort((a, b) => b.totalSpent - a.totalSpent)
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        setCustomers(list)
        setNewThisMonth(list.filter(c => {
          const latest = c.latestBookingAt ? new Date(c.latestBookingAt) : null
          return latest && latest >= monthStart
        }).length)
        setLoyalCount(list.filter(c => c.bookings.length >= 2).length)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-zinc-400">Ladataan...</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Asiakkaita yhteensä', value: customers.length },
          { label: 'Uusia tässä kuussa', value: newThisMonth },
          { label: 'Kanta-asiakkaita (2+ keikkaa)', value: loyalCount },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>
      <CustomerSearch customers={customers} />
    </div>
  )
}
