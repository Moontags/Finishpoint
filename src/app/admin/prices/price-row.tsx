"use client";

import { useState, useTransition } from "react";

type PriceRecord = {
  id: string;
  key: string;
  value: number;
  label: string | null;
  updated_at: string;
};

type Props = {
  price: PriceRecord;
  updatePrice: (formData: FormData) => Promise<void>;
};

export default function PriceRow({ price, updatePrice }: Props) {
  const [value, setValue] = useState(String(price.value));
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("key", price.key);
    fd.set("value", value);
    startTransition(async () => {
      await updatePrice(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-between gap-4 border-b border-zinc-700/70 px-5 py-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-100">
          {price.label ?? price.key}
        </p>
        <p className="text-xs text-zinc-400">{price.key}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 rounded-xl border border-zinc-500 bg-zinc-800 px-3 py-2 text-right text-sm text-zinc-100 focus:outline-none focus:border-zinc-300"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl border border-zinc-500 bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:bg-zinc-600 disabled:opacity-50"
        >
          {saved ? "Tallennettu" : "Tallenna"}
        </button>
      </div>
    </form>
  );
}
