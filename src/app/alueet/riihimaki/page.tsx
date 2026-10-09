import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Riihimäki",
  kaupunkiGenitiivimuoto: "Riihimäen",
  kaupunkiSijaintimuoto: "Riihimäellä",
  slug: "riihimaki",
  lahialueet: ["Herajoki", "Hiivola", "Patastenmäki", "Lasitehdas", "Peltosaari"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Riihimäki – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Riihimäellä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Riihimäen alueen.",
  alternates: { canonical: `${SITE_URL}/alueet/riihimaki` },
  openGraph: {
    title: "Kuljetuspalvelu Riihimäki – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Riihimäellä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: `${SITE_URL}/alueet/riihimaki`,
  },
};

export default function AlueRiihimakiPage() {
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
