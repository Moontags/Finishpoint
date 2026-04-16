import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Hämeenlinna",
  kaupunkiGenitiivimuoto: "Hämeenlinnan",
  kaupunkiSijaintimuoto: "Hämeenlinnassa",
  slug: "hameenlinna",
  lahialueet: ["Hämeensaari", "Kantola", "Nummi", "Ruununmylly", "Kirstula"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Hämeenlinna – Muutto, rahti & pienkuormat | Finishpoint",
  description:
    "Luotettava kuljetuspalvelu Hämeenlinnassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Hämeenlinnan alueen.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet/hameenlinna" },
  openGraph: {
    title: "Kuljetuspalvelu Hämeenlinna – Finishpoint",
    description:
      "Luotettava kuljetuspalvelu Hämeenlinnassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.finishpoint.fi/alueet/hameenlinna",
  },
};

export default function AlueHameenlinnaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MovingCompany",
            name: "Finishpoint",
            url: "https://www.finishpoint.fi",
            telephone: "0503547763",
            email: "kuljetus@finishpoint.fi",
            areaServed: { "@type": "City", name: CONFIG.kaupunki },
            serviceType: ["Muuttokuljetukset", "Yrityskuljetukset", "Tavarankuljetus", "Pienkuormat"],
          }),
        }}
      />
      <AluePageClient config={CONFIG} />
    </>
  );
}
