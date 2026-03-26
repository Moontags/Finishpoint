import type { Metadata } from "next";
import Link from "next/link";
import { PriceCalculator } from "@/components/PriceCalculator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Kappaletavaran kuljetuslaskuri | Finishpoint",
  description:
    "Laske pesukoneen, sohvan tai sangyn kuljetuksen hinta-arvio lisineen.",
};

export default function KappaletavaraLaskuriPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader opaque />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/laskuri" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700">Kaikki kategoriat</Link>
          <Link href="/laskuri/ajoneuvo" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700">Ajoneuvo</Link>
          <Link href="/laskuri/projekti" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700">Projektit</Link>
        </div>
        <PriceCalculator category="kappaletavara" />
      </section>
      <SiteFooter />
    </main>
  );
}
