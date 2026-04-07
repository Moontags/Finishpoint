"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
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
      <div className={`w-full rounded-none sm:rounded-2xl px-0 pt-2 pb-3 transition-all duration-200 sm:px-6 sm:py-3.5 ${noShadow ? "shadow-none" : ""} ${
        scrolled
          ? "bg-white/75 backdrop-blur-xl"
          : opaque
            ? "bg-white"
            : "bg-white md:bg-transparent"
      }`}>
        <div className="flex translate-y-2 items-center justify-between gap-2.5 sm:translate-y-0 sm:gap-5">
          <Link href="/" className="ml-4 flex min-w-0 shrink-0 items-center gap-2 sm:ml-0" aria-label="Etusivu">
            <Image
              src="/images/finishpoint-logo.png"
              alt="Finishpoint"
              width={160}
              height={80}
              className="h-auto w-32 object-contain hidden sm:block sm:w-44"
              priority
            />
            <span className="flex shrink-0 flex-col leading-none sm:hidden">
              <span className="text-[23px] font-black tracking-[0.04em] text-slate-900">FINISHPOINT</span>
              <span className="mt-0.5 text-[12px] font-semibold tracking-[0.2em] text-slate-500">PIKAKULJETUS</span>
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
                aria-label={t("nav.services")}
              >
                {t("nav.services")}
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
                      {t(`service.${label}`, label)}
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
              {t("nav.calculator")}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 mr-3 sm:mr-0 sm:gap-2.5">
            {/* Mobile: pill toggle to the left of hamburger */}
            <div className="flex sm:hidden" style={{ background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                type="button"
                onClick={() => setLanguage("fi")}
                style={language === "fi"
                  ? { background: "#ffffff", color: "#0C447C", boxShadow: "0 1px 3px rgba(0,0,0,0.10)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }
                  : { background: "transparent", color: "#64748b", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }
                }
              >
                FI
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                style={language === "en"
                  ? { background: "#ffffff", color: "#0C447C", boxShadow: "0 1px 3px rgba(0,0,0,0.10)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }
                  : { background: "transparent", color: "#64748b", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }
                }
              >
                EN
              </button>
            </div>
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
                      className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      {t(`service.${label}`, label)}
                    </Link>
                  ))}
                  <Link
                    href="/laskuri"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Laskuri
                  </Link>
                  <Link
                    href={quoteHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {siteCta.quoteNavLabel}
                  </Link>
                </div>
              )}
            </div>
            <Link
              href={quoteHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-slate-700/80 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-700/90 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t("nav.quote")}</span>
            </Link>
            <a
              href={siteContact.phoneHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-slate-700/80 px-3 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition hover:bg-slate-700/90 active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t("nav.call")}</span>
            </a>
            {/* Language toggle — desktop only: circular button showing active language */}
            <button
              type="button"
              aria-label={language === "fi" ? "Switch to English" : "Vaihda suomeksi"}
              onClick={() => setLanguage(language === "fi" ? "en" : "fi")}
              className="hidden md:grid place-items-center transition hover:bg-[#f8fafc]"
              style={{ width: 32, height: 32, borderRadius: "50%", border: "0.5px solid #e2e8f0", background: "transparent", fontSize: 11, fontWeight: 700, color: "#64748b", cursor: "pointer" }}
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
