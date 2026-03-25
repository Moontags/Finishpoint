import Image from "next/image";
import {
  ArrowRight,
  Mail,
  MoveRight,
  Phone,
  ShieldCheck,
  Smartphone,
  FileText,
} from "lucide-react";
import ServiceSelector from "@/components/ServiceSelector";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const services = [
  {
    title: "Moottoripyöräkuljetukset",
    description:
      "Kuljetuspalvelu moottoripyörille, mopoille ja mönkijöille. Lähtöhinta 120 € (ALV 0 %).",
    accent: "Siirtopalvelu",
    featured: true,
    href: "/pyorakuljetus",
    backgroundImage: "/images/moottoripyörä.jpeg",
  },
  {
    title: "Muuttopalvelut",
    description: "Joustavat muutot koteihin ja pienyrityksille. Lähtöhinta 295 € (ALV 0 %).",
    accent: "Alkaen 295 €",
    featured: false,
    href: "/muutot",
    backgroundImage: "/images/paku3.png",
  },
  {
    title: "Kierrätykset",
    description:
      "Lähtöhinta 59 € (ALV 0 %) sisältäen 1 kuorman, kierrätyksen ja 20 km:n matkan.",
    accent: "Tarjouskohteet erikseen",
    featured: false,
    href: "/kierratys",
    backgroundImage: "/images/paku4.jpeg",
  },
];

const contactLinks = [
  {
    href: "tel:0503547763",
    label: "Soita",
    value: "050 354 7763",
    icon: Phone,
  },
  {
    href: "mailto:kuljetus@finishpoint.fi",
    label: "Sähköposti",
    value: "kuljetus@finishpoint.fi",
    icon: Mail,
  },
  {
    href: "#quote",
    label: "Tarjous",
    value: "Pyydä tarjous",
    icon: ArrowRight,
  },
];

const paymentMethods = [
  {
    icon: Smartphone,
    label: "MobilePay",
    desc: "Maksa kätevästi puhelimella",
  },
  {
    icon: FileText,
    label: "Lasku",
    desc: "14 vrk maksuaika",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="top" className="relative overflow-hidden md:-mt-[7.75rem] md:pt-[7.75rem] lg:-mt-[9.25rem] lg:pt-[9.25rem]">

        {/* Van background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/paku2.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/65 to-white/20" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f5f6f8] to-transparent" />
        </div>

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e40af 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-[2] mx-auto grid max-w-7xl gap-12 px-4 py-16 max-[390px]:gap-10 max-[390px]:px-3 max-[390px]:py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">

          {/* Left */}
          <div className="min-w-0 space-y-7">
            <div className="inline-flex max-w-full items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="max-w-full truncate sm:whitespace-normal">Logistiikkakumppanisi</span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 max-[390px]:text-[1.95rem] sm:text-6xl">
                Tavarakuljetukset, muutot &amp; siirtopalvelut <br />
                <span className="text-blue-600"> yhdestä paikasta</span>
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">
                FP-pikakuljetus hoitaa kuljetukset puolestasi alusta loppuun.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#quote"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] sm:w-auto"
              >
                Tilaa kuljetus
                <MoveRight className="h-4 w-4" />
              </a>
              <a
                href="#calculator"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 active:scale-[0.97] sm:w-auto"
              >
                Laske hinta
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                ALV 0 % hinnat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Nopea toimitus
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Huolellinen sidonta
              </span>
            </div>
          </div>

          {/* Right – contact cards */}
          <div className="grid gap-3 self-end">
            {contactLinks.map(({ href, label, value, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white/10 px-5 py-4 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                    {label}
                  </p>
                  <p className="mt-1.5 truncate text-[1.05rem] font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/40 text-blue-600 transition group-hover:bg-blue-50">
                  <Icon className="h-4 w-4" />
                </span>
              </a>
            ))}

            {/* Payment + pricing info card */}
            <div className="rounded-2xl bg-white/10 px-5 py-4 text-[13px] leading-6 text-slate-700 shadow-sm backdrop-blur-sm">
              <p className="mb-3 font-semibold text-slate-800">Hinnoittelu & maksutavat</p>
              <p className="mb-3 text-[12px] text-slate-700">Hinnat ALV 0 %, kokonaissummaan lisätään ALV 25,5 %.</p>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl bg-white/20 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-700">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services + calculator background ───────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/paku1.png"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-white/60" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#f5f6f8] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        {/* ── Services ─────────────────────────────────────────────── */}
        <section
          id="services"
          className="relative z-10 mx-auto max-w-7xl overflow-x-clip px-4 py-6 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-10"
        >
          <div className="mb-8 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">
              Palvelut
            </p>
            <h2 className="text-[1.85rem] font-bold tracking-tight text-slate-900 sm:text-4xl">
              Kaikki yhdestä paikasta
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))]">
            {services.map(({ title, description, accent, featured, href, backgroundImage }) => (
              <a
                key={title}
                href={href}
                className={`group relative flex min-h-[300px] min-w-0 flex-col justify-end overflow-hidden rounded-2xl border p-6 transition sm:min-h-[340px] ${
                  featured
                    ? "border-2 border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.15),0_14px_32px_rgba(15,23,42,0.22)]"
                    : "border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-lg"
                }`}
              >
                <Image
                  src={backgroundImage}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover object-center opacity-80"
                />
                <div className="absolute inset-0 bg-linear-to-b from-slate-900/20 via-slate-900/55 to-slate-900/85" />
                <div className="relative z-[1] mt-auto">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                    {accent}
                  </p>
                  <h3 className="mt-2 break-words text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {title}
                  </h3>
                  <p className="mt-3 break-words text-[14px] leading-[1.7] text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                    {description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Calculator ───────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
          <ServiceSelector />
        </section>
      </section>

      {/* ── Quote form background ───────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/paku5.png"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-white/65" />
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#f5f6f8] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        {/* ── Quote form ───────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
          <QuoteRequestForm />
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}