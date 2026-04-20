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
  title: "Kuljetuspalvelu Hämeenlinna – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Hämeenlinnassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Hämeenlinnan alueen.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet/hameenlinna" },
  openGraph: {
    title: "Kuljetuspalvelu Hämeenlinna – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Hämeenlinnassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.pakuvie.fi/alueet/hameenlinna",
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
            name: "Pakuvie",
            url: "https://www.pakuvie.fi",
            telephone: "0503547763",
            email: "kuljetus@pakuvie.fi",
            areaServed: { "@type": "City", name: CONFIG.kaupunki },
            serviceType: ["Muuttokuljetukset", "Yrityskuljetukset", "Tavarankuljetus", "Pienkuormat"],
          }),
        }}
      />
      <AluePageClient config={CONFIG} />
    </>
  );
}
