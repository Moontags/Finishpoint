"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteCta } from "@/lib/site-config";

export interface AlueConfig {
  kaupunki: string;
  kaupunkiGenitiivimuoto: string;
  kaupunkiSijaintimuoto: string;
  slug: string;
  lahialueet: string[];
}

export function AluePageClient({ config }: { config: AlueConfig }) {
  const { t, language } = useLanguage();

  const inCity =
    language === "fi" ? config.kaupunkiSijaintimuoto : config.kaupunki;
  const ofCity =
    language === "fi" ? config.kaupunkiGenitiivimuoto : config.kaupunki;

  const palvelut = [
    {
      href: "/muutot",
      title: t("area.moving_title"),
      body:
        language === "fi"
          ? `Kotimuutot ja asuntomuutot ${config.kaupunkiSijaintimuoto}. ${t("area.moving_body_suffix")}`
          : `Home and apartment moves in ${config.kaupunki}. ${t("area.moving_body_suffix")}`,
    },
    {
      href: "/laskuri",
      title: t("area.freight_title"),
      body:
        language === "fi"
          ? `${t("area.freight_body_prefix")} ${config.kaupunki}n ${t("area.freight_body_suffix")}`
          : `${t("area.freight_body_prefix")} ${config.kaupunki} ${t("area.freight_body_suffix")}`,
    },
    {
      href: "/#quote",
      title: t("area.business_title"),
      body: t("area.business_body"),
    },
    {
      href: "/laskuri",
      title: t("area.small_loads_title"),
      body: t("area.small_loads_body"),
    },
  ];

  return (
    <>
      <main className="overflow-x-clip">
        <div className="relative w-full overflow-hidden">
          {/* Background image — fills the full container, fades to #f5f6f8 toward bottom */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/images/paku2.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover
                object-[78%_20%]
                sm:object-[88%_12%]
                xl:object-[60%_35%]
                2xl:object-[55%_25%]"
              priority
            />
            {/* left-side white fade */}
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/15 lg:from-white/55 lg:via-white/30 lg:to-transparent" />
            {/* top white fade */}
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/80 to-transparent" />
            {/* bottom fade to page bg */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#f5f6f8] via-[#f5f6f8]/90 to-transparent" />
          </div>

          <div className="absolute inset-x-0 top-0 z-20">
            <SiteHeader forceTransparent noShadow />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-5 pt-28 pb-0 sm:px-8 sm:pt-32 lg:px-12">
            {/* Service cards */}
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              {t("area.services_label")} {inCity}
            </p>
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t("area.services_title")}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {palvelut.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="group rounded-2xl bg-white/30 p-5 shadow-sm backdrop-blur-sm transition hover:bg-white/60 hover:shadow-md"
                >
                  <h3 className="mb-1 text-base font-bold text-slate-900 transition group-hover:text-blue-600">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">{s.body}</p>
                </Link>
              ))}
            </div>

            <div className="mt-3 mb-8">
              <Link
                href={`/${siteCta.calculatorHref}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98]"
              >
                {t('service_page.order', 'Tilaa')}
              </Link>
            </div>

            {/* Local area section */}
            <div className="border-t border-slate-200 py-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                {t("area.local_label")}
              </p>
              <h2 className="mb-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                {t("area.local_title_prefix")} {ofCity} {t("area.local_title_suffix")}
              </h2>
              <p className="mb-4 max-w-2xl text-slate-500">
                {t("area.local_body_prefix")} {inCity}{" "}
                {t("area.local_body_suffix")}
              </p>
              <div className="flex flex-wrap gap-2">
                {[config.kaupunki, ...config.lahialueet, t("area.nearby")].map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-white/30 px-4 py-1.5 text-sm font-semibold text-slate-800 backdrop-blur-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <SiteFooter className="relative z-10 bg-transparent" />
        </div>
      </main>
    </>
  );
}
