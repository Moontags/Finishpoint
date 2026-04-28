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
          
          {/* Mobiili: vaalea geometrinen (alle lg) */}
          <div className="absolute inset-0 lg:hidden" style={{
            background: "#f5f6f8",
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 40%)
            `
          }} />
          <div className="absolute inset-0 lg:hidden" style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.25
          }} />

          {/* Desktop: pakuauto-kuva (lg ja yli) */}
          <div className="absolute inset-0 hidden lg:block">
            {/* Kuva-alue, joka peittää n. 72% korkeudesta jättäen alareunan tyhjäksi */}
            <div className="relative w-full h-[72%] overflow-hidden">
              <Image
                src="/images/paku2.png"
                alt="Pakuvie kuljetus"
                fill
                sizes="100vw"
                className="object-cover 
                  object-[95%_10%]        
                  xl:object-[60%_35%]    
                  2xl:object-[55%_25%]"   
                priority
              />
              {/* Sivuttainen häivytys lomakkeen alle */}
              <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/65 to-white/20" />
            </div>

            {/* Erittäin pehmeä pystysuuntainen siirtymä taustaväriin */}
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-linear-to-t from-[#f5f6f8] via-[#f5f6f8]/90 to-transparent" />
          </div>

          {/* Mobiilihäivytys alareunaan */}
          <div className="absolute bottom-0 left-0 right-0 h-32 lg:hidden bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        <div className="relative z-10">
          <CalculatorFormSection />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}