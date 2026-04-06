import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { addBlockedDate, removeBlockedDate } from "./actions";
import { DeleteButton } from "./delete-button";

export default async function DatesPage() {
  const supabase = getSupabaseAdminClient();
  const { data: blockedDates } = supabase
    ? await supabase.from("blocked_dates").select("*").order("blocked_date")
    : { data: null };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Suljetut päivät</h1>

      {/* OSIO 1 — Lisää uusi lukittu päivä */}
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 mb-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          Lisää suljettu päivä
        </h2>

        <form action={addBlockedDate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Päivämäärä *
            </label>
            <input
              type="date"
              name="date"
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Syy
            </label>
            <input
              type="text"
              name="reason"
              placeholder="esim. lomat, huolto"
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          >
            Lisää päivä
          </button>
        </form>
      </div>

      {/* OSIO 2 — Lista lukituista päivistä */}
      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          Suljetut päivät ({blockedDates?.length ?? 0})
        </h2>

        {blockedDates?.length ? (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div
                key={bd.id}
                className="flex justify-between items-center bg-zinc-700/50 p-3 rounded border border-zinc-600"
              >
                <div>
                  <div className="font-medium text-zinc-100">
                    {new Date(bd.blocked_date).toLocaleDateString("fi-FI")}
                  </div>
                  {bd.reason && (
                    <div className="text-xs text-zinc-400">{bd.reason}</div>
                  )}
                </div>
                <DeleteButton id={bd.id} action={removeBlockedDate} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">
            Ei suljettuja päiviä
          </div>
        )}
      </div>
    </div>
  );
}
