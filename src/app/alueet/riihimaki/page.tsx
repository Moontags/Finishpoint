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
  title: "Kuljetuspalvelu Riihimäki – Muutto, rahti & pienkuormat | Finishpoint",
  description:
    "Luotettava kuljetuspalvelu Riihimäellä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Riihimäen alueen.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet/riihimaki" },
  openGraph: {
    title: "Kuljetuspalvelu Riihimäki – Finishpoint",
    description:
      "Luotettava kuljetuspalvelu Riihimäellä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.finishpoint.fi/alueet/riihimaki",
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
