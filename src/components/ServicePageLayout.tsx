"use client";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ServicePageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <SiteHeader opaque noShadow />

      <section className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.28em] text-blue-600 sm:text-[15px]">{t('service_page.label', 'Palvelu')}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 pb-12 sm:px-6 lg:space-y-10 lg:px-8 lg:pb-16">
        {children}
      </section>

      <SiteFooter />
    </main>
  );
}
