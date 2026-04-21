import type { Metadata } from "next";
import { AluePageClient } from "@/app/alueet/AluePageClient";

const CONFIG = {
  kaupunki: "Vantaa",
  kaupunkiGenitiivimuoto: "Vantaan",
  kaupunkiSijaintimuoto: "Vantaalla",
  slug: "vantaa",
  lahialueet: ["Tikkurila", "Myyrmäki", "Korso", "Hakunila", "Martinlaakso", "Koivukylä"],
};

export const metadata: Metadata = {
  title: "Kuljetuspalvelu Vantaa – Muutto, rahti & pienkuormat | Pakuvie",
  description:
    "Luotettava kuljetuspalvelu Vantaalla. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat. Nopea tarjous – palvelemme koko Vantaan alueen.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet/vantaa" },
  openGraph: {
    title: "Kuljetuspalvelu Vantaa – Pakuvie",
    description:
      "Luotettava kuljetuspalvelu Vantaalla. Muuttokuljetukset, yrityskuljetukset, tavarankuljetus ja pienkuormat.",
    url: "https://www.pakuvie.fi/alueet/vantaa",
  },
};

export default function AlueVantaaPage() {
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
