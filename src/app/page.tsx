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
          {/* Vaalea pohja */}
          <div className="absolute inset-0" style={{
            background: "#f5f6f8",
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 40%)
            `
          }} />
          {/* Pistekuvio */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.25
          }} />
          {/* Häivytys alareunaan */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#f5f6f8] to-transparent" />
        </div>

        <div className="relative z-10">
          <CalculatorFormSection />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
