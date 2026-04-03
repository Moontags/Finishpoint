"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Mail, Menu, Phone } from "lucide-react";
import { serviceNavigationLinks, serviceNavigationOrder } from "@/lib/services";
import { siteContact, siteCta } from "@/lib/site-config";

export function SiteHeader({
  opaque = false,
  noShadow = false,
}: {
  opaque?: boolean;
  noShadow?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const palvelutActive = useMemo(
    () => serviceNavigationOrder.some((slug) => pathname === `/${slug}`),
    [pathname],
  );

  const quoteHref = useMemo(() => {
    const hasLocalQuoteSection =
      pathname === "/" || serviceNavigationOrder.some((slug) => pathname === `/${slug}`);

    return hasLocalQuoteSection ? siteCta.quoteSectionHref : `/${siteCta.quoteSectionHref}`;
  }, [pathname]);

  const laskuriActive = pathname.startsWith("/laskuri");

  return (
    <header className={`relative z-50 w-full bg-white pt-0 pb-0 sm:px-5 sm:pt-0 sm:pb-3 lg:px-8 ${opaque ? "" : "md:bg-transparent"}`}>
      <div className={`w-full rounded-none sm:rounded-2xl px-0 py-0.5 transition-all duration-200 sm:px-6 sm:py-3.5 ${noShadow ? "shadow-none" : ""} ${
        scrolled
          ? "bg-white/75 backdrop-blur-xl"
          : opaque
            ? "bg-white"
            : "bg-white md:bg-transparent"
      }`}>
        <div className="flex translate-y-[8px] items-center justify-between gap-2.5 sm:translate-y-0 sm:gap-5">
          <Link href="/" className="-ml-[0.6rem] flex min-w-0 shrink-0 items-center gap-2 sm:ml-0" aria-label="Etusivu">
            <Image
              src="/images/finishpoint-logo.png"
              alt="Finishpoint"
              width={160}
              height={80}
              className="h-auto w-32 object-contain sm:w-44"
              priority
            />
            <span className="flex shrink-0 flex-col leading-none sm:hidden">
              <span className="text-[15px] font-black tracking-[0.04em] text-slate-900">FINISHPOINT</span>
              <span className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-slate-500">PIKAKULJETUS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-[14px] font-medium text-slate-600 md:flex">
            <div className="group relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-lg border-b-2 px-3.5 py-2 transition ${
                  palvelutActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-label="Palvelut"
              >
                Palvelut
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="pointer-events-none absolute left-0 top-full pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="w-64 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur-xl">
                  {serviceNavigationLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block rounded-lg px-3 py-2 text-[13px] text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/laskuri"
              className={`rounded-lg border-b-2 px-3.5 py-2 transition ${
                laskuriActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Laskuri
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <details className="relative mr-5 translate-y-0.5 sm:mr-0 sm:translate-y-0 sm:hidden">
              <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50">
                <Menu className="h-[22px] w-[22px]" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 grid min-w-56 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg backdrop-blur-xl">
                {serviceNavigationLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/laskuri"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Laskuri
                </Link>
                <Link
                  href={quoteHref}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {siteCta.quoteNavLabel}
                </Link>
              </div>
            </details>
            <Link
              href={quoteHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-slate-700/80 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-700/90 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{siteCta.quoteNavLabel}</span>
            </Link>
            <a
              href={siteContact.phoneHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-slate-700/80 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-700/90 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Soita</span>
            </a>
          </div>
        </div>

      </div>
    </header>
  );
}
