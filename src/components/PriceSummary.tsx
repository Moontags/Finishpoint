"use client";
import { lisaaAlv, pyoristaAsiakkaalle, type PriceConfig } from "@/lib/pricing";
import { useLanguage } from "@/lib/LanguageContext";
import { usePrices, useVatRateText } from "@/lib/use-prices";

interface PriceSummaryProps {
  hintaAlv0: number;
  label?: string;
  // Positiointimaksun osuus hintaAlv0:sta yhtenä yhteissummana. Näytetään omana
  // rivinä vain kun se on yli 0 € — porrastusta ei eritellä asiakkaalle.
  positiointiAlv0?: number;
  // Laskuri antaa oman configinsa, jotta emo ja lapsi laskevat samalla
  // ALV-kannalla myös sillä hetkellä kun /api/prices on vielä latautumassa.
  prices?: PriceConfig;
}

export function PriceSummary({
  hintaAlv0,
  label = "Hinta",
  positiointiAlv0,
  prices: pricesProp,
}: PriceSummaryProps) {
  const { t } = useLanguage();
  const fetchedPrices = usePrices();
  const prices = pricesProp ?? fetchedPrices;
  const sisAlv = pyoristaAsiakkaalle(lisaaAlv(hintaAlv0, prices));
  const withVatRate = useVatRateText(prices);
  return (
    <div className="mt-4 rounded-xl bg-transparent px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800 [overflow-wrap-anywhere]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {sisAlv.toFixed(2)} € <span className="text-[13px] font-medium text-slate-700">({withVatRate(t('common.vat_incl', 'sis. ALV {rate} %'))})</span>
      </p>
      {positiointiAlv0 !== undefined && positiointiAlv0 > 0 ? (
        <p className="mt-1 text-[13px] text-slate-800">
          {t('calculator.positioning', 'Sisältää positiointimaksun')}:{" "}
          <span className="font-semibold text-slate-900">
            {lisaaAlv(positiointiAlv0, prices).toFixed(2)} €
          </span>
        </p>
      ) : null}
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-800">
          {t('common.business_vat', 'Yritys (ALV 0 %)')}: <span className="font-semibold text-slate-900">{hintaAlv0.toFixed(2)} €</span>
        </p>
      </div>
      <p className="mt-2 text-[12px] text-slate-700">
        {t('calculator.order_via_form', 'Täytä osoite- ja tavaratiedot laskurissa tilataksesi ja maksaaksesi suoraan, tai lähetä tarjouspyyntö alla olevalla lomakkeella.')}
      </p>
    </div>
  );
}
