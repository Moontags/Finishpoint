"use client";

import { useState, useTransition, useEffect } from "react";
import { updatePrice } from "./actions";
import { Toast, useToast } from "@/components/ui/toast";

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
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("key", keyName);
    fd.set("value", value);
    startTransition(async () => {
      const result = await updatePrice(fd);
      if (result.success) {
        showToast(`${label} päivitetty!`, "success");
      } else {
        showToast(`Virhe: ${result.error ?? "Tuntematon virhe"}`, "error");
      }
    });
  }

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

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
              <span className="text-zinc-400 text-sm self-center">%</span>
            ) : (
              <span className="text-zinc-400 text-sm self-center">€</span>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded text-sm font-medium transition"
          disabled={isPending}
        >
          {isPending ? "Tallennetaan..." : "Tallenna"}
        </button>
      </form>
    </>
  );
}
