import type { Metadata } from "next";
import ServiceSelector from "@/components/ServiceSelector";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { ServiceCategory } from "@/lib/types";
import { LaskuriHero } from "@/components/LaskuriHero";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Kuljetuslaskuri | Finishpoint",
  description:
    "Valitse kuljetuspalvelun kategoria ja laske hinta-arvio nopeasti: ajoneuvo, kappaletavara tai projekti.",
};

function parseCategory(value: string | undefined): ServiceCategory | undefined {
  if (value === "ajoneuvo" || value === "kappaletavara" || value === "projekti") {
    return value;
  }
  return undefined;
}

export default async function LaskuriPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = parseCategory(params.kategoria);
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <SiteHeader opaque noShadow />
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-10">
        <LaskuriHero />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <ServiceSelector initialCategory={initialCategory} />
      </section>
      <SiteFooter />
    </main>
  );
}
