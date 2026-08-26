import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { PriceForm } from "./price-form";

const PRICE_CATEGORIES = {
  "Kappaletavara": [
    { key: "base_kappaletavara", label: "Perustaksa" },
    { key: "km_rate_tavara", label: "Km-hinta" },
  ],
  // Positiointimaksu = tyhjänä ajo tukikohdasta noutopaikkaan ja jättöpaikasta
  // takaisin. Porrasrajat (40/80/200/400/600 km) ovat koodissa kiinteitä,
  // vain €/km-hinnat ovat säädettävissä täältä.
  "Pikakuljetuksen positiointi (€/km)": [
    { key: "positioning_rate_40_80", label: "40–80 km" },
    { key: "positioning_rate_80_200", label: "80–200 km" },
    { key: "positioning_rate_200_400", label: "200–400 km" },
    { key: "positioning_rate_400_600", label: "400–600 km" },
    { key: "positioning_rate_600_plus", label: "yli 600 km" },
  ],
  "Muutto & kierrätys": [
    { key: "base_muutto", label: "Muuton perustaksa" },
    { key: "base_kierratys", label: "Kierrätyksen perustaksa" },
    { key: "km_rate_muutto", label: "Km-hinta" },
  ],
  "Verotus": [{ key: "vat_rate", label: "ALV-prosentti (%)" }],
};

export default async function PricesPage() {
  const supabase = getSupabaseAdminClient();
  const { data: prices } = supabase
    ? await supabase.from("prices").select("*")
    : { data: null };

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

            {category === "Verotus" && (
              <p className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                ⚠ Muutos vaikuttaa kaikkiin hintoihin heti. Anna arvo prosenttilukuna (esim. 25,5), ei kertoimena (0,255).
              </p>
            )}

            <div className="space-y-3">
              {items.map(({ key, label }) => (
                <PriceForm
                  key={key}
                  keyName={key}
                  label={label}
                  defaultValue={String(priceMap.get(key) ?? "0")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
