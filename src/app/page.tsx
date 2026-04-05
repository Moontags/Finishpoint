import Image from "next/image";
import { CalculatorFormSection } from "@/components/CalculatorFormSection";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { serviceCategories } from "@/lib/service-categories";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="top" className="relative overflow-hidden overflow-x-clip w-screen h-[320px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] md:-mt-31 md:pt-31 lg:-mt-37 lg:pt-37 p-0 left-0 right-0">

        {/* Van background image */}
        <div className="absolute inset-0 z-0 w-screen h-full left-0 right-0">
          <Image
            src="/images/paku2.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[69%] sm:object-center w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/65 to-white/20 w-screen h-full" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#f5f6f8] to-transparent w-full" />
        </div>

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-1 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e40af 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-2 mx-auto max-w-7xl py-2 mt-2 sm:mt-0 sm:px-6 sm:py-16 lg:px-8 lg:py-28">
          <div className="hidden sm:block space-y-5 text-left ml-2 sm:ml-12 mt-12 lg:mt-32">
            <h1
              className="break-words hyphens-auto max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl text-3xl max-[390px]:text-[1.5rem] sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900"
            >
              Tavarakuljetukset, muutot &amp; siirtopalvelut <br />
              <span className="text-blue-600">yhdestä paikasta</span>
            </h1>
            <p className="break-words hyphens-auto max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-2xl text-[14px] max-[390px]:text-[13px] leading-7 text-slate-600 sm:text-lg sm:leading-8">
              FP-pikakuljetus hoitaa kuljetukset puolestasi alusta loppuun.
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator + Quote form ─────────────────────────────── */}
      <CalculatorFormSection />

      {/* ── Services ─────────────────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map(({ cardTitle, cardDescription, cardAccent, featured, href, backgroundImage }) => (
            <a
              key={cardTitle}
              href={href}
              className={`group relative flex min-h-[280px] w-full flex-col justify-end overflow-hidden rounded-2xl border transition sm:min-h-[320px] lg:min-h-[360px] ${
                featured
                  ? "border-2 border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.15),0_14px_32px_rgba(15,23,42,0.22)]"
                  : "border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-xl"
              }`}
            >
              <Image
                src={backgroundImage}
                alt=""
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                className="object-cover object-center opacity-80 transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-linear-to-b from-slate-900/10 via-slate-900/50 to-slate-900/90" />
              <div className="relative z-1 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  {cardAccent}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                  {cardTitle}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                  {cardDescription}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}