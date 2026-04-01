"use client";

import { getMobilePayPublicLink } from "@/lib/mobilepay-config";
import { lisaaAlv } from "@/lib/pricing";

interface PriceSummaryProps {
  hintaAlv0: number;
  label?: string;
}

export function PriceSummary({ hintaAlv0, label = "Hinta" }: PriceSummaryProps) {
  const sisAlv = lisaaAlv(hintaAlv0);
  const mobilePayLink = getMobilePayPublicLink();

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-4">
      <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {sisAlv.toFixed(2)} € <span className="text-[13px] font-medium text-slate-600">(sis. ALV 25,5 %)</span>
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-700">
          Yritys (ALV 0 %): <span className="font-semibold text-slate-900">{hintaAlv0.toFixed(2)} €</span>
        </p>

        {mobilePayLink ? (
          <a
            href={mobilePayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            Maksa MobilePaylla
          </a>
        ) : null}
      </div>
    </div>
  );
}
