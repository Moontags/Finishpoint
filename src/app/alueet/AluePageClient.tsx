"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
      <SiteHeader opaque />
      <main className="min-h-screen bg-white">

        {/* Palvelut */}
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            {t("area.services_label")} {inCity}
          </p>
          <h2 className="mb-8 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {t("area.services_title")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {palvelut.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="mb-2 text-base font-bold text-slate-900 transition group-hover:text-blue-600">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.body}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Paikallinen palvelu */}
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              {t("area.local_label")}
            </p>
            <h2 className="mb-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
              {t("area.local_title_prefix")} {ofCity} {t("area.local_title_suffix")}
            </h2>
            <p className="mb-6 max-w-2xl text-slate-500">
              {t("area.local_body_prefix")} {inCity}{" "}
              {t("area.local_body_suffix")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[config.kaupunki, ...config.lahialueet, t("area.nearby")].map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

      </main>
      <SiteFooter />
    </>
  );
}
