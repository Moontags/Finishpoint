"use client";
import type { ReactNode } from "react";
import Image from "next/image";
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
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f8] text-slate-900">
      <SiteHeader opaque noShadow />

      <div className="relative w-full min-h-80 overflow-hidden sm:min-h-125 md:min-h-150 lg:min-h-175 xl:min-h-[820px] 2xl:min-h-[920px]">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="relative h-[72%] w-full overflow-hidden">
            <Image
              src="/images/paku2.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover
                object-[78%_20%]
                sm:object-[88%_12%]
                xl:object-[60%_35%]
                2xl:object-[55%_25%]"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/55 to-white/15 lg:from-white/55 lg:via-white/30 lg:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 top-[20%] bg-linear-to-b from-transparent via-black/20 to-black/45 lg:top-[15%] lg:via-black/30 lg:to-black/55" />
          </div>
          <div className="absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-white/80 to-transparent lg:h-[17%] lg:from-white/65" />
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[#f5f6f8] via-[#f5f6f8]/88 to-transparent sm:h-[50%] lg:h-[45%]" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.28em] text-blue-600 sm:text-[15px]">{t('service_page.label', 'Palvelu')}</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
            <p className="text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">{description}</p>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-12 sm:px-6 lg:space-y-10 lg:px-8 lg:pb-16">
          {children}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
