import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Tuusula",
  kaupunkiGenitiivimuoto: "Tuusulan",
  kaupunkiSijaintimuoto: "Tuusulassa",
  slug: "tuusula",
  lahialueet: ["Hyrylä", "Kellokoski", "Jokela", "Rusutjärvi", "Nahkela"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Tuusula – Muutto, rahti & pienkuormat | Finishpoint",
  description:
    "Luotettava kuljetuspalvelu Tuusulassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Tuusulan alueen.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet/tuusula" },
  openGraph: {
    title: "Kuljetuspalvelu Tuusula – Finishpoint",
    description:
      "Luotettava kuljetuspalvelu Tuusulassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.finishpoint.fi/alueet/tuusula",
  },
};

export default function AlueTuusulaPage() {
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
