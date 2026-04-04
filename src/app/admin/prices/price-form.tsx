"use client";

import { useState, useTransition, useEffect } from "react";
import { updatePrice } from "./actions";

export function PriceForm({
  keyName,
  label,
  defaultValue,
}: {
  keyName: string;
  label: string;
  defaultValue: string;
}) {
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
        await updatePrice(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
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
            onChange={(e) => setValue(e.target.value)}
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
