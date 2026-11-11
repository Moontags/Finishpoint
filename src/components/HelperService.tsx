"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { apumiesPriceSummary, apumiesPriceTerms } from "@/lib/pricing";
import { siteCta } from "@/lib/site-config";

export function HelperService({ home = false }: { home?: boolean }) {
  const { language } = useLanguage();
  const english = language === "en";
  return (
    <section className={home ? "home-container home-helper" : "space-y-5"} aria-label={english ? "Carrying help" : "Apumiespalvelu"}>
      <div className="home-service-card">
        <div className="home-service-copy">
          <h2 className="text-2xl font-bold">{english ? "Need help carrying?" : "Tarvitsetko kantoapua?"}</h2>
          <p>{english ? "Add a helper to your transport for heavy lifting – appliances, furniture and moves." : "Saat kuljetuksen mukaan apumiehen raskaisiin kantoihin – kodinkoneet, huonekalut ja muutot."}</p>
          <p className="text-lg font-bold">{apumiesPriceSummary(english)}</p>
          <p>{apumiesPriceTerms(english)}</p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${siteCta.quoteSectionHref}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-700 px-6 py-3 font-bold text-white hover:bg-slate-800">
              {english ? "Request a quote" : siteCta.requestQuoteLabel}
            </Link>
            {home ? <Link href="/muutot#apumies" className="home-card-link inline-flex min-h-11 items-center">{english ? "Learn more" : "Lue lisää"} →</Link> : null}
          </div>
        </div>
      </div>
      {!home ? (
        <details className="rounded-xl border border-slate-300 bg-white p-5">
          <summary className="cursor-pointer font-bold">{english ? "How much does a helper cost?" : "Mitä apumies maksaa?"}</summary>
          <p className="mt-3">{apumiesPriceSummary(english)}. {apumiesPriceTerms(english)}</p>
        </details>
      ) : null}
    </section>
  );
}
