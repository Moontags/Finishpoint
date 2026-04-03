import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { fi } from "date-fns/locale";

type Varaus = {
  id: string;
  palvelutyyppi: string;
  lahto_osoite: string;
  kohde_osoite: string;
  varaus_pvm: string;
  aloitusaika: string;
  lopetusaika: string;
  hinta_alv: number | null;
  status: string;
  asiakas_nimi: string | null;
  asiakas_email: string | null;
  created_at: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  vahvistettu: { label: "Vahvistettu", className: "bg-green-100 text-green-800" },
  peruttu: { label: "Peruttu", className: "bg-red-100 text-red-800" },
  valmis: { label: "Valmis", className: "bg-slate-100 text-slate-600" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default async function AdminDashboard() {
  const db = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [{ data: allBookings }, { count: todayCount }, { count: weekCount }, { count: monthCount }] =
    await Promise.all([
      db.from("varaukset").select("*").order("varaus_pvm", { ascending: false }).order("aloitusaika", { ascending: false }),
      db.from("varaukset").select("*", { count: "exact", head: true }).eq("varaus_pvm", today),
      db.from("varaukset").select("*", { count: "exact", head: true }).gte("varaus_pvm", weekStart).lte("varaus_pvm", weekEnd),
      db.from("varaukset").select("*", { count: "exact", head: true }).gte("varaus_pvm", monthStart).lte("varaus_pvm", monthEnd),
    ]);

  const bookings = (allBookings ?? []) as Varaus[];
  const openCount = bookings.filter((b) => b.status === "vahvistettu").length;

  const stats = [
    { label: "Tänään", value: todayCount ?? 0 },
    { label: "Tällä viikolla", value: weekCount ?? 0 },
    { label: "Avoimet keikat", value: openCount },
    { label: "Tässä kuussa", value: monthCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Keikat</h1>
        <Link
          href="/admin/bookings/new"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + Uusi keikka
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Päivä</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Aika</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Palvelu</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Mistä</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Minne</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Hinta</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tila</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Ei keikkoja
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {b.varaus_pvm
                        ? format(new Date(b.varaus_pvm), "d.M.yyyy", { locale: fi })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
                      {b.aloitusaika?.slice(0, 5)}–{b.lopetusaika?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{b.palvelutyyppi}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-36 truncate hidden md:table-cell">
                      {b.lahto_osoite}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-36 truncate hidden md:table-cell">
                      {b.kohde_osoite}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {b.hinta_alv != null ? `${b.hinta_alv} €` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Muokkaa
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
