import Image from "next/image";
import { CalculatorFormSection } from "@/components/CalculatorFormSection";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <section id="top" className="relative w-full min-h-80 sm:min-h-125 md:min-h-150 lg:min-h-175 xl:min-h-[820px] 2xl:min-h-[920px] md:-mt-31 md:pt-31 lg:-mt-37 lg:pt-37">
        <div className="absolute inset-0 z-0">
          {/* Taustakuva – kaikilla näyttökoilla */}
          <div className="relative w-full h-[50%] sm:h-[57%] lg:h-[64%] overflow-hidden">
            <Image
              src="/images/paku.png"
              alt="Pakuvie kuljetus"
              fill
              sizes="100vw"
              className="object-cover
                object-[78%_20%]
                sm:object-[88%_12%]
                xl:object-[60%_35%]
                2xl:object-[55%_25%]"
              priority
            />
            {/* Vaakahäivytys vasemmalle – vahvempi mobiilissa lomakkeen luettavuuden vuoksi */}
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/15 lg:from-white/55 lg:via-white/30 lg:to-transparent" />
            {/* Pystysuora tummennus alaspäin */}
            <div className="absolute inset-x-0 bottom-0 top-[20%] bg-linear-to-b from-transparent via-black/20 to-black/45 lg:top-[15%] lg:via-black/30 lg:to-black/55" />
          </div>

          {/* Vaalea peite headerin kohdalle */}
          <div className="absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-white/80 to-transparent lg:h-[17%] lg:from-white/65" />

          {/* Siirtymä sivun taustaväriin */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[#f5f6f8] via-[#f5f6f8]/88 to-transparent sm:h-[50%] lg:h-[45%]" />
        </div>

        <div className="relative z-10">
          <CalculatorFormSection />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
