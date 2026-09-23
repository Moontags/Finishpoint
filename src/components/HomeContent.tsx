"use client";

import Image from "next/image";
import Link from "next/link";
import { CalculatorProvider } from "@/lib/calculator-context";
import { useLanguage } from "@/lib/LanguageContext";
import ServiceSelector from "@/components/ServiceSelector";
import TruckDimensions from "@/components/TruckDimensions";
import { QuoteRequestForm } from "@/components/quote-request-form";

const cards = [
  { title: "Pienkuljetukset", en: "Small deliveries", description: "Yksittäiset tavarat luotettavasti perille.", descriptionEn: "Reliable delivery for individual items.", href: "/pesukone-kuljetus", image: "/images/pienkuljetus.png" },
  { title: "Muutot", en: "Moving", description: "Apua pieniin ja suurempiin muuttoihin.", descriptionEn: "Help with small and larger moves.", href: "/muutot", image: "/images/muutto.jpeg" },
  { title: "Apuvälinekuljetukset", en: "Mobility aid transport", description: "Huolellisesti ja turvallisesti perille.", descriptionEn: "Careful and safe transport.", href: "/apuvalinekuljetus", image: "/images/paku3.png" },
  { title: "Kierrätys", en: "Recycling", description: "Vastuullista kierrätystä helposti.", descriptionEn: "Responsible recycling made easy.", href: "/kierratys", image: "/images/kierratys.png" },
  { title: "Yrityskuljetukset", en: "Business deliveries", description: "Joustavat kuljetukset yrityksesi arkeen.", descriptionEn: "Flexible transport for your business.", href: "/yritysasiakkaat", image: "/images/yritys.png" },
  { title: "Tavarakuljetukset", en: "Goods transport", description: "Monipuoliset kuljetusratkaisut tarpeesi mukaan.", descriptionEn: "Versatile transport tailored to your needs.", href: "/sohvan-kuljetus", image: "/images/tavara.png" },
];

export function HomeContent() {
  const { language, t } = useLanguage();
  const english = language === "en";
  return (
    <CalculatorProvider>
      <section id="top" className="home-hero home-container" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-eyebrow">{english ? "Delivered with care" : "Luotettavasti perille"}</p>
          <h1 id="home-title">{english ? "Transport when you need it" : "Kuljetukset silloin kun tarvitset"}</h1>
          <p>{english ? "Fast, reliable transport for individuals and businesses." : "Nopeat ja luotettavat kuljetukset yksityisille ja yrityksille."}</p>
          <a className="home-primary" href="#calculator">{t("calculator.calculate_price", "Laske hinta")} <span aria-hidden="true">→</span></a>
        </div>
        <div className="home-hero-image">
          <Image src="/images/paku.png" alt={english ? "Pakuvie's transport van" : "Pakuvien kuljetusauto"} fill priority sizes="(max-width: 767px) 100vw, 55vw" className="object-contain" />
        </div>
      </section>

      <div className="home-container home-calculator">
        <h2>{english ? "Calculate your transport price" : "Laske kuljetuksen hinta"}</h2>
        <ServiceSelector showDimensions={false} />
      </div>

      <section id="services" className="home-container home-services" aria-labelledby="services-title">
        <h2 id="services-title">{english ? "Our popular services" : "Suosituimmat palvelumme"}</h2>
        <div className="home-service-grid">
          {cards.map(card => (
            <Link className="home-service-card" key={card.href} href={card.href}>
              <div className="home-service-image">
                <Image src={card.image} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="home-service-copy">
                <h3>{english ? card.en : card.title}</h3>
                <p>{english ? card.descriptionEn : card.description}</p>
                <span className="home-card-link">{english ? "Learn more" : "Lue lisää"} <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-fleet" aria-labelledby="fleet-title">
        <div className="home-container home-fleet-grid">
          <div><h2 id="fleet-title">{english ? "Our van and cargo space" : "Kalusto ja tavaratila"}</h2><p>{english ? "A spacious Ford Transit for everyday deliveries and larger loads." : "Tilava Ford Transit sopii niin pieniin kuljetuksiin kuin suurempiinkin tarpeisiin."}</p></div>
          <div className="home-fleet-image"><Image src="/images/paku.png" alt={english ? "Ford Transit van" : "Ford Transit -pakettiauto"} fill sizes="(max-width: 767px) 100vw, 35vw" className="object-contain" /></div>
          <TruckDimensions />
        </div>
      </section>

      <section className="home-container home-quote"><QuoteRequestForm /></section>
    </CalculatorProvider>
  );
}
