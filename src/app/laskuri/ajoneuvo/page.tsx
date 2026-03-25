import type { Metadata } from "next";
import Link from "next/link";
import { PriceCalculator } from "@/components/PriceCalculator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Ajoneuvokuljetusten laskuri | Finishpoint",
  description:
    "Laske moottoripyoran, monkijan, ruohonleikkurin tai mopon kuljetuksen hinta-arvio nopeasti.",
};

export default function AjoneuvoLaskuriPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/laskuri" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600">Kaikki kategoriat</Link>
          <Link href="/laskuri/kappaletavara" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600">Kappaletavara</Link>
          <Link href="/laskuri/projekti" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-600">Projektit</Link>
        </div>
        <PriceCalculator category="ajoneuvo" />
      </section>
      <SiteFooter />
    </main>
  );
}
