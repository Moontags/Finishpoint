"use client";

import { useEffect, useState } from "react";
import { Bike, Boxes, Truck } from "lucide-react";
import { PriceCalculator } from "@/components/PriceCalculator";
import type { ServiceCategory } from "@/lib/types";

const categories: Array<{ id: ServiceCategory; label: string; icon: typeof Bike }> = [
  { id: "ajoneuvo", label: "Ajoneuvokuljetukset", icon: Bike },
  { id: "kappaletavara", label: "Kappaletavara", icon: Boxes },
  { id: "projekti", label: "Muutot ja kierratys", icon: Truck },
];

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
  const resolvedInitial = parseCategory(initialCategory ?? null) ?? "ajoneuvo";

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
      <p className="mt-2 text-[14px] leading-7 text-slate-500 sm:text-[15px]">
        Valitse ensin kategoria. Saat hinta-arvion aina ALV 0 % ja sis. ALV 25,5 %.
      </p>

      <div className="mt-5 sm:hidden">
        <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Palvelutyyppi
          <select
            value={active}
            onChange={(event) => setActive(parseCategory(event.target.value) ?? "ajoneuvo")}
            className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/20 focus:ring-2 focus:ring-blue-100"
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
                ? "border border-[#1e3a5f] bg-[#1e3a5f] text-white"
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
