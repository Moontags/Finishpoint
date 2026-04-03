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
  vahvistettu: { label: "Vahvistettu", className: "bg-lime-700/35 text-lime-300" },
  peruttu: { label: "Peruttu", className: "bg-rose-700/35 text-rose-300" },
  valmis: { label: "Valmis", className: "bg-zinc-700/70 text-zinc-300" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-zinc-700/70 text-zinc-300" };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
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

  const monthRevenue = bookings
    .filter((booking) => booking.status !== "peruttu")
    .reduce((sum, booking) => sum + (booking.hinta_alv ?? 0), 0);

  const stats = [
    { label: "Tällä viikolla", value: `${weekCount ?? 0}`, suffix: "keikkaa" },
    { label: "Avoimet tarjoukset", value: `${openCount}`, suffix: "odottaa vastausta" },
    { label: "Tänään", value: `${todayCount ?? 0}`, suffix: "keikka" },
    {
      label: "Kuukauden tulot",
      value: `${Math.round(monthRevenue)} €`,
      suffix: `${monthCount ?? 0} keikkaa, sis. ALV`,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Keikat</h1>
        <Link
          href="/admin/bookings/new"
          className="rounded-xl border border-zinc-500 bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-700/70 transition-colors"
        >
          + Lisää keikka
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-700 bg-zinc-800/55 p-4">
            <p className="text-sm text-zinc-300">{s.label}</p>
            <p className="mt-1 text-4xl leading-none font-bold text-zinc-50">{s.value}</p>
            <p className="mt-1 text-sm text-zinc-400">{s.suffix}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-700 bg-zinc-800/45 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-700/90 px-4 py-3 md:px-6">
          <h2 className="text-2xl font-bold text-zinc-100">Tulevat keikat</h2>
          <button
            type="button"
            className="rounded-xl border border-zinc-500 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700/70 transition-colors"
          >
            Suodata
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-zinc-700/90 bg-zinc-900/30">
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Päivä</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Palvelu</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Mistä -&gt; Minne</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Hinta</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Tila</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-300">Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400">
                    Ei keikkoja
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-zinc-700/70 hover:bg-zinc-700/20 transition-colors">
                    <td className="px-4 py-3 text-zinc-100 whitespace-nowrap">
                      {b.varaus_pvm
                        ? format(new Date(b.varaus_pvm), "d.M.yyyy", { locale: fi })
                        : "—"}
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {b.aloitusaika?.slice(0, 5)}-{b.lopetusaika?.slice(0, 5)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-100 capitalize font-semibold">{b.palvelutyyppi}</td>
                    <td className="px-4 py-3 text-zinc-200 max-w-56 truncate">
                      {b.lahto_osoite} -&gt; {b.kohde_osoite}
                    </td>
                    <td className="px-4 py-3 text-zinc-100 whitespace-nowrap font-semibold">
                      {b.hinta_alv != null ? `${b.hinta_alv} €` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-700/70 transition-colors"
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
