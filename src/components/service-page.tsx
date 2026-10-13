"use client";
import Link from "next/link";
import ServicePageLayout from "@/components/ServicePageLayout";
import { ServiceList } from "@/components/ServiceList";
import type { ServiceContent } from "@/lib/services";
import { siteCta } from "@/lib/site-config";
import { useLanguage } from "@/lib/LanguageContext";

export function ServicePage({
  service,
  seasonBanner,
}: {
  service: ServiceContent;
  seasonBanner?: string;
}) {
  const { t } = useLanguage();
  const title = t(`services.${service.slug}.title`, service.title);
  const description = t(`services.${service.slug}.description`, service.description);
  return (
    <ServicePageLayout title={title} description={description}>
      {seasonBanner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-[14px] font-semibold text-emerald-700 backdrop-blur-sm sm:text-[15px]">
          {seasonBanner}
        </div>
      ) : null}

      {service.slug !== 'muutot' && (
        <section className="relative grid gap-5 overflow-hidden rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative z-1 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t(`services.${service.slug}.valueProposition`, service.valueProposition)}
            </h2>
            <p className="max-w-xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
              {t('service_page.flexible', 'Palvelemme joustavasti myös viikonloppuisin.')}
            </p>
          </div>

          <div className="relative z-1 rounded-xl border border-slate-300 bg-white/40 p-5 backdrop-blur-sm">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.22em] text-blue-600 sm:text-[15px]">
              {t('service_page.includes', 'Sisältää')}
            </p>
            <div className="mt-4">
              <ServiceList items={service.includes.map((item, i) => t(`services.${service.slug}.includes.${i}`, item))} />
            </div>
          </div>
        </section>
      )}

      {service.slug === 'muutot' ? (
        <section className="rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8" aria-labelledby="two-room-move-title">
          <h2 id="two-room-move-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t('services.muutot.twoRoom.title', 'Kaksion muutto – kaksi kantajaa, pakettiauto ja peräkärry')}
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
            {t('services.muutot.twoRoom.description', 'Muuttoapu myös silloin, kun tavaraa ja kannettavaa on enemmän. Kaksi kantajaa hoitaa myös sohvien, sänkyjen ja muiden suurten kalusteiden kantamisen portaissa. Peräkärry on aina mukana kaksioiden ja isommissa muutoissa.')}
          </p>
          <p className="mt-4 text-xl font-bold text-slate-900">
            {t('services.muutot.twoRoom.estimate', 'Arvioitu kokonaishinta 449 € sis. ALV')}
          </p>
          <p className="mt-2 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
            {t('services.muutot.twoRoom.note', 'Arvio koskee enintään 40 km muuttoa. Lopullinen hinta vahvistetaan tavaramäärän, kantamisen, arvioidun keston ja ajomatkan perusteella. Kerro tarjouspyynnössä osoitteet, kerrokset, hissit ja arvio tavaramäärästä.')}
          </p>
          <Link href="/#quote" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 sm:w-auto">
            {t('services.muutot.twoRoom.cta', 'Pyydä tarjous kaksion muutosta')}
          </Link>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t(`services.${service.slug}.pricingTitle`, service.pricingTitle)}</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t(`services.${service.slug}.pricingDescription`, service.pricingDescription)}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/${siteCta.quoteSectionHref}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] sm:w-auto"
          >
            {t('service_page.go_to_order', 'Siirry tilaamaan')}
          </Link>
        </div>
      </section>



    </ServicePageLayout>
  );
}
