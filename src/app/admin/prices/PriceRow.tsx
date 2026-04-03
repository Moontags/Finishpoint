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
      className="flex items-center justify-between px-5 py-3 gap-4"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">
          {price.label ?? price.key}
        </p>
        <p className="text-xs text-slate-400">{price.key}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          {saved ? "✓" : "Tallenna"}
        </button>
      </div>
    </form>
  );
}
