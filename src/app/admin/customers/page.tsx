import { createClient } from "@/lib/supabase/server";
import { CustomerSearch, type Customer } from "@/components/customer-search";

type VarausRow = {
  id: string;
  created_at: string | null;
  varaus_pvm: string | null;
  asiakas_nimi: string | null;
  asiakas_email: string | null;
  asiakas_puhelin: string | null;
  palvelutyyppi: string | null;
  status: string | null;
  lahto_osoite: string | null;
  kohde_osoite: string | null;
  hinta?: number | null;
  hinta_alv?: number | null;
};

function varausAmount(varaus: VarausRow): number {
  const price = typeof varaus.hinta === "number" ? varaus.hinta : null;
  const total = typeof varaus.hinta_alv === "number" ? varaus.hinta_alv : null;
  return total ?? price ?? 0;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: varaukset } = await supabase
    .from("varaukset")
    .select("*")
    .not("asiakas_email", "is", null)
    .order("created_at", { ascending: false });

  const grouped: Record<string, Customer> = {};

  for (const raw of varaukset ?? []) {
    const varaus = raw as VarausRow;
    const email = varaus.asiakas_email;
    if (!email) {
      continue;
    }

    if (!grouped[email]) {
      grouped[email] = {
        name: varaus.asiakas_nimi,
        email,
        phone: varaus.asiakas_puhelin,
        bookings: [],
        totalSpent: 0,
        latestBookingAt: varaus.varaus_pvm ?? varaus.created_at,
      };
    }

    grouped[email].bookings.push({
      id: varaus.id,
      service_type: varaus.palvelutyyppi,
      pickup_address: varaus.lahto_osoite,
      delivery_address: varaus.kohde_osoite,
      status: varaus.status,
      starts_at: varaus.varaus_pvm,
      scheduled_date: varaus.varaus_pvm,
      price: varausAmount(varaus),
    });
    grouped[email].totalSpent += varausAmount(varaus);

    const currentLatest = grouped[email].latestBookingAt;
    const candidate = varaus.varaus_pvm ?? varaus.created_at;
    if (candidate && (!currentLatest || new Date(candidate) > new Date(currentLatest))) {
      grouped[email].latestBookingAt = candidate;
    }
  }

  const customerList: Customer[] = Object.values(grouped).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const newThisMonth = customerList.filter((customer) => {
    const latest = customer.latestBookingAt ? new Date(customer.latestBookingAt) : null;
    return latest && latest >= monthStart;
  }).length;

  const loyalCustomers = customerList.filter((customer) => customer.bookings.length >= 2).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Asiakkaita yhteensa</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{customerList.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Uusia tassa kuussa</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{newThisMonth}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">Kanta-asiakkaita (2+ keikkaa)</p>
          <p className="mt-1 text-3xl font-semibold text-zinc-100">{loyalCustomers}</p>
        </div>
      </div>

      <CustomerSearch customers={customerList} />
    </div>
  );
}
