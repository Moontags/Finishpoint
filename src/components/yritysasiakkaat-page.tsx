"use client";

import { ArrowUpRight } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";
import { ServiceList } from "@/components/ServiceList";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { useLanguage } from "@/lib/LanguageContext";
import { MONTHLY_CONTRACT_SERVICE_TYPE } from "@/lib/services";

const sectionClass =
  "rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8";

export function YritysasiakkaatPage() {
  const { t } = useLanguage();

  const contractBenefits = [
    t("yritys.contract.benefit1", "Sovitut nouto- ja toimitusajat"),
    t("yritys.contract.benefit2", "Kuljetukset tarpeenne mukaan"),
    t("yritys.contract.benefit3", "Helppo tilaus ja yhteydenpito"),
    t(
      "yritys.contract.benefit4",
      "Mahdollisuus muuttaa kuljetusten määrää tarpeen mukaan",
    ),
    t("yritys.contract.benefit5", "Laskutus yritykselle"),
  ];

  return (
    <ServicePageLayout
      label={t("yritys.hero.label", "Yrityksille")}
      title={t("yritys.hero.title", "Kuljetuspalvelut yrityksille")}
      description={t(
        "yritys.hero.description",
        "Tarjoamme yrityksille kuljetuspalvelua yksittäisiin tarpeisiin ja säännöllisiin kuljetuksiin. Hoidamme esimerkiksi tavaroiden, koneiden, kalusteiden ja muiden suurempien lähetysten noutoja ja toimituksia sovitusti.",
      )}
      secondaryDescription={t(
        "yritys.hero.description2",
        "Kun kuljetustarve toistuu, voimme sopia yrityksellenne jatkuvasta kuljetuspalvelusta. Näin kuljetukset hoituvat helposti ilman, että jokaista toimitusta tarvitsee järjestää alusta asti uudelleen.",
      )}
    >
      {/* Kuukausisopimus */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("yritys.contract.title", "Kuukausisopimus toistuviin kuljetuksiin")}
        </h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t(
            "yritys.contract.description",
            "Jos yrityksellänne on säännöllinen kuljetustarve, sovitaan yhdessä toimiva aikataulu ja käytännöt.",
          )}
        </p>

        <div className="mt-6">
          <ServiceList items={contractBenefits} />
        </div>

        <div className="mt-6">
          <a
            href="#quote"
            data-testid="yritys-contract-cta"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-[0.5px] border-slate-400 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98]"
          >
            {t("yritys.contract.cta", "Kysy tarjous kuukausisopimuksesta")}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Tarjouslomake — sama komponentti kuin etusivulla, palvelutyyppi
          esivalittuna kuukausisopimukseksi. */}
      <section className="rounded-2xl border border-slate-300 bg-white/30 shadow-sm backdrop-blur-sm">
        <QuoteRequestForm initialServiceType={MONTHLY_CONTRACT_SERVICE_TYPE} />
      </section>
    </ServicePageLayout>
  );
}
