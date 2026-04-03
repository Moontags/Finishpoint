import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveBooking, deleteBooking } from "../../actions";
import Link from "next/link";

export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  let booking = null;

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
    booking = data;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">
          {id === "new" ? "Uusi keikka" : "Muokkaa keikat"}
        </h1>
        <Link
          href="/admin"
          className="text-zinc-400 hover:text-zinc-300 text-sm"
        >
          ← Takaisin
        </Link>
      </div>

      <form
        action={saveBooking}
        className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-4"
      >
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Palvelun tyyppi *
          </label>
          <select
            name="service_type"
            defaultValue={booking?.service_type || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Valitse...</option>
            <option value="muutto">Muutto</option>
            <option value="kierratys">Kierrätys</option>
            <option value="kappaletavara">Kappaletavara</option>
            <option value="ajoneuvo">Ajoneuvo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Mistä (osoite) *
          </label>
          <input
            type="text"
            name="from_address"
            defaultValue={booking?.pickup_address || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Minne (osoite) *
          </label>
          <input
            type="text"
            name="to_address"
            defaultValue={booking?.delivery_address || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Päivämäärä *
            </label>
            <input
              type="date"
              name="scheduled_date"
              defaultValue={
                booking?.starts_at
                  ? new Date(booking.starts_at).toISOString().split("T")[0]
                  : ""
              }
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Hinta (€)
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              defaultValue={booking?.price || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Tila *
          </label>
          <select
            name="status"
            defaultValue={booking?.status || "pending"}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          >
            <option value="pending">Odottaa</option>
            <option value="confirmed">Vahvistettu</option>
            <option value="completed">Valmis</option>
            <option value="cancelled">Peruutettu</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Asiakkaan nimi
            </label>
            <input
              type="text"
              name="customer_name"
              defaultValue={booking?.customer_name || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Asiakkaan puhelin
            </label>
            <input
              type="tel"
              name="customer_phone"
              defaultValue={booking?.customer_phone || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Asiakkaan sähköposti
          </label>
          <input
            type="email"
            name="customer_email"
            defaultValue={booking?.customer_email || ""}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Muistiinpanot
          </label>
          <textarea
            name="notes"
            defaultValue={booking?.notes || ""}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm h-24"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
          >
            {id === "new" ? "Luo keikka" : "Tallenna muutokset"}
          </button>
          <Link
            href="/admin"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded font-medium transition"
          >
            Peruuta
          </Link>
        </div>
      </form>

      {id !== "new" && (
        <form action={deleteBooking} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition"
          >
            Poista keikka
          </button>
        </form>
      )}
    </div>
  );
}
