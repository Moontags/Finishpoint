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
  title: "Kuljetuspalvelu Tuusula – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Tuusulassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Tuusulan alueen.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet/tuusula" },
  openGraph: {
    title: "Kuljetuspalvelu Tuusula – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Tuusulassa. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.pakuvie.fi/alueet/tuusula",
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
