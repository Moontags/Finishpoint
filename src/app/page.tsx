import Image from "next/image";
import { CalculatorFormSection } from "@/components/CalculatorFormSection";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <section id="top" className="relative w-full min-h-80 sm:min-h-125 md:min-h-150 lg:min-h-175 xl:min-h-205 2xl:min-h-230 md:-mt-31 md:pt-31 lg:-mt-37 lg:pt-37">
        <div className="absolute inset-0 z-0">
          <div className="home-hero-bg absolute inset-0" />

          <div className="absolute inset-0 px-4 sm:px-8 md:px-12 lg:px-16 -top-104 sm:-top-116 md:-top-136 lg:-top-184 h-[calc(100%+416px)] sm:h-[calc(100%+464px)] md:h-[calc(100%+544px)] lg:h-[calc(100%+736px)]">
            <div className="relative h-full w-full max-w-450 mx-auto">
              <Image
                src="/images/paku.png"
                alt=""
                fill
                sizes="100vw"
                className="object-contain object-center opacity-[0.18] md:opacity-[0.22]"
                aria-hidden
                priority
              />
            </div>
          </div>

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
