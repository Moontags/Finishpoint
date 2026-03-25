import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { CTA } from "@/components/CTA";
import { ProcessSteps } from "@/components/ProcessSteps";
import ServicePageLayout from "@/components/ServicePageLayout";
import { ServiceList } from "@/components/ServiceList";
import { QuoteRequestForm } from "@/components/quote-request-form";
import type { ServiceContent } from "@/lib/services";

export function ServicePage({
  service,
  seasonBanner,
}: {
  service: ServiceContent;
  seasonBanner?: string;
}) {
  return (
    <ServicePageLayout title={service.title} description={service.description}>
      {seasonBanner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[14px] font-semibold text-emerald-700 sm:text-[15px]">
          {seasonBanner}
        </div>
      ) : null}

      <section className="relative grid gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        {service.heroBackgroundImage ? (
          <>
            <Image
              src={service.heroBackgroundImage}
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-slate-900/55" />
          </>
        ) : null}

        <div className="relative z-[1] space-y-4">
          <h2 className={`text-2xl font-bold tracking-tight sm:text-4xl ${service.heroBackgroundImage ? "text-white" : "text-slate-900"}`}>
            {service.valueProposition}
          </h2>
          <p className={`max-w-xl text-[14px] leading-[1.75] sm:text-base ${service.heroBackgroundImage ? "text-slate-200" : "text-slate-600"}`}>
            Palvelemme joustavasti myös viikonloppuisin. Kerro tarpeesi, niin ehdotamme sinulle
            sopivan aikataulun ja kuljetusratkaisun.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:0503547763"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] sm:w-auto"
            >
              Soita heti
              <MoveRight className="h-4 w-4" />
            </a>
            <a
              href="#quote"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 active:scale-[0.97] sm:w-auto"
            >
              Pyydä tarjous
            </a>
          </div>
        </div>

        <div className={`relative z-[1] rounded-xl border p-5 ${service.heroBackgroundImage ? "border-white/30 bg-white/10 backdrop-blur-sm" : "border-slate-200 bg-slate-50"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${service.heroBackgroundImage ? "text-blue-200" : "text-blue-500"}`}>
            Sisältää
          </p>
          <div className="mt-4">
            <ServiceList items={service.includes} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{service.pricingTitle}</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-slate-600 sm:text-base">
          {service.pricingDescription}
        </p>
        <div className="mt-6">
          <Link
            href={`/laskuri?kategoria=${service.calculatorCategory}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] sm:w-auto"
          >
            Avaa laskuri valmiilla valinnalla
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">Prosessi</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Näin palvelu etenee</h2>
        <div className="mt-5">
          <ProcessSteps />
        </div>
      </section>

      <section className="space-y-5">
          <CTA
            title="Tarvitsetko kuljetuksen nopeasti?"
            description="Soita tai jätä tarjouspyyntö. Vahvistamme aikataulun heti."
        />
        <QuoteRequestForm />
      </section>
    </ServicePageLayout>
  );
}
