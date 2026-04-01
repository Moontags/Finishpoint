"use client";

import { lisaaAlv } from "@/lib/pricing";

interface PriceSummaryProps {
  hintaAlv0: number;
  label?: string;
}

export function PriceSummary({ hintaAlv0, label = "Hinta" }: PriceSummaryProps) {
  const sisAlv = lisaaAlv(hintaAlv0);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 [overflow-wrap:anywhere]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {sisAlv.toFixed(2)} € <span className="text-[13px] font-medium text-slate-600">(sis. ALV 25,5 %)</span>
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-700">
          Yritys (ALV 0 %): <span className="font-semibold text-slate-900">{hintaAlv0.toFixed(2)} €</span>
        </p>
      </div>

      <p className="mt-2 text-[12px] text-slate-600">
        Tilaus ja maksu tehdään alla olevalla lomakkeella.
      </p>
    </div>
  );
}
