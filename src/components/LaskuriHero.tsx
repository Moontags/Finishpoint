"use client";
import { useLanguage } from "@/lib/LanguageContext";

export function LaskuriHero() {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-500">
        {t("nav.calculator", "Laskuri")}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {t("calculator.hero_title", "Kuljetuspalvelun hinta-arvio")}
      </h1>
      <p className="text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">
        {t("calculator.hero_sub", "Valitse ensin palvelukategoria ja tarkista arviohinta. Lopullinen hinta vahvistetaan aina tarjouksessa.")}
      </p>
    </div>
  );
}
