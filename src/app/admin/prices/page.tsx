import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import PriceRow from "./price-row";

type PriceRecord = {
  id: string;
  key: string;
  value: number;
  label: string | null;
  updated_at: string;
};

async function updatePrice(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const value = Number(formData.get("value"));
  const db = createAdminClient();
  await db
    .from("prices")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  revalidatePath("/admin/prices");
}

export default async function PricesPage() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("prices")
    .select("*")
    .order("key", { ascending: true });

  const prices = (data ?? []) as PriceRecord[];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Laskuri & hinnat</h1>
        <span className="rounded-xl border border-zinc-600 bg-zinc-800/60 px-3 py-2 text-xs font-semibold text-zinc-300">
          Pikamuokkaus
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">
          Virhe hintojen lataamisessa: {error.message}
        </div>
      )}

      {prices.length === 0 && !error && (
        <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-8 text-center text-sm text-zinc-400">
          Hintoja ei löydy. Aja ensin SQL-migraatio Supabasessa.
        </div>
      )}

      {prices.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800/45">
          <div className="grid grid-cols-[1fr_auto] border-b border-zinc-700/90 bg-zinc-900/30 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            <span>Hintakomponentti</span>
            <span>Arvo</span>
          </div>
          {prices.map((p) => (
            <PriceRow key={p.key} price={p} updatePrice={updatePrice} />
          ))}
        </div>
      )}
    </div>
  );
}
