import { SITE_URL } from "@/lib/site";
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
  title: "Kuljetuspalvelu Järvenpää – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Järvenpäässä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Järvenpään alueen.",
  alternates: { canonical: `${SITE_URL}/alueet/jarvenpaa` },
  openGraph: {
    title: "Kuljetuspalvelu Järvenpää – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Järvenpäässä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: `${SITE_URL}/alueet/jarvenpaa`,
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
