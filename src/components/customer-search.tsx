"use client";

import { useMemo, useState } from "react";

type BookingHistory = {
  id: string;
  service_type: string | null;
  pickup_address: string | null;
  delivery_address: string | null;
  status: string | null;
  starts_at: string | null;
  scheduled_date: string | null;
  price: number;
};

export type Customer = {
  name: string | null;
  email: string;
  phone: string | null;
  bookings: BookingHistory[];
  totalSpent: number;
  latestBookingAt: string | null;
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fi-FI");
}

function CustomerTable({ customers }: { customers: Customer[] }) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-800/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 text-zinc-300">
            <th className="px-3 py-2 text-left">Nimi</th>
            <th className="px-3 py-2 text-left">Sahkoposti</th>
            <th className="px-3 py-2 text-left">Puhelin</th>
            <th className="px-3 py-2 text-left">Keikat</th>
            <th className="px-3 py-2 text-left">Yhteensa</th>
            <th className="px-3 py-2 text-left">Viimeisin keikka</th>
            <th className="px-3 py-2 text-left">Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const open = !!openRows[customer.email];
            return (
              <>
                <tr key={customer.email} className="border-b border-zinc-700/60 text-zinc-200">
                  <td className="px-3 py-2">{customer.name || "-"}</td>
                  <td className="px-3 py-2">{customer.email}</td>
                  <td className="px-3 py-2">{customer.phone || "-"}</td>
                  <td className="px-3 py-2">{customer.bookings.length} kpl</td>
                  <td className="px-3 py-2">{formatEuro(customer.totalSpent)}</td>
                  <td className="px-3 py-2">{formatDate(customer.latestBookingAt)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenRows((prev) => ({
                          ...prev,
                          [customer.email]: !prev[customer.email],
                        }))
                      }
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {open ? "Piilota historia" : "Nayta historia"}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-zinc-700/60 bg-zinc-900/30" key={`${customer.email}-history`}>
                    <td className="px-3 py-3" colSpan={7}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-zinc-700 text-zinc-400">
                              <th className="px-2 py-2 text-left">Paiva</th>
                              <th className="px-2 py-2 text-left">Palvelu</th>
                              <th className="px-2 py-2 text-left">Mista -&gt; Minne</th>
                              <th className="px-2 py-2 text-left">Hinta</th>
                              <th className="px-2 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customer.bookings.map((booking) => (
                              <tr key={booking.id} className="border-b border-zinc-700/40 text-zinc-300">
                                <td className="px-2 py-2">{formatDate(booking.scheduled_date ?? booking.starts_at)}</td>
                                <td className="px-2 py-2">{booking.service_type ?? "-"}</td>
                                <td className="px-2 py-2">{booking.pickup_address ?? "-"} -&gt; {booking.delivery_address ?? "-"}</td>
                                <td className="px-2 py-2">{formatEuro(booking.price)}</td>
                                <td className="px-2 py-2">{booking.status ?? "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerSearch({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        (c.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        (c.phone ?? "").includes(query)
      ),
    [customers, query]
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hae nimella, sahkopostilla tai puhelimella..."
        className="mb-4 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
      />
      <CustomerTable customers={filtered} />
    </div>
  );
}
