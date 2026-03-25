import Link from "next/link";
import { serviceNavigationOrder, services } from "@/lib/services";

export function SiteFooter() {
  const footerServiceLinks = [
    { href: "/laskuri/projekti", label: "Muutot & kierrätys" },
    ...serviceNavigationOrder
      .filter((slug) => slug !== "muutot" && slug !== "kierratys")
      .map((slug) => ({
        href: `/${slug}`,
        label:
          slug === "sohvan-kuljetus"
            ? "Sohvakuljetus"
            : slug === "pesukone-kuljetus"
              ? "Pesukonekuljetus"
              : slug === "sangyn-kuljetus"
                ? "Sängynkuljetus"
              : services[slug].navLabel,
      })),
  ];

  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[13px] text-slate-500">050 354 7763</p>
          <p className="break-all text-[13px] text-slate-500">kuljetus@finishpoint.fi</p>
          <p className="pt-1 text-[12px] text-slate-400">
            Hinnat ALV 0 %, ALV 25,5 % lisätään kokonaissummaan.
          </p>
          <Link
            href="/images/sopimusehdot.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[12px] text-slate-500 underline transition hover:text-blue-600"
          >
            Sopimusehdot
          </Link>
        </div>

        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Palvelut</p>
            <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-500">
            {footerServiceLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-2 py-1.5 transition hover:bg-slate-100 hover:text-blue-600 hover:underline"
              >
                {label}
              </Link>
            ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
