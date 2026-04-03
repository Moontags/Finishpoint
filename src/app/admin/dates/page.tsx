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
      <p className="text-sm font-medium text-slate-600 mb-2">
        {format(today, "MMMM yyyy", { locale: fi })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-slate-400 font-medium py-1">
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
              className={`text-center rounded-lg py-2 font-medium ${
                isBlocked
                  ? "bg-red-100 text-red-700"
                  : isToday
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600"
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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Kalenterinhallinta</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          Virhe: {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <CalendarView blockedDates={blockedDateStrings} />
        </div>

        {/* Add new blocked date */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Lukitse päivä</h2>
          <form action={addBlockedDate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Päivämäärä</label>
              <input
                type="date"
                name="blocked_date"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Syy (valinnainen)</label>
              <input
                type="text"
                name="reason"
                placeholder="esim. loma"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 transition-colors"
            >
              Lisää lukittu päivä
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {blockedDates.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">Ei lukittuja päiviä</p>
        ) : (
          blockedDates.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {format(new Date(d.blocked_date), "d.M.yyyy EEEE", { locale: fi })}
                </p>
                {d.reason && <p className="text-xs text-slate-400">{d.reason}</p>}
              </div>
              <form action={removeBlockedDate}>
                <input type="hidden" name="id" value={d.id} />
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
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
