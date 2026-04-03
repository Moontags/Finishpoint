import { createClient } from "@/lib/supabase/server";

type BookingRow = {
  id: string;
  created_at: string | null;
  starts_at: string | null;
  service_type: string | null;
  status: string | null;
  price?: number | null;
  total_with_vat?: number | null;
};

type MonthlyStat = {
  key: string;
  label: string;
  count: number;
  revenue: number;
};

function toAmount(booking: BookingRow): number {
  const price = typeof booking.price === "number" ? booking.price : null;
  const total = typeof booking.total_with_vat === "number" ? booking.total_with_vat : null;
  return price ?? total ?? 0;
}

function normalizeService(serviceType: string | null): string {
  const value = (serviceType ?? "").toLowerCase();
  if (value.includes("kappale")) return "kappaletavara";
  if (value.includes("muutto")) return "muutto";
  if (value.includes("kierr")) return "kierratys";
  if (value.includes("ajoneuvo")) return "ajoneuvo";
  return "muu";
}

function normalizeStatus(status: string | null): "new" | "confirmed" | "completed" | "cancelled" {
  const value = (status ?? "").toLowerCase();
  if (value === "confirmed" || value === "vahvistettu") return "confirmed";
  if (value === "completed" || value === "valmis") return "completed";
  if (value === "cancelled" || value === "peruttu") return "cancelled";
  return "new";
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value > 0) return `+${Math.round(value)} %`;
  if (value < 0) return `${Math.round(value)} %`;
  return "-";
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("fi-FI", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      style={{
        background: "#e5e7eb",
        borderRadius: 4,
        height: 8,
        width: "100%",
        marginTop: 4,
      }}
    >
      <div
        style={{
          background: "#2563eb",
          borderRadius: 4,
          height: 8,
          width: `${Math.min(100, Math.max(0, percent))}%`,
          transition: "width .3s",
        }}
      />
    </div>
  );
}

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: true });

  const list = (bookings ?? []) as BookingRow[];
  const totalBookings = list.length;
  const totalRevenue = list.reduce((sum, b) => sum + toAmount(b), 0);
  const avgPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthMap = new Map<string, MonthlyStat>();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, {
      key,
      label: monthLabel(d),
      count: 0,
      revenue: 0,
    });
  }

  const serviceCounts: Record<string, number> = {
    kappaletavara: 0,
    muutto: 0,
    kierratys: 0,
    ajoneuvo: 0,
  };
  const statusCounts: Record<"new" | "confirmed" | "completed" | "cancelled", number> = {
    new: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

  for (const booking of list) {
    const amount = toAmount(booking);
    const created = booking.created_at ? new Date(booking.created_at) : null;
    if (created && !Number.isNaN(created.getTime())) {
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      const item = monthMap.get(key);
      if (item) {
        item.count += 1;
        item.revenue += amount;
      }
    }

    const serviceKey = normalizeService(booking.service_type);
    if (serviceKey in serviceCounts) {
      serviceCounts[serviceKey] += 1;
    }

    const statusKey = normalizeStatus(booking.status);
    statusCounts[statusKey] += 1;

    const daySource = booking.starts_at ?? booking.created_at;
    if (daySource) {
      const dayDate = new Date(daySource);
      if (!Number.isNaN(dayDate.getTime())) {
        weekdayCounts[dayDate.getDay()] += 1;
      }
    }
  }

  const monthStats = Array.from(monthMap.values()).reverse();
  const thisMonth = monthMap.get(thisMonthKey);
  const thisMonthCount = thisMonth?.count ?? 0;

  const mostUsedService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const weekdayNames = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
  const busiestWeekdayIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const busiestWeekday = weekdayCounts.some((n) => n > 0) ? weekdayNames[busiestWeekdayIndex] : "-";

  const lastTen = [...list].reverse().slice(0, 10);

  const serviceRows = [
    { label: "Kappaletavara", value: serviceCounts.kappaletavara },
    { label: "Muutto", value: serviceCounts.muutto },
    { label: "Kierratys", value: serviceCounts.kierratys },
    { label: "Ajoneuvo", value: serviceCounts.ajoneuvo },
  ];

  const statusRows = [
    { label: "New", value: statusCounts.new },
    { label: "Confirmed", value: statusCounts.confirmed },
    { label: "Completed", value: statusCounts.completed },
    { label: "Cancelled", value: statusCounts.cancelled },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Keikat yhteensa</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{totalBookings}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Tulot yhteensa</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{formatEuro(totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Keskihinta</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{formatEuro(avgPrice)}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Tana kuuna</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{thisMonthCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Kuukausitulot (6 kk)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-300">
                <th className="px-2 py-2 text-left">Kuukausi</th>
                <th className="px-2 py-2 text-left">Keikat</th>
                <th className="px-2 py-2 text-left">Tulot</th>
                <th className="px-2 py-2 text-left">Muutos edelliseen</th>
              </tr>
            </thead>
            <tbody>
              {monthStats.map((item, index) => {
                const prev = monthStats[index + 1];
                const change = prev && prev.revenue > 0
                  ? ((item.revenue - prev.revenue) / prev.revenue) * 100
                  : Number.NaN;
                return (
                  <tr key={item.key} className="border-b border-zinc-700/60 text-zinc-200">
                    <td className="px-2 py-2">{item.label}</td>
                    <td className="px-2 py-2">{item.count}</td>
                    <td className="px-2 py-2">{formatEuro(item.revenue)}</td>
                    <td className="px-2 py-2">{formatPercent(change)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-zinc-100">Palvelutyypit</h3>
          <div className="space-y-3">
            {serviceRows.map((row) => {
              const percent = totalBookings > 0 ? (row.value / totalBookings) * 100 : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-zinc-200">
                    <span>{row.label}</span>
                    <span>{Math.round(percent)} %</span>
                  </div>
                  <ProgressBar percent={percent} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-zinc-100">Status-jakauma</h3>
          <div className="space-y-3">
            {statusRows.map((row) => {
              const percent = totalBookings > 0 ? (row.value / totalBookings) * 100 : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-zinc-200">
                    <span>{row.label}</span>
                    <span>{Math.round(percent)} %</span>
                  </div>
                  <ProgressBar percent={percent} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Eniten kaytetty palvelu</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{mostUsedService}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Vilkkain paiva</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{busiestWeekday}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Keskiarvo per keikka</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{formatEuro(avgPrice)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Viimeiset 10 keikkaa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-300">
                <th className="px-2 py-2 text-left">Paiva</th>
                <th className="px-2 py-2 text-left">Palvelu</th>
                <th className="px-2 py-2 text-left">Hinta</th>
                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {lastTen.map((booking) => (
                <tr key={booking.id} className="border-b border-zinc-700/60 text-zinc-200">
                  <td className="px-2 py-2">
                    {booking.starts_at
                      ? new Date(booking.starts_at).toLocaleDateString("fi-FI")
                      : booking.created_at
                      ? new Date(booking.created_at).toLocaleDateString("fi-FI")
                      : "-"}
                  </td>
                  <td className="px-2 py-2">{booking.service_type ?? "-"}</td>
                  <td className="px-2 py-2">{formatEuro(toAmount(booking))}</td>
                  <td className="px-2 py-2">{normalizeStatus(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
