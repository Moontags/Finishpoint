import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StatusBadge } from "./components/status-badge";
import { DeleteButton } from "./components/delete-button";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("starts_at", { ascending: false });

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekEndDate = new Date(now);
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = weekEndDate.toISOString().split("T")[0];

  const stats = {
    total: bookings?.length ?? 0,
    today: bookings?.filter(
      (b) => b.starts_at?.split("T")[0] === today
    ).length ?? 0,
    thisWeek: bookings?.filter(
      (b) =>
        b.starts_at?.split("T")[0] >= today &&
        b.starts_at?.split("T")[0] <= weekEnd
    ).length ?? 0,
    open: bookings?.filter(
      (b) => b.status === "pending" || b.status === "confirmed"
    ).length ?? 0,
  };

  return (
    <div>
      {/* Tilastokortit */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Keikat yhteensä", value: stats.total },
          { label: "Tänään", value: stats.today },
          { label: "Tällä viikolla", value: stats.thisWeek },
          { label: "Avoimet", value: stats.open },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
          >
            <div className="text-xs text-zinc-400 mb-1">{s.label}</div>
            <div className="text-2xl font-semibold text-zinc-100">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Toimintopalkki */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-zinc-100">Keikat</h2>
        <Link
          href="/admin/bookings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Lisää keikka
        </Link>
      </div>

      {/* Keikkataulukko */}
      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800/50 border-b border-zinc-700">
            <tr>
              {["Päivä", "Palvelu", "Mistä", "Minne", "Hinta", "Tila", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-zinc-300"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {bookings?.map((b) => (
              <tr
                key={b.id}
                className="border-b border-zinc-700/50 hover:bg-zinc-800/30 transition"
              >
                <td className="px-4 py-3 text-zinc-300">
                  {b.starts_at ? new Date(b.starts_at).toLocaleDateString("fi-FI") : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-300">{b.service_type}</td>
                <td className="px-4 py-3 text-zinc-300 truncate">
                  {b.pickup_address}
                </td>
                <td className="px-4 py-3 text-zinc-300 truncate">
                  {b.delivery_address}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {b.price ? `${b.price} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 text-right space-x-2 flex">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                  >
                    Muokkaa
                  </Link>
                  <DeleteButton id={b.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!bookings?.length && (
        <div className="text-center py-8 text-zinc-400">
          Ei keikoita.{" "}
          <Link href="/admin/bookings/new" className="text-blue-400 hover:underline">
            Lisää ensimmäinen keikka
          </Link>
        </div>
      )}
    </div>
  );
}
