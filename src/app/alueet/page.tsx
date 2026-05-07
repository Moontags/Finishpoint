import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteCta } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Palvelualueet – Kuljetuspalvelu lähellä sinua | Pakuvie",
  description:
    "Pakuvie tarjoaa luotettavaa kuljetuspalvelua Riihimäellä, Hyvinkäällä, Järvenpäässä, Hämeenlinnassa, Tuusulassa ja Vantaalla. Muuttokuljetukset, tavarankuljetus ja pienkuormat.",
  alternates: { canonical: "https://www.pakuvie.fi/alueet" },
  openGraph: {
    title: "Palvelualueet – Kuljetuspalvelu lähellä sinua | Pakuvie",
    description:
      "Pakuvie tarjoaa luotettavaa kuljetuspalvelua Riihimäellä, Hyvinkäällä, Järvenpäässä, Hämeenlinnassa, Tuusulassa ja Vantaalla.",
    url: "https://www.pakuvie.fi/alueet",
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
  {
    nimi: "Vantaa",
    slug: "vantaa",
    kuvaus: "Kuljetuspalvelu Vantaalla – muutot, tavarankuljetus ja pienkuormat koko Vantaan alueella.",
  },
];

export default function AlueetPage() {
  return (
    <>
      <SiteHeader opaque />
      <main className="min-h-screen overflow-x-clip bg-[#f5f6f8]">
        <div className="relative w-full min-h-80 overflow-hidden sm:min-h-125 md:min-h-150 lg:min-h-175 xl:min-h-[820px] 2xl:min-h-[920px]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="relative h-[72%] w-full overflow-hidden">
              <Image
                src="/images/paku2.png"
                alt=""
                fill
                sizes="100vw"
                className="object-cover
                  object-[78%_20%]
                  sm:object-[88%_12%]
                  xl:object-[60%_35%]
                  2xl:object-[55%_25%]"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/15 lg:from-white/55 lg:via-white/30 lg:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 top-[20%] bg-linear-to-b from-transparent via-black/20 to-black/45 lg:top-[15%] lg:via-black/30 lg:to-black/55" />
            </div>
            <div className="absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-white/80 to-transparent lg:h-[17%] lg:from-white/65" />
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[#f5f6f8] via-[#f5f6f8]/88 to-transparent sm:h-[50%] lg:h-[45%]" />
          </div>

          <section className="relative z-10 mx-auto max-w-7xl px-5 pt-10 pb-6 sm:px-8 lg:px-12 lg:pt-14">
            <div className="max-w-3xl space-y-3">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.28em] text-blue-600 sm:text-[15px]">
                Palvelualueet
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Kuljetuspalvelu lähellä sinua
              </h1>
              <p className="text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Pakuvie toimii useilla paikkakunnilla Etelä-Suomessa. Valitse alueesi ja kysy tarjous – vastaamme saman päivän aikana.
              </p>
            </div>
          </section>

          <section className="relative z-10 mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">Kaikki alueet</p>
            <h2 className="mb-8 text-2xl font-extrabold text-slate-900 sm:text-3xl">Missä palvelemme?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ALUEET.map((a) => (
                <Link
                  key={a.slug}
                  href={`/alueet/${a.slug}`}
                  className="group rounded-2xl border border-slate-300 bg-white/30 p-6 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/60 hover:shadow-md"
                >
                  <h3 className="mb-2 text-base font-bold text-slate-900 transition group-hover:text-blue-600">Kuljetus {a.nimi}</h3>
                  <p className="text-sm leading-relaxed text-slate-700">{a.kuvaus}</p>
                </Link>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-300 bg-white/30 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ei löytynyt omaa aluettasi?</h2>
              <p className="mt-3 text-[14px] leading-[1.75] text-slate-700 sm:text-base">
                Palvelemme myös muilla alueilla – kysy tarjous!
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${siteCta.calculatorHref}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] sm:w-auto"
                >
                  Tilaa
                </Link>
                <Link
                  href={`/${siteCta.quoteSectionHref}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] sm:w-auto"
                >
                  {siteCta.requestQuoteLabel}
                </Link>
                <a
                  href="tel:0503547763"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] sm:w-auto"
                >
                  050 354 7763
                </a>
              </div>
            </div>
          </section>

          <SiteFooter className="relative z-10 bg-transparent" />
        </div>
      </main>
    </>
  );
}
