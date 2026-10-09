import { SITE_URL } from "@/lib/site";
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
  alternates: { canonical: `${SITE_URL}/alueet/hyvinkaa` },
  openGraph: {
    title: "Kuljetuspalvelu Hyvinkää – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Hyvinkäällä. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: `${SITE_URL}/alueet/hyvinkaa`,
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
