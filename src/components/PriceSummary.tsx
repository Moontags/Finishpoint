"use client";
import { lisaaAlv, pyoristaAsiakkaalle } from "@/lib/pricing";
import { useLanguage } from "@/lib/LanguageContext";

interface PriceSummaryProps {
  hintaAlv0: number;
  label?: string;
}

export function PriceSummary({ hintaAlv0, label = "Hinta" }: PriceSummaryProps) {
  const { t } = useLanguage();
  const sisAlv = pyoristaAsiakkaalle(lisaaAlv(hintaAlv0));
  return (
    <div className="mt-4 rounded-xl bg-transparent px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800 [overflow-wrap-anywhere]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {sisAlv.toFixed(2)} € <span className="text-[13px] font-medium text-slate-700">({t('common.vat_incl', 'sis. ALV 25,5 %')})</span>
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-800">
          {t('common.business_vat', 'Yritys (ALV 0 %)')}: <span className="font-semibold text-slate-900">{hintaAlv0.toFixed(2)} €</span>
        </p>
      </div>
      <p className="mt-2 text-[12px] text-slate-700">
        {t('calculator.order_via_form', 'Tilaus ja maksu tehdään alla olevalla lomakkeella.')}
      </p>
    </div>
  );
}
