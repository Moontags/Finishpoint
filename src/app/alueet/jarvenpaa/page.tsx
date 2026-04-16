import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Järvenpää",
  kaupunkiGenitiivimuoto: "Järvenpään",
  kaupunkiSijaintimuoto: "Järvenpäässä",
  slug: "jarvenpaa",
  lahialueet: ["Kyrölä", "Nummenkylä", "Sauna-Kalkki", "Haarajoki", "Lepola"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Järvenpää – Muutto, rahti & pienkuormat | Finishpoint",
  description:
    "Luotettava kuljetuspalvelu Järvenpäässä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Järvenpään alueen.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet/jarvenpaa" },
  openGraph: {
    title: "Kuljetuspalvelu Järvenpää – Finishpoint",
    description:
      "Luotettava kuljetuspalvelu Järvenpäässä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.finishpoint.fi/alueet/jarvenpaa",
  },
};

export default function AlueJarvenpaaPage() {
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
