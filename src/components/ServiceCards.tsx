"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

type Category = {
  id: string;
  cardTitle: string;
  cardDescription: string;
  cardAccent: string;
  href: string;
  backgroundImage: string;
};

export function ServiceCards({ categories }: { categories: Category[] }) {
  const { t } = useLanguage();

  return (
    <section id="services" className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ id, cardTitle, cardDescription, cardAccent, href, backgroundImage }) => (
          <a
            key={cardTitle}
            href={href}
            className="group relative flex min-h-70 w-full flex-col justify-end overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition hover:border-blue-300 hover:shadow-xl sm:min-h-80 lg:min-h-90"
          >
            <Image
              src={backgroundImage}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover object-center opacity-80 transition duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-900/10 via-slate-900/50 to-slate-900/90" />
            <div className="relative z-1 p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                {t(`serviceCategory.${id}.cardAccent`, cardAccent)}
              </p>
              <h3 className="mt-2 text-lg sm:text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {t(`serviceCategory.${id}.cardTitle`, cardTitle)}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                {t(`serviceCategory.${id}.cardDescription`, cardDescription)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
