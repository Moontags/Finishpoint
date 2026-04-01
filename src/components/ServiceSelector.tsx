"use client";

import { useEffect, useState } from "react";
import { Bike, Boxes, Truck } from "lucide-react";
import { PriceCalculator } from "@/components/PriceCalculator";
import { serviceCategories } from "@/lib/service-categories";
import type { ServiceCategory } from "@/lib/types";

const categoryIcons = {
  kappaletavara: Boxes,
  projekti: Truck,
  ajoneuvo: Bike,
};

const categories: Array<{ id: ServiceCategory; label: string; icon: typeof Bike }> = serviceCategories.map(
  ({ id, label }) => ({
    id,
    label,
    icon: categoryIcons[id],
  }),
);

function parseCategory(value: string | null): ServiceCategory | null {
  if (value === "ajoneuvo" || value === "kappaletavara" || value === "projekti") {
    return value;
  }
  return null;
}

export default function ServiceSelector({
  initialCategory,
}: {
  initialCategory?: ServiceCategory;
}) {
  const resolvedInitial = parseCategory(initialCategory ?? null) ?? "kappaletavara";

  const [active, setActive] = useState<ServiceCategory>(resolvedInitial);

  useEffect(() => {
    setActive(resolvedInitial);
  }, [resolvedInitial]);

  return (
    <div id="calculator" className="rounded-2xl bg-transparent p-5 sm:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">Laskuri</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Valitse palvelutyyppi
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Valitse ensin kategoria. Hinta-arvio näytetään sis. ALV 25,5 %. Yrityksille näytetään ALV 0 %.
      </p>

      <div className="mt-5 sm:hidden">
        <label htmlFor="service-category-select" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Palvelutyyppi
          <select
            id="service-category-select"
            name="serviceCategory"
            value={active}
            onChange={(event) => setActive(parseCategory(event.target.value) ?? "kappaletavara")}
            className="w-full rounded-xl border border-slate-700 bg-slate-700 px-4 py-3 text-[14px] text-white shadow-sm outline-none transition focus:border-slate-600 focus:bg-slate-700 focus:ring-2 focus:ring-slate-500/40"
          >
            {categories.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 hidden gap-2 sm:grid sm:grid-cols-3">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm backdrop-blur-sm transition ${
              active === id
                ? "border border-slate-700 bg-slate-700 text-white"
                : "border border-slate-200 bg-white/10 text-slate-700 hover:border-blue-300 hover:bg-white/20 hover:text-slate-900"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <PriceCalculator category={active} />
      </div>
    </div>
  );
}
