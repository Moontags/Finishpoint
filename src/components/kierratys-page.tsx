"use client";

import { ArrowRight } from "lucide-react";
import ServicePageLayout from "@/components/ServicePageLayout";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ServiceList } from "@/components/ServiceList";
import { KierratysQuoteForm } from "@/components/kierratys-quote-form";
import { services } from "@/lib/services";
import { useLanguage } from "@/lib/LanguageContext";

const service = services.kierratys;

// "Alkaen"-hinta tarjouspohjaiselle palvelulle — ei kiinteä hinta.
const HINTA_ALKAEN = "79";

// Esimerkkilaskelma: täysi pakettiauto sekajätettä.
const ESIMERKKI_JATEMAKSU = "148,50";
const ESIMERKKI_KULJETUS = "99";

const KIERTOKAPULA_SHOP_URL = "https://shop.pinja.cloud/kiertokapula/start";

const sectionClass =
  "rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8";

export function KierratysPage() {
  const { t } = useLanguage();

  const steps = [
    {
      title: t("kierratys.step1.title", "1. Kerro meille mitä viedään"),
      description: t(
        "kierratys.step1.description",
        'Täytä lomake: minkälaista tavaraa tai jätettä, arvioitu määrä (esim. "täysi pakettiauto sekajätettä"), nouto-osoite ja toivottu ajankohta.',
      ),
    },
    {
      title: t("kierratys.step2.title", "2. Sovimme ajankohdan"),
      description: t(
        "kierratys.step2.description",
        "Vahvistamme sinulle sopivan noutoajan sähköpostitse tai puhelimitse.",
      ),
    },
    {
      title: t("kierratys.step3.title", "3. Maksat jätemaksun kierrätysasemalle"),
      description: t(
        "kierratys.step3.description",
        "Maksu hoidetaan etukäteen Kiertokapulan verkkokaupassa. Muista syöttää maksun yhteydessä automme rekisterinumero — sen avulla pääsemme kierrätysasemalle. Maksu on voimassa 30 päivää maksuhetkestä.",
      ),
    },
    {
      title: t("kierratys.step4.title", "4. Nouto ja lajittelu"),
      description: t(
        "kierratys.step4.description",
        "Tulemme sovittuna päivänä, kannamme tavarat pois ja lajittelemme ne oikeisiin jakeisiin (sekajäte, metalli, puu, sähkölaitteet jne.) ennen kierrätysasemalle viemistä.",
      ),
    },
    {
      title: t("kierratys.step5.title", "5. Lasku vain työstä"),
      description: t(
        "kierratys.step5.description",
        "Laskutamme vain kuljetuksesta ja lajittelutyöstä, joten laskusi on selkeä ja läpinäkyvä.",
      ),
    },
  ];

  return (
    <ServicePageLayout
      title={t("services.kierratys.title", service.title)}
      description={t("services.kierratys.description", service.description)}
    >
      {/* Hero-CTA */}
      <div>
        <a
          href="#quote"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] sm:w-auto"
        >
          {t("kierratys.cta_quote", "Pyydä tarjous")}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Miten palvelu toimii */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("kierratys.how_it_works", "Miten palvelu toimii")}
        </h2>
        <div className="mt-6">
          <ProcessSteps steps={steps} />
        </div>

        {/* Kiertokapulan verkkokauppa liittyy vaiheeseen 3. ProcessSteps ottaa
            vastaan vain tekstiä, joten linkki ja huomautus ovat vaiheiden alla. */}
        <div className="mt-5 space-y-2">
          <a
            href={KIERTOKAPULA_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="kiertokapula-shop-link"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-blue-700 underline underline-offset-2 transition hover:text-blue-800 sm:text-base"
          >
            {t("kierratys.shop_link", "Siirry Kiertokapulan verkkokauppaan")}
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="max-w-3xl text-[13px] italic leading-[1.7] text-slate-600 sm:text-[14px]">
            {t(
              "kierratys.shop_note",
              "Saat tarkat ohjeet ja rekisterinumeron sähköpostitse.",
            )}
          </p>
        </div>
      </section>

      {/* Hinnoittelu */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("services.kierratys.pricingTitle", service.pricingTitle)}
        </h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t("services.kierratys.pricingDescription", service.pricingDescription)}
        </p>

        <div className="mt-6">
          <ServiceList
            items={[
              `${t("kierratys.price_transport", "Kuljetus ja lajittelu alkaen")} ${HINTA_ALKAEN} €`,
              t(
                "kierratys.price_fee_note",
                "Jätemaksun suuruus riippuu jätelajista ja määrästä — näet tarkan hinnan kierrätysaseman verkkokaupassa ennen maksamista",
              ),
            ]}
          />
        </div>

        <p className="mt-5 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t("kierratys.price_example", "Esimerkki: Täysi pakettiauto sekajätettä")} →{" "}
          {t("kierratys.price_example_fee", "jätemaksu kierrätysasemalle n.")}{" "}
          {ESIMERKKI_JATEMAKSU} €,{" "}
          {t("kierratys.price_example_transport", "kuljetus ja lajittelu meiltä")}{" "}
          {ESIMERKKI_KULJETUS} €.
        </p>
      </section>

      {/* Mitä otamme mukaan */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("kierratys.includes_title", "Mitä otamme mukaan")}
        </h2>
        <div className="mt-6">
          <ServiceList
            items={service.includes.map((item, i) =>
              t(`services.kierratys.includes.${i}`, item),
            )}
          />
        </div>
        <p className="mt-5 max-w-3xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t(
            "kierratys.excludes_note",
            "Ei sisällä vaarallista jätettä, esim. maaleja, kemikaaleja tai akkuja — kysy näistä erikseen.",
          )}
        </p>
      </section>

      {/* Tarjouspyyntölomake */}
      <KierratysQuoteForm />

    </ServicePageLayout>
  );
}
