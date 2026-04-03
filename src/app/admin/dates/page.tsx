import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { fi } from "date-fns/locale";

type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

async function addBlockedDate(formData: FormData) {
  "use server";
  const blocked_date = formData.get("blocked_date") as string;
  const reason = (formData.get("reason") as string) || null;
  if (!blocked_date) return;
  const db = createAdminClient();
  await db.from("blocked_dates").upsert({ blocked_date, reason }, { onConflict: "blocked_date" });
  revalidatePath("/admin/dates");
}

async function removeBlockedDate(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const db = createAdminClient();
  await db.from("blocked_dates").delete().eq("id", id);
  revalidatePath("/admin/dates");
}

function CalendarView({ blockedDates }: { blockedDates: string[] }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const blockedSet = new Set(blockedDates);

  // Pad the start with empty cells (Mon = 0)
  const startDow = (getDay(monthStart) + 6) % 7; // convert Sun=0 to Mon=0
  const dayNames = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-zinc-300">
        {format(today, "MMMM yyyy", { locale: fi })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {dayNames.map((d) => (
          <div key={d} className="py-1 text-center font-semibold text-zinc-500">
            {d}
          </div>
        ))}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isBlocked = blockedSet.has(dateStr);
          const isToday = dateStr === format(today, "yyyy-MM-dd");
          return (
            <div
              key={dateStr}
              className={`rounded-lg py-2 text-center font-semibold ${
                isBlocked
                  ? "bg-rose-700/35 text-rose-200"
                  : isToday
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-300"
              }`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function DatesPage() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blocked_dates")
    .select("*")
    .order("blocked_date", { ascending: true });

  const blockedDates = (data ?? []) as BlockedDate[];
  const blockedDateStrings = blockedDates.map((d) => d.blocked_date);

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Päivämäärät</h1>

      {error && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">
          Virhe: {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-700 bg-zinc-800/45 p-5">
          <CalendarView blockedDates={blockedDateStrings} />
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-800/45 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Lukitse päivä</h2>
          <form action={addBlockedDate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Päivämäärä</label>
              <input
                type="date"
                name="blocked_date"
                required
                className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Syy (valinnainen)</label>
              <input
                type="text"
                name="reason"
                placeholder="esim. loma"
                className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-zinc-500 bg-zinc-700 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-600"
            >
              Lisää lukittu päivä
            </button>
          </form>
        </div>
      </div>

      <div className="divide-y divide-zinc-700/70 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800/45">
        {blockedDates.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Ei lukittuja päiviä</p>
        ) : (
          blockedDates.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {format(new Date(d.blocked_date), "d.M.yyyy EEEE", { locale: fi })}
                </p>
                {d.reason && <p className="text-xs text-zinc-400">{d.reason}</p>}
              </div>
              <form action={removeBlockedDate}>
                <input type="hidden" name="id" value={d.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-rose-400/50 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-900/30"
                >
                  Poista
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
