import { CalculatorFormSection } from "@/components/CalculatorFormSection";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceCards } from "@/components/ServiceCards";
import { serviceCategories } from "@/lib/service-categories";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <section id="top" className="relative overflow-hidden overflow-x-clip w-screen h-80 sm:h-125 md:h-150 lg:h-175 xl:h-200 md:-mt-31 md:pt-31 lg:-mt-37 lg:pt-37 p-0 left-0 right-0">
        <div className="absolute inset-0 z-0 w-screen h-full left-0 right-0">
          <Image
            src="/images/paku2.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[70%] sm:object-center w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/65 to-white/20 w-screen h-full" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#f5f6f8] to-transparent w-full" />
        </div>
        {/* Van side text – large screens only */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1
              className="font-extrabold text-5xl xl:text-7xl tracking-tight text-white drop-shadow-lg shadow-black/10"
              style={{
                textShadow: "0 2px 24px rgba(0,0,0,0.18), 0 1px 0 #fff"
              }}
            >
              FP-pikakuljetus
            </h1>
            <p className="mt-6 text-slate-700/90 text-2xl xl:text-3xl font-semibold italic leading-snug tracking-wide drop-shadow-sm">
              hoitaa kuljetukset puolestasi<br />alusta loppuun.
            </p>
          </div>
        </div>
      </section>

      <CalculatorFormSection />

      <ServiceCards categories={serviceCategories} />

      <SiteFooter />
    </main>
  );
}
