"use client";

import Image from "next/image";
import { CalculatorProvider } from "@/lib/calculator-context";
import ServiceSelector from "@/components/ServiceSelector";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { useLanguage } from "@/lib/LanguageContext";
import type { ServiceCategory } from "@/lib/types";

export function CalculatorFormSection({
  initialCategory,
}: {
  initialCategory?: ServiceCategory;
}) {
  const { t } = useLanguage();
  return (
    <CalculatorProvider>
      {/* ── Calculator ─────────────────────────────────────────── */}
      <section className="relative z-10">
        <section className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto mb-6 max-w-150 text-center sm:mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[1.75rem]">
              {t("hero.promo_title", "Kuljetukset silloin kun tarvitset")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {t(
                "hero.promo_sub",
                "Pikakuljetukset, apuvälinekuljetukset, pienmuutot, kierrätys ja tavarakuljetukset yhdellä yhteydenotolla.",
              )}{" "}
              <a href="#quote" className="underline-offset-2 hover:underline">
                {t("hero.promo_cta", "Pyydä tarjous jo tänään.")}
              </a>
            </p>
          </div>
          <ServiceSelector initialCategory={initialCategory} />
        </section>
      </section>

      {/* ── Quote form background ──────────────────────────────── */}
      <section id="quote" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/paku5.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Vaalea overlay päälle, jotta lomake pysyy selkeänä */}
          <div className="absolute inset-0 bg-white/65" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#f5f6f8] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        {/* ── Quote form ─────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
          <QuoteRequestForm />
        </section>
      </section>
    </CalculatorProvider>
  );
}
