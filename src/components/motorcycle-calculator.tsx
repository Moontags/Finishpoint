"use client";

import { useMemo, useState } from "react";
import { Bike, Route } from "lucide-react";

const VAT_RATE = 0.255;

type RouteMode = "single" | "multistop";

function calculateVatExclusivePrice(kilometers: number, routeMode: RouteMode) {
  if (!Number.isFinite(kilometers) || kilometers <= 0) {
    return 0;
  }

  if (routeMode === "multistop") {
    return kilometers * 1.4;
  }

  if (kilometers <= 40) {
    return 120;
  }

  if (kilometers <= 80) {
    return 180;
  }

  return kilometers * 1.4;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function MotorcycleCalculator() {
  const [routeMode, setRouteMode] = useState<RouteMode>("single");
  const [kilometers, setKilometers] = useState(60);

  const vatExclusivePrice = useMemo(
    () => calculateVatExclusivePrice(kilometers, routeMode),
    [kilometers, routeMode],
  );

  const vatInclusivePrice = vatExclusivePrice * (1 + VAT_RATE);

  return (
    <div
      id="calculator"
      className="rounded-2xl border border-slate-200 bg-transparent p-5 shadow-sm sm:p-8"
    >
      {/* Header row */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Bike className="h-3.5 w-3.5 text-blue-600" />
            Moottoripyöräkuljetusten laskuri
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laske kuljetuksen hinta
          </h2>
          <p className="max-w-lg text-[14px] leading-[1.75] text-slate-600">
            Lyhyet 0–40 km: 120 €, aluelähdöt 40–80 km: 180 €, pitkät reitit 1,40 €/km.
            Monipysähdysreitit kokonaismatkan mukaan.
          </p>
        </div>

        {/* Price display */}
        <div className="shrink-0 rounded-xl border border-slate-200 bg-transparent px-5 py-4 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
            Hinta ALV 0 %
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatPrice(vatExclusivePrice)}
          </p>
          <p className="mt-1.5 text-[13px] font-medium text-blue-600">
            Sis. ALV 25,5 %: {formatPrice(vatInclusivePrice)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">

        {/* Left: inputs */}
        <div className="space-y-6 rounded-xl border border-slate-200 bg-transparent p-5">

          {/* Route type */}
          <div>
            <label className="mb-3 block text-[13px] font-semibold text-slate-700">
              Reitin tyyppi
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    mode: "single" as RouteMode,
                    title: "Yksi nouto ja toimitus",
                    desc: "Hinnoittelu 120 €, 180 € tai 1,40 €/km.",
                  },
                  {
                    mode: "multistop" as RouteMode,
                    title: "Monipysähdysreitti",
                    desc: "A → B → C → takaisin A, 1,40 €/km.",
                  },
                ] as const
              ).map(({ mode, title, desc }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRouteMode(mode)}
                  className={`rounded-xl border px-4 py-4 text-left shadow-sm backdrop-blur-sm transition active:scale-[0.98] ${
                    routeMode === mode
                      ? "border-blue-300 bg-white/10 text-slate-900 ring-1 ring-blue-200/70"
                      : "border-slate-200 bg-white/5 text-slate-700 hover:border-blue-200 hover:bg-white/10"
                  }`}
                >
                  <p className="text-[13px] font-semibold">{title}</p>
                  <p className="mt-1.5 text-[12px] leading-[1.6] text-slate-700">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <label htmlFor="kilometers" className="text-[13px] font-semibold text-slate-700">
                Kokonaismatka
              </label>
              <span className="rounded-lg border border-slate-200 bg-transparent px-3 py-1 text-[13px] font-semibold text-slate-900">
                {kilometers} km
              </span>
            </div>
            <input
              id="kilometers"
              type="range"
              min="0"
              max="500"
              step="5"
              value={kilometers}
              onChange={(e) => setKilometers(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
            />
            <div className="mt-2.5 flex justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
              <span>0 km</span>
              <span>500 km</span>
            </div>
          </div>
        </div>

        {/* Right: pricing rules */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
          <div className="flex items-center gap-2 text-blue-600">
            <Route className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
              Hinnoittelusääntö
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {[
              { range: "0–40 km", price: "120 €", active: routeMode === "single" && kilometers <= 40 },
              { range: "40–80 km", price: "180 €", active: routeMode === "single" && kilometers > 40 && kilometers <= 80 },
              { range: "Yli 80 km", price: "1,40 € / km", active: routeMode === "single" && kilometers > 80 },
              { range: "Monipysähdys", price: "1,40 € / km", active: routeMode === "multistop" },
            ].map(({ range, price, active }) => (
              <div
                key={range}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-[13px] shadow-sm backdrop-blur-sm transition ${
                  active
                    ? "border-blue-300 bg-white/10 text-slate-900 ring-1 ring-blue-200/70"
                    : "border-transparent bg-white/5 text-slate-500"
                }`}
              >
                <span>{range}</span>
                <span className={active ? "font-bold text-blue-600" : ""}>{price}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-[12px] text-slate-700">
            Hintoihin lisätään ALV 25,5 %.
          </div>
        </div>
      </div>
    </div>
  );
}