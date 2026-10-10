"use client";

import Link from "next/link";
import { serviceFooterLinks } from "@/lib/services";
import { siteContact } from "@/lib/site-config";
import { useLanguage } from "@/lib/LanguageContext";
import { useVatRateText } from "@/lib/use-prices";

export function SiteFooter({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const withVatRate = useVatRateText();
  return (
    <footer className={`bg-surface-panel pb-16 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Vasempi palsta: yhteystiedot */}
          <div className="space-y-3">
            <a href={siteContact.phoneHref} className="block text-[17px] font-medium text-slate-700 underline underline-offset-2 transition hover:text-blue-600">{siteContact.phoneDisplay}</a>
            <a href={siteContact.emailHref} className="block break-all text-[17px] font-medium text-slate-700 underline underline-offset-2 transition hover:text-blue-600">{siteContact.email}</a>
            <p className="pt-2 text-[14px] leading-relaxed text-slate-600">
              {withVatRate(t("footer.vatNote", "Hinnat sis. ALV {rate} %. Yritys (ALV 0 %)."))}
            </p>
            <a
              href="/images/sopimusehdot.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[14px] text-slate-600 underline underline-offset-2 transition hover:text-blue-600"
            >
              {t("footer.terms", "Sopimusehdot")}
            </a>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=1387347754452590"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pakuvie Facebookissa"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.885v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
                </svg>
              </a>
              <a
                href="https://m.me/1387347754452590"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lähetä viesti Messengerissä"
                className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
                  <path d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.76 8.61.2.18.32.43.33.7l.07 2.14a.96.96 0 0 0 1.35.85l2.38-1.05c.2-.09.43-.1.64-.05 1.1.3 2.27.46 3.47.46 6.76 0 12-4.95 12-11.65S18.76 0 12 0Zm7.21 8.96-3.53 5.6a1.8 1.8 0 0 1-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.78 2.87c-.5.38-1.16-.22-.83-.75l3.53-5.6a1.8 1.8 0 0 1 2.6-.48l2.8 2.1a.72.72 0 0 0 .87 0l3.78-2.87c.5-.38 1.16.22.83.75Z" />
                </svg>
                <span className="min-w-0 break-words text-center">Lähetä viesti Messengerissä</span>
              </a>
            </div>
          </div>

          {/* Oikea palsta: Palvelut — isot näytöt */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {serviceFooterLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-2 py-2 text-[15px] text-slate-600 transition hover:text-blue-600 hover:underline"
                >
                  {t(`service.${label}`, label)}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Alareuna */}
        <div className="mt-4 border-t border-slate-700 pt-3 text-[13px] text-slate-600">
          © 2026 Pakuvie
        </div>
      </div>
    </footer>
  );
}
