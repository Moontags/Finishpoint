import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { removeBlockedDate } from "./actions";
import { AddDateForm } from "./add-date-form";
import { DeleteDateButton } from "./delete-date-button";

export default async function DatesPage() {
  const db = getSupabaseAdminClient();
  let blockedDates: { id: string; blocked_date: string; reason: string | null }[] = [];
  let fetchError: string | null = null;

  if (db) {
    const { data, error } = await db
      .from("blocked_dates")
      .select("*")
      .order("blocked_date", { ascending: true });

    if (error) {
      fetchError = error.message;
      console.error("blocked_dates fetch:", error);
    } else {
      blockedDates = data ?? [];
    }
  } else {
    fetchError = "Tietokantayhteys puuttuu";
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Päivämäärien hallinta</h1>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
        <h2 className="text-base font-medium text-zinc-100 mb-4">Lisää suljettu päivä</h2>
        <AddDateForm />
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
        <h2 className="text-base font-medium text-zinc-100 mb-4">
          Suljetut päivät ({blockedDates.length})
        </h2>

        {fetchError && (
          <div className="bg-red-900/30 border border-red-700 rounded p-3 text-red-400 text-sm mb-4">
            Latausvirhe: {fetchError}
          </div>
        )}

        {blockedDates.length === 0 && !fetchError ? (
          <p className="text-zinc-500 text-sm">Ei suljettuja päiviä.</p>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div
                key={bd.id}
                className="flex items-center justify-between bg-zinc-700/50 rounded px-4 py-3 border border-zinc-600"
              >
                <div>
                  <span className="text-zinc-100 text-sm font-medium">
                    {new Date(bd.blocked_date + "T00:00:00").toLocaleDateString("fi-FI", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {bd.reason && (
                    <span className="text-zinc-400 text-sm ml-3">— {bd.reason}</span>
                  )}
                </div>
                <DeleteDateButton id={bd.id} removeAction={removeBlockedDate} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
