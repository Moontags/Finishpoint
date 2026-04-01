"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { serviceNavigationLinks, serviceNavigationOrder } from "@/lib/services";
import { siteContact, siteCta } from "@/lib/site-config";

export function SiteHeader({ opaque = false }: { opaque?: boolean }) {
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

  const navLinkClass = (href: string) => {
    const active = href === "/laskuri"
      ? pathname.startsWith("/laskuri")
      : pathname === href;

    return `rounded-lg border-b-2 px-3.5 py-2 transition ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <header className={`relative z-50 bg-white px-2.5 pt-0 pb-1.5 sm:px-5 sm:pt-0 sm:pb-3 lg:px-8 ${opaque ? "" : "md:bg-transparent"}`}>
      <div className={`w-full rounded-2xl px-3 py-2.5 transition-all duration-200 sm:px-6 sm:py-3.5 ${
        scrolled
          ? "border border-slate-200/90 bg-white/75 shadow-[0_2px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          : opaque
            ? "border border-slate-200/70 bg-white shadow-sm"
            : "border border-slate-200/70 bg-white shadow-sm md:border-transparent md:bg-transparent md:shadow-none"
      }`}>
        <div className="flex items-center justify-between gap-2.5 sm:gap-5">
          <Link href="/" className="flex min-w-0 shrink-0 items-center" aria-label="Etusivu">
            <Image
              src="/images/finishpoint-logo.png"
              alt="Finishpoint"
              width={160}
              height={80}
              className="h-auto w-36 object-contain sm:w-44"
              priority
            />
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
            <Link href="/laskuri" className={navLinkClass("/laskuri")}>
              Laskuri
            </Link>
            <Link href="/" className={navLinkClass("/")}>
              {siteCta.quoteNavLabel}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/${siteCta.quoteSectionHref}`}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-600 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{siteCta.quoteNavLabel}</span>
            </Link>
            <a
              href={siteContact.phoneHref}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-600 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Soita</span>
            </a>
          </div>
        </div>

        <details className="mt-2.5 md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-slate-700">
            Palvelut ja linkit
            <ChevronDown className="h-4 w-4" />
          </summary>
          <div className="mt-2 grid gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 backdrop-blur-xl">
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
              href={`/${siteCta.quoteSectionHref}`}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {siteCta.quoteNavLabel}
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
