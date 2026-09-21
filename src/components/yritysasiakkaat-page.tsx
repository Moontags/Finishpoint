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
    t(
      "yritys.contract.benefit1",
      "Kiinteä nouto- ja toimitusaikataulu viikoittain tai kuukausittain",
    ),
    t(
      "yritys.contract.benefit2",
      "Sama kuljettaja ja tuttu kalusto — tarvetta ei tarvitse selittää joka kerta uudelleen",
    ),
    t(
      "yritys.contract.benefit3",
      "Joustava sopimus: määrää ja aikataulua voi muuttaa kesken kauden",
    ),
    t(
      "yritys.contract.benefit4",
      "Kuljetukset laskulla, hinnat ALV 0 % eli verottomina",
    ),
  ];

  const faqItems = [
    {
      question: t(
        "yritys.faq.q1",
        "Voinko aloittaa yhdellä kuljetuksella ja siirtyä myöhemmin sopimukseen?",
      ),
      answer: t(
        "yritys.faq.a1",
        "Kyllä. Useimmat yritysasiakkaat aloittavat yhdellä kuljetuksella. Kun tarve toistuu, sovitaan kuukausisopimus samoilla yhteyshenkilöillä ja käytännöillä.",
      ),
    },
    {
      question: t("yritys.faq.q2", "Miten laskutus toimii?"),
      answer: t(
        "yritys.faq.a2",
        "Yrityksille hinnat ilmoitetaan ALV 0 % eli verottomina, ja kuljetukset hoituvat laskulla. Yksittäisen kuljetuksen voi halutessaan maksaa myös heti verkossa etusivun laskurista.",
      ),
    },
    {
      question: t("yritys.faq.q3", "Miten nopeasti pääsemme alkuun?"),
      answer: t(
        "yritys.faq.a3",
        "Vastaamme tarjouspyyntöön yleensä saman päivän aikana. Yksittäinen kuljetus onnistuu usein jo seuraavaksi päiväksi, ja sopimuksen yksityiskohdat sovitaan yhdellä puhelulla.",
      ),
    },
  ];

  return (
    <ServicePageLayout
      label={t("yritys.hero.label", "Yrityksille")}
      title={t("yritys.hero.title", "Kuljetuspalvelut yrityksille")}
      description={t(
        "yritys.hero.description",
        "Palvelemme yrityksiä sekä yksittäisissä kuljetuksissa että toistuvissa kuljetustarpeissa. Hinnat ilmoitetaan yrityksille ALV 0 % eli verottomina, ja kuljetukset hoituvat laskulla.",
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
            "Jos yrityksellänne on kiinteä kuljetustarve viikoittain tai kuukausittain, sovitaan siitä kuukausisopimus. Silloin kuljetukset kulkevat sovitulla aikataululla eikä jokaista kuljetusta tarvitse tilata erikseen.",
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

      {/* UKK yritysostajalle */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("yritys.faq.title", "Usein kysyttyä")}
        </h2>
        <dl className="mt-6 grid gap-3">
          {faqItems.map(({ question, answer }) => (
            <div key={question} className="rounded-xl bg-white px-4 py-4">
              <dt className="text-[15px] font-bold text-slate-900">{question}</dt>
              <dd className="mt-2 text-[14px] leading-[1.75] text-slate-700">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tarjouslomake — sama komponentti kuin etusivulla, palvelutyyppi
          esivalittuna kuukausisopimukseksi. */}
      <section className="rounded-2xl border border-slate-300 bg-white/30 shadow-sm backdrop-blur-sm">
        <QuoteRequestForm initialServiceType={MONTHLY_CONTRACT_SERVICE_TYPE} />
      </section>
    </ServicePageLayout>
  );
}
