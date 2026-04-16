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
  title: "Kuljetuspalvelu Hyvinkää – Muutto, rahti & pienkuormat | Finishpoint",
  description:
    "Luotettava kuljetuspalvelu Hyvinkäällä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Hyvinkään alueen.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet/hyvinkaa" },
  openGraph: {
    title: "Kuljetuspalvelu Hyvinkää – Finishpoint",
    description:
      "Luotettava kuljetuspalvelu Hyvinkäällä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.finishpoint.fi/alueet/hyvinkaa",
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
