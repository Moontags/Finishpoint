import type { Metadata } from "next";
import ServiceSelector from "@/components/ServiceSelector";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { ServiceCategory } from "@/lib/types";

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
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">Laskuri</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Kuljetuspalvelun hinta-arvio
          </h1>
          <p className="text-[15px] leading-7 text-slate-500 sm:text-lg sm:leading-8">
            Valitse ensin palvelukategoria ja tarkista arviohinta. Lopullinen hinta vahvistetaan
            aina tarjouksessa.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <ServiceSelector initialCategory={initialCategory} />
      </section>
      <SiteFooter />
    </main>
  );
}
