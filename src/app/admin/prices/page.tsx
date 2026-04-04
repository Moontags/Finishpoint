import { createClient } from "@/lib/supabase/server";

import { useState, useTransition } from "react";
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

import { useEffect } from "react";

function PriceForm({ keyName, label, defaultValue }: { keyName: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("key", keyName);
    fd.set("value", value);
    startTransition(async () => {
      try {
        const res = await updatePrice(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError("Virhe tallennuksessa");
      }
    });
  }

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm text-zinc-400 mb-1">{label}</label>
        <div className="flex gap-2">
          <input type="hidden" name="key" value={keyName} />
          <input
            type="number"
            step="0.01"
            name="value"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="flex-1 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            disabled={isPending}
          />
          {keyName === "vat_rate" ? (
            <span className="text-zinc-400 text-sm">%</span>
          ) : (
            <span className="text-zinc-400 text-sm">€</span>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        disabled={isPending}
      >
        {saved ? "Tallennettu!" : isPending ? "Tallennetaan..." : "Tallenna"}
      </button>
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </form>
  );
}

export default async function PricesPage() {
  const supabase = await createClient();
  const { data: prices } = await supabase.from("prices").select("*");

  const priceMap = new Map(prices?.map((p) => [p.key, p.value]) ?? []);

  // @ts-expect-error Async Server Component
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
