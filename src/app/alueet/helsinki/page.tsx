import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Helsinki",
  kaupunkiGenitiivimuoto: "Helsingin",
  kaupunkiSijaintimuoto: "Helsingissä",
  slug: "helsinki",
  lahialueet: ["Kallio", "Vuosaari", "Malmi", "Herttoniemi", "Pasila", "Kannelmäki"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Helsinki – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Helsingissä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Helsingin alueen.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet/helsinki" },
  openGraph: {
    title: "Kuljetuspalvelu Helsinki – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Helsingissä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.pakuvie.fi/alueet/helsinki",
  },
};

export default function AlueHelsinkiPage() {
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
            serviceType: ["Muuttokuljetukset", "Yrityskuljetukset", "Tavarankuljetus", "Pienkuormat", "Apuvälinekuljetus"],
          }),
        }}
      />
      <AluePageClient config={CONFIG} />
    </>
  );
}
