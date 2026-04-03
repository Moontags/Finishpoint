import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import PriceRow from "./PriceRow";

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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Hinnat</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          Virhe hintojen lataamisessa: {error.message}
        </div>
      )}

      {prices.length === 0 && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Hintoja ei löydy. Aja ensin SQL-migraatio Supabasessa.
        </div>
      )}

      {prices.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {prices.map((p) => (
            <PriceRow key={p.key} price={p} updatePrice={updatePrice} />
          ))}
        </div>
      )}
    </div>
  );
}
