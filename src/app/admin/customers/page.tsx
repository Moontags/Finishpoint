import { createClient } from "@/lib/supabase/server";
import { CustomerSearch, type Customer } from "@/components/customer-search";

type BookingRow = {
  id: string;
  created_at: string | null;
  starts_at: string | null;
  scheduled_date?: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  service_type: string | null;
  status: string | null;
  pickup_address: string | null;
  delivery_address: string | null;
  price?: number | null;
  total_with_vat?: number | null;
};

function bookingAmount(booking: BookingRow): number {
  const price = typeof booking.price === "number" ? booking.price : null;
  const total = typeof booking.total_with_vat === "number" ? booking.total_with_vat : null;
  return price ?? total ?? 0;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .not("customer_email", "is", null)
    .order("created_at", { ascending: false });

  const grouped: Record<string, Customer> = {};

  for (const raw of bookings ?? []) {
    const booking = raw as BookingRow;
    const email = booking.customer_email;
    if (!email) {
      continue;
    }

    if (!grouped[email]) {
      grouped[email] = {
        name: booking.customer_name,
        email,
        phone: booking.customer_phone,
        bookings: [],
        totalSpent: 0,
        latestBookingAt: booking.starts_at ?? booking.scheduled_date ?? booking.created_at,
      };
    }

    grouped[email].bookings.push({
      id: booking.id,
      service_type: booking.service_type,
      pickup_address: booking.pickup_address,
      delivery_address: booking.delivery_address,
      status: booking.status,
      starts_at: booking.starts_at,
      scheduled_date: booking.scheduled_date ?? null,
      price: bookingAmount(booking),
    });
    grouped[email].totalSpent += bookingAmount(booking);

    const currentLatest = grouped[email].latestBookingAt;
    const candidate = booking.starts_at ?? booking.scheduled_date ?? booking.created_at;
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
