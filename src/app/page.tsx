import { HomeContent } from "@/components/HomeContent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="home-page min-h-screen text-slate-900">
      <SiteHeader />
      <HomeContent />
      <SiteFooter />
    </main>
  );
}
