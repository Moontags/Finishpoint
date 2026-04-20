import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Hyvinkää",
  kaupunkiGenitiivimuoto: "Hyvinkään",
  kaupunkiSijaintimuoto: "Hyvinkäällä",
  slug: "hyvinkaa",
  lahialueet: ["Sveitsi", "Palopuro", "Kaukas", "Noppo", "Haapahuhta"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Hyvinkää – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Hyvinkäällä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Hyvinkään alueen.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet/hyvinkaa" },
  openGraph: {
    title: "Kuljetuspalvelu Hyvinkää – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Hyvinkäällä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.pakuvie.fi/alueet/hyvinkaa",
  },
};

export default function AlueHyvinkaaPage() {
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
