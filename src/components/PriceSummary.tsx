import { lisaaAlv } from "@/lib/pricing";

interface PriceSummaryProps {
  hintaAlv0: number;
  label?: string;
}

export function PriceSummary({ hintaAlv0, label = "Hinta" }: PriceSummaryProps) {
  const sisAlv = lisaaAlv(hintaAlv0);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-4">
      <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        {label} ALV 0 %
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{hintaAlv0.toFixed(2)} €</p>
      <p className="mt-1 text-[13px] text-slate-700">
        Sis. ALV 25,5 %: <span className="font-semibold text-blue-600">{sisAlv.toFixed(2)} €</span>
      </p>
    </div>
  );
}
