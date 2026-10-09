import { SITE_URL } from "@/lib/site";
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
  alternates: { canonical: `${SITE_URL}/alueet/hameenlinna` },
  openGraph: {
    title: "Kuljetuspalvelu Hämeenlinna – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Hämeenlinnassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: `${SITE_URL}/alueet/hameenlinna`,
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
            url: SITE_URL,
            telephone: "0503547763",
            email: "kuljetus@pakuvie.fi",
            areaServed: { "@type": "City", name: CONFIG.kaupunki },
            serviceType: ["Muuttokuljetukset", "Yrityskuljetukset", "Tavarankuljetus", "Pienkuormat", "Apuvälinekuljetus"],
          }),
        }}
      />
      <AluePageClient config={CONFIG} />
    </>
  );
}
