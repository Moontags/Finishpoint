"use client";

import { useEffect, useRef, useState } from "react";
import { Bike, Boxes, ChevronDown, Truck } from "lucide-react";
import { PriceCalculator } from "@/components/PriceCalculator";
import { useCalculatorContext } from "@/lib/calculator-context";
import { useLanguage } from "@/lib/LanguageContext";
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
  const { t } = useLanguage();

  const [active, setActive] = useState<ServiceCategory>(resolvedInitial);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calculatorContext = useCalculatorContext();

  useEffect(() => {
    setActive(resolvedInitial);
  }, [resolvedInitial]);

  useEffect(() => {
    calculatorContext?.setServiceCategory(active);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div id="calculator" className="bg-transparent p-3.5 sm:p-8">
      <p className="text-[13px] font-extrabold uppercase tracking-[0.22em] text-blue-600 sm:text-[15px]">{t("calculator.orderTransport", "Tilaa kuljetus")}</p>
      {/* <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {t("calculator.selectService", "Valitse palvelutyyppi")}
      </h2> */}

      <div className="mt-5">
        <PriceCalculator
          category={active}
          serviceTabsSlot={
            <>
              <div className="mb-4 sm:hidden">
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex w-full min-w-0 items-center justify-between rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition"
                  >
                    <span className="min-w-0 flex-1 wrap-break-word text-left leading-tight">
                      {(() => { const c = categories.find((c) => c.id === active); return c ? t(`serviceCategory.${c.id}.label`, c.label) : ""; })()}
                    </span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-y-auto max-h-60 rounded-2xl border-2 border-slate-200 bg-white shadow-xl">
                      {categories.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setActive(id); setOpen(false); }}
                          className={`flex w-full min-w-0 items-center gap-4 px-5 py-5 text-[17px] font-bold transition ${
                            active === id
                              ? "bg-slate-700/80 text-white"
                              : "text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          <span className="wrap-break-word text-left leading-tight">{t(`serviceCategory.${id}.label`, label)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4 hidden gap-2 sm:col-span-2 sm:grid sm:grid-cols-3">
                {categories.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    data-testid={`service-tab-${id}`}
                    onClick={() => setActive(id)}
                    className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm backdrop-blur-sm transition ${
                      active === id
                        ? "border-0 bg-slate-700/80 text-white"
                        : "border border-slate-200 bg-white/10 text-slate-700 hover:bg-white/20 hover:text-slate-900"
                    }`}
                  >
                    {/* Ikoni poistettu */}
                    <span>{t(`serviceCategory.${id}.label`, label)}</span>
                  </button>
                ))}
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
