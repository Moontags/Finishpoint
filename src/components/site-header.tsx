"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Phone } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [mobileMenuOpen]);

  const { language, setLanguage, t } = useLanguage();

  const quoteHref = useMemo(() => {
    const hasLocalQuoteSection =
      pathname === "/" || serviceNavigationOrder.some((slug) => pathname === `/${slug}`);

    return hasLocalQuoteSection ? siteCta.quoteSectionHref : `/${siteCta.quoteSectionHref}`;
  }, [pathname]);

  return (
    <header className={`relative z-50 w-full bg-white pt-0 pb-0 sm:px-5 sm:pt-0 sm:pb-3 lg:px-8 ${opaque ? "" : "md:bg-transparent"}`}>
      <div className={`w-full rounded-none sm:rounded-2xl px-0 pt-2 pb-3 transition-all duration-200 sm:px-6 sm:py-3.5 ${noShadow ? "shadow-none" : ""} ${
        scrolled
          ? "bg-white/75 backdrop-blur-xl"
          : opaque
            ? "bg-white"
            : "bg-white md:bg-transparent"
      }`}>
        <div className="flex translate-y-2 items-center justify-between gap-2.5 sm:translate-y-0 sm:gap-5">
          <Link
            href="/"
            aria-label="Etusivu"
            className="ml-4 flex min-w-0 shrink-0 items-center gap-2 sm:ml-0"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.location.href = "/";
              }
            }}
          >
            <Image
              src="/images/pakuvie-logo.png"
              alt="Pakuvie"
              width={160}
              height={80}
              className="h-auto w-32 object-contain hidden sm:block sm:w-44"
              priority
            />
            <span className="flex shrink-0 flex-col leading-none sm:hidden">
              <span className="text-[23px] font-black tracking-[0.04em] text-slate-900">pakuvie.fi</span>
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center gap-1 text-[14px] font-medium text-slate-700 md:flex">
            {/* md–xl: yksittäinen Alueet-linkki */}
            <Link
              href="/alueet"
              className={`2xl:hidden rounded-lg border-b-2 px-3.5 py-2 transition ${
                pathname.startsWith("/alueet")
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {t("nav.areas")}
            </Link>

            {/* 2xl+: kaupunkilinkit vierekkäin */}
            <span className="hidden 2xl:block mx-1 h-4 w-px bg-slate-300" />
            {[
              { nimi: "Riihimäki", slug: "riihimaki" },
              { nimi: "Hyvinkää", slug: "hyvinkaa" },
              { nimi: "Järvenpää", slug: "jarvenpaa" },
              { nimi: "Hämeenlinna", slug: "hameenlinna" },
              { nimi: "Tuusula", slug: "tuusula" },
              { nimi: "Vantaa", slug: "vantaa" },
            ].map((a) => (
              <Link
                key={a.slug}
                href={`/alueet/${a.slug}`}
                className={`hidden 2xl:inline-flex rounded-lg border-b-2 px-2.5 py-2 text-[13px] transition ${
                  pathname === `/alueet/${a.slug}`
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {a.nimi}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 mr-3 sm:mr-0 sm:gap-2.5">
            {/* Desktop: kielinappi samaan riviin Tarjous/Soita kanssa, mobiilissa pyöreä nappi */}
            <button
              type="button"
              aria-label="Vaihda kieli"
              onClick={() => setLanguage(language === "fi" ? "en" : "fi")}
              className="grid h-12 w-12 cursor-pointer place-items-center rounded-xl border border-slate-800 bg-transparent text-slate-800 transition hover:bg-slate-100 sm:hidden"
              style={{ fontWeight: 700, fontSize: 15 }}
            >
              {language === "fi" ? "EN" : "FI"}
            </button>
            <div ref={mobileMenuRef} className="relative translate-y-0.5 sm:translate-y-0 sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="grid h-12 w-12 cursor-pointer place-items-center rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Menu className="h-6 w-6" />
              </button>
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 grid min-w-56 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg backdrop-blur-xl">
                  {serviceNavigationLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-800 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      {t(`service.${label}`, label)}
                    </Link>
                  ))}
                  <Link
                    href="/alueet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-800 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {t("nav.areas")}
                  </Link>
                  <Link
                    href={quoteHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-800 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {siteCta.quoteNavLabel}
                  </Link>
                </div>
              )}
            </div>
            <Link
              href={quoteHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t("nav.quote")}</span>
            </Link>
            <a
              href={siteContact.phoneHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t("nav.call")}</span>
            </a>
            {/* Language toggle — desktop only: samanlainen kuin Tarjous/Soita-napit */}
            <button
              type="button"
              aria-label={language === "fi" ? "Switch to English" : "Vaihda suomeksi"}
              data-testid="language-toggle"
              onClick={() => setLanguage(language === "fi" ? "en" : "fi")}
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-transparent border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              style={{ fontWeight: 700, fontSize: 15 }}
            >
              {language === "fi" ? "EN" : "FI"}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
