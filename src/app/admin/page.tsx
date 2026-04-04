import Link from "next/link";
import { StatusBadge } from "./components/status-badge";
import { DeleteButton } from "./components/delete-button";
import { ErrorMessage } from "./components/error-message";
import { getAllVaraukset, type Varaus } from "@/lib/varaukset";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let varaukset: Varaus[] = [];
  let error: string | null = null;

  try {
    varaukset = await getAllVaraukset();
  } catch (err) {
    console.error("Failed to fetch varaukset:", err);
    error = err instanceof Error ? err.message : "Tuntematon virhe";
    varaukset = [];
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekEndDate = new Date(now);
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEnd = weekEndDate.toISOString().split("T")[0];

  const stats = {
    total: varaukset?.length ?? 0,
    today: varaukset?.filter(
      (v) => v.varaus_pvm === today
    ).length ?? 0,
    thisWeek: varaukset?.filter(
      (v) =>
        v.varaus_pvm >= today &&
        v.varaus_pvm <= weekEnd
    ).length ?? 0,
    open: varaukset?.filter(
      (v) => v.status === "vahvistettu"
    ).length ?? 0,
  };

  return (
    <div>
      {/* Virheilmoitus */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            title="Varausten lataus epäonnistui"
            message={error}
          />
        </div>
      )}

      {/* Tilastokortit */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
        <h2 className="text-base font-semibold text-zinc-100">Varaukset</h2>
        <Link
          href="/admin/varaukset/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Lisää varaus
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
            {varaukset?.map((v) => (
              <tr
                key={v.id}
                className="border-b border-zinc-700/50 hover:bg-zinc-800/30 transition"
              >
                <td className="px-4 py-3 text-zinc-300">
                  {v.varaus_pvm ? new Date(v.varaus_pvm).toLocaleDateString("fi-FI") : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-300">{v.palvelutyyppi}</td>
                <td className="px-4 py-3 text-zinc-300 truncate">
                  {v.lahto_osoite}
                </td>
                <td className="px-4 py-3 text-zinc-300 truncate">
                  {v.kohde_osoite}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {v.hinta_alv ? `${v.hinta_alv.toFixed(2)} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right space-x-2 flex">
                  <Link
                    href={`/admin/varaukset/${v.id}`}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                  >
                    Muokkaa
                  </Link>
                  <DeleteButton id={v.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!varaukset?.length && (
        <div className="text-center py-8 text-zinc-400">
          Ei varauksia.{" "}
          <Link href="/admin/varaukset/new" className="text-blue-400 hover:underline">
            Lisää ensimmäinen varaus
          </Link>
        </div>
      )}
    </div>
  );
}
