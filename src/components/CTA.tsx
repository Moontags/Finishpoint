import { ArrowRight, Phone } from "lucide-react";

export function CTA({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-[1.75] text-slate-600 sm:text-base">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href="tel:0503547763"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] sm:w-auto"
        >
          Soita 050 354 7763
          <Phone className="h-4 w-4" />
        </a>
        <a
          href="#quote"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 active:scale-[0.97] sm:w-auto"
        >
          Täytä tarjouslomake
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
