import Image from "next/image";
import Link from "next/link";
import ServicePageLayout from "@/components/ServicePageLayout";
import { ServiceList } from "@/components/ServiceList";
import type { ServiceContent } from "@/lib/services";
import { siteCta } from "@/lib/site-config";

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
              sizes="(max-width: 1023px) 100vw, 42vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-slate-900/55" />
          </>
        ) : null}

        <div className="relative z-1 space-y-4">
          <h2 className={`text-2xl font-bold tracking-tight sm:text-4xl ${service.heroBackgroundImage ? "text-white" : "text-slate-900"}`}>
            {service.valueProposition}
          </h2>
          <p className={`max-w-xl text-[14px] leading-[1.75] sm:text-base ${service.heroBackgroundImage ? "text-slate-200" : "text-slate-600"}`}>
            Palvelemme joustavasti myös viikonloppuisin. Kerro tarpeesi, niin ehdotamme sinulle
            sopivan aikataulun ja kuljetusratkaisun.
          </p>

        </div>

        <div className={`relative z-1 rounded-xl border p-5 ${service.heroBackgroundImage ? "border-white/30 bg-white/10 backdrop-blur-sm" : "border-slate-200 bg-slate-50"}`}>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700/80 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700/90 active:scale-[0.97] sm:w-auto"
          >
            {siteCta.pricingLinkLabel}
          </Link>
        </div>
      </section>



    </ServicePageLayout>
  );
}
