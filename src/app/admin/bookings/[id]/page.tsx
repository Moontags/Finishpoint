import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

const palvelutyypit = ["kappaletavara", "muutto", "kierrätys", "ajoneuvo"];
const statukset = [
  { value: "vahvistettu", label: "Vahvistettu" },
  { value: "peruttu", label: "Peruttu" },
  { value: "valmis", label: "Valmis" },
];

async function saveBooking(formData: FormData) {
  "use server";
  const db = createAdminClient();
  const id = formData.get("id") as string;
  const isNew = id === "new";

  const payload = {
    palvelutyyppi: formData.get("palvelutyyppi") as string,
    lahto_osoite: formData.get("lahto_osoite") as string,
    kohde_osoite: formData.get("kohde_osoite") as string,
    varaus_pvm: formData.get("varaus_pvm") as string,
    aloitusaika: (formData.get("aloitusaika") as string) || "08:00",
    lopetusaika: (formData.get("lopetusaika") as string) || "09:00",
    hinta_alv: formData.get("hinta_alv") ? Number(formData.get("hinta_alv")) : null,
    status: formData.get("status") as string,
    asiakas_nimi: formData.get("asiakas_nimi") as string,
    asiakas_email: formData.get("asiakas_email") as string,
    asiakas_puhelin: formData.get("asiakas_puhelin") as string,
  };

  if (isNew) {
    await db.from("varaukset").insert({ ...payload, ajoaika_kohteeseen_min: 0, ajoaika_riihimaelta_min: 0 });
  } else {
    await db.from("varaukset").update(payload).eq("id", id);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

async function deleteBooking(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const db = createAdminClient();
  await db.from("varaukset").delete().eq("id", id);
  revalidatePath("/admin");
  redirect("/admin");
}

export default async function BookingDetailPage({ params }: Params) {
  const { id } = await params;
  const isNew = id === "new";
  const db = createAdminClient();

  let booking: Record<string, unknown> | null = null;
  if (!isNew) {
    const { data } = await db.from("varaukset").select("*").eq("id", id).single();
    booking = data;
    if (!booking) redirect("/admin");
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors">
            ← Takaisin
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            {isNew ? "Uusi keikka" : "Muokkaa keikkaa"}
          </h1>
        </div>
        {!isNew && (
          <form action={deleteBooking}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-xl border border-rose-400/50 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-900/30 transition-colors"
              onClick={(e) => {
                if (!confirm("Haluatko varmasti poistaa tämän keikan?")) e.preventDefault();
              }}
            >
              Poista keikka
            </button>
          </form>
        )}
      </div>

      <form action={saveBooking} className="rounded-2xl border border-zinc-700 bg-zinc-800/45 p-6 space-y-5">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Palvelutyyppi</label>
            <select
              name="palvelutyyppi"
              defaultValue={(booking?.palvelutyyppi as string) ?? "kappaletavara"}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
            >
              {palvelutyypit.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Tila</label>
            <select
              name="status"
              defaultValue={(booking?.status as string) ?? "vahvistettu"}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
            >
              {statukset.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Päivämäärä</label>
            <input
              type="date"
              name="varaus_pvm"
              defaultValue={(booking?.varaus_pvm as string) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Aloitus</label>
            <input
              type="time"
              name="aloitusaika"
              defaultValue={(booking?.aloitusaika as string)?.slice(0, 5) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Lopetus</label>
            <input
              type="time"
              name="lopetusaika"
              defaultValue={(booking?.lopetusaika as string)?.slice(0, 5) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Lähtöosoite</label>
          <input
            type="text"
            name="lahto_osoite"
            defaultValue={(booking?.lahto_osoite as string) ?? ""}
            className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Kohdeosoite</label>
          <input
            type="text"
            name="kohde_osoite"
            defaultValue={(booking?.kohde_osoite as string) ?? ""}
            className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Hinta (sis. ALV) €</label>
          <input
            type="number"
            name="hinta_alv"
            step="0.01"
            defaultValue={(booking?.hinta_alv as number) ?? ""}
            className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-zinc-700/80 pt-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Asiakkaan nimi</label>
            <input
              type="text"
              name="asiakas_nimi"
              defaultValue={(booking?.asiakas_nimi as string) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Sähköposti</label>
            <input
              type="email"
              name="asiakas_email"
              defaultValue={(booking?.asiakas_email as string) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Puhelinnumero</label>
            <input
              type="tel"
              name="asiakas_puhelin"
              defaultValue={(booking?.asiakas_puhelin as string) ?? ""}
              className="w-full rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-300"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-xl border border-zinc-500 bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-600 transition-colors"
          >
            Tallenna muutokset
          </button>
        </div>
      </form>
    </div>
  );
}
