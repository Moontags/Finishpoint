import { createClient } from "@/lib/supabase/server";
import { updatePrice } from "./actions";

const PRICE_CATEGORIES = {
  "Kappaletavara": [
    { key: "base_kappaletavara", label: "Perustaksa" },
    { key: "km_rate_tavara", label: "Km-hinta" },
    { key: "floor_extra", label: "Kerrosraha" },
  ],
  "Muutto & kierrätys": [
    { key: "base_muutto", label: "Muuton perustaksa" },
    { key: "base_kierratys", label: "Kierrätyksen perustaksa" },
    { key: "km_rate_muutto", label: "Km-hinta" },
  ],
  "Ajoneuvokuljetukset": [
    { key: "base_ajoneuvo_40", label: "Perustaksa (4t)" },
    { key: "base_ajoneuvo_80", label: "Perustaksa (8t)" },
    { key: "km_rate_ajoneuvo", label: "Km-hinta" },
  ],
  "Verotus": [{ key: "vat_rate", label: "ALV-prosentti" }],
};

export default async function PricesPage() {
  const supabase = await createClient();
  const { data: prices } = await supabase.from("prices").select("*");

  const priceMap = new Map(prices?.map((p) => [p.key, p.value]) ?? []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Hintojen muokkaus</h1>

      <div className="space-y-8">
        {Object.entries(PRICE_CATEGORIES).map(([category, items]) => (
          <div
            key={category}
            className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">
              {category}
            </h2>

            <div className="space-y-3">
              {items.map(({ key, label }) => (
                <form
                  key={key}
                  action={updatePrice}
                  className="flex gap-3 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-sm text-zinc-400 mb-1">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input type="hidden" name="key" value={key} />
                      <input
                        type="number"
                        step="0.01"
                        name="value"
                        defaultValue={priceMap.get(key) ?? "0"}
                        className="flex-1 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
                      />
                      {key === "vat_rate" && (
                        <span className="text-zinc-400 text-sm">%</span>
                      )}
                      {key !== "vat_rate" && (
                        <span className="text-zinc-400 text-sm">€</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
                  >
                    Tallenna
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
