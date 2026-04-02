import Image from "next/image";
import {
  ArrowRight,
  Mail,
  MoveRight,
  Phone,
  Smartphone,
  FileText,
} from "lucide-react";
import { CalculatorFormSection } from "@/components/CalculatorFormSection";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { serviceCategories } from "@/lib/service-categories";
import { siteContact, siteCta } from "@/lib/site-config";

const contactLinks = [
  {
    href: siteContact.phoneHref,
    label: "Soita",
    value: siteContact.phoneDisplay,
    icon: Phone,
  },
  {
    href: siteContact.emailHref,
    label: "Sähköposti",
    value: siteContact.email,
    icon: Mail,
  },
  {
    href: siteCta.quoteSectionHref,
    label: siteCta.quoteNavLabel,
    value: siteCta.requestQuoteLabel,
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
      <section id="top" className="relative overflow-hidden md:-mt-31 md:pt-31 lg:-mt-37 lg:pt-37">

        {/* Van background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/paku2.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/65 to-white/20" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-1 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e40af 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-2 mx-auto grid max-w-7xl gap-12 px-4 py-16 max-[390px]:gap-10 max-[390px]:px-3 max-[390px]:py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">

          {/* Left */}
          <div className="min-w-0 space-y-7">
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
                href={siteCta.calculatorHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] sm:w-auto"
              >
                {siteCta.orderTransportLabel}
                <MoveRight className="h-4 w-4" />
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Selkeä hinnoittelu
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
              <p className="mb-3 text-[12px] text-slate-700">Hinnat näytetään sis. ALV 25,5 %. Yritys (ALV 0 %).</p>
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

      {/* ── Services ─────────────────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-7xl overflow-x-clip px-4 py-6 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">
              Palvelut
            </p>
            <h2 className="hidden text-[1.85rem] font-bold tracking-tight text-slate-900 sm:block sm:text-4xl">
              Kaikki yhdestä paikasta
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {serviceCategories.map(({ cardTitle, cardDescription, cardAccent, featured, href, backgroundImage }) => (
              <a
                key={cardTitle}
                href={href}
                className={`group relative flex min-h-75 min-w-0 flex-col justify-end overflow-hidden rounded-2xl border p-6 transition sm:min-h-85 ${
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
                <div className="relative z-1 mt-auto">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                    {cardAccent}
                  </p>
                  <h3 className="mt-2 wrap-break-word text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {cardTitle}
                  </h3>
                  <p className="mt-3 wrap-break-word text-[14px] leading-[1.7] text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                    {cardDescription}
                  </p>
                </div>
              </a>
            ))}
          </div>
      </section>

      {/* ── Calculator + Quote form ─────────────────────────────── */}
      <CalculatorFormSection />

      <SiteFooter />
    </main>
  );
}