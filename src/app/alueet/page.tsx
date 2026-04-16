import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Palvelualueet – Kuljetuspalvelu lähellä sinua | Finishpoint",
  description:
    "Finishpoint tarjoaa luotettavaa kuljetuspalvelua Riihimäellä, Hyvinkäällä, Järvenpäässä, Hämeenlinnassa ja Tuusulassa. Muuttokuljetukset, tavarankuljetus ja pienkuormat.",
  alternates: { canonical: "https://www.finishpoint.fi/alueet" },
  openGraph: {
    title: "Palvelualueet – Kuljetuspalvelu lähellä sinua | Finishpoint",
    description:
      "Finishpoint tarjoaa luotettavaa kuljetuspalvelua Riihimäellä, Hyvinkäällä, Järvenpäässä, Hämeenlinnassa ja Tuusulassa.",
    url: "https://www.finishpoint.fi/alueet",
  },
};

const ALUEET = [
  {
    nimi: "Riihimäki",
    slug: "riihimaki",
    kuvaus: "Muuttokuljetukset, tavarankuljetus ja pienkuormat Riihimäellä ja lähialueilla.",
  },
  {
    nimi: "Hyvinkää",
    slug: "hyvinkaa",
    kuvaus: "Luotettava kuljetuspalvelu Hyvinkäällä – muutot, rahti ja yrityskuljetukset.",
  },
  {
    nimi: "Järvenpää",
    slug: "jarvenpaa",
    kuvaus: "Nopea kuljetus Järvenpäässä. Muuttokuljetukset, pienkuormat ja nouto.",
  },
  {
    nimi: "Hämeenlinna",
    slug: "hameenlinna",
    kuvaus: "Kuljetuspalvelu Hämeenlinnassa – muutot, yrityskuljetukset ja tavarankuljetus.",
  },
  {
    nimi: "Tuusula",
    slug: "tuusula",
    kuvaus: "Kuljetukset Tuusulassa ja lähialueilla: Hyrylä, Kellokoski, Jokela ja ympäristö.",
  },
];

export default function AlueetPage() {
  return (
    <>
      <SiteHeader opaque />
      <main>
        <section className="area-hero">
          <div className="area-hero__inner">
            <p className="area-hero__tag">Palvelualueet</p>
            <h1 className="area-hero__title">Kuljetuspalvelu lähellä sinua</h1>
            <p className="area-hero__sub">
              Finishpoint toimii useilla paikkakunnilla Etelä-Suomessa. Valitse alueesi ja kysy tarjous – vastaamme saman päivän aikana.
            </p>
          </div>
        </section>

        <section className="area-section">
          <p className="area-label">Kaikki alueet</p>
          <h2 className="area-title">Missä palvelemme?</h2>
          <div className="area-services">
            {ALUEET.map((a) => (
              <Link key={a.slug} href={`/alueet/${a.slug}`} className="area-service-card">
                <h3>Kuljetus {a.nimi}</h3>
                <p>{a.kuvaus}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="area-cta">
          <h2>Ei löytynyt omaa aluettasi?</h2>
          <p>Palvelemme myös muilla alueilla – kysy tarjous!</p>
          <div className="area-cta__btns">
            <Link href="/#quote" className="btn btn--primary btn--lg">Pyydä tarjous</Link>
            <a href="tel:0503547763" className="btn btn--outline-light btn--lg">050 354 7763</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
