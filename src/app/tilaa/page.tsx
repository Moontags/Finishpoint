import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TilaaClient } from "./TilaaClient";

export const metadata: Metadata = {
  title: "Tilaa kuljetus | Pakuvie",
  description: "Tilaa kuljetuspalvelu helposti — tiedot siirtyvät suoraan laskurista lomakkeeseen.",
};

export default function TilaaPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader opaque noShadow />
      <Suspense>
        <TilaaClient />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
