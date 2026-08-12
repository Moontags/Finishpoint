"use client";

import { useEffect, useState } from "react";
import { defaultPriceConfig, formatVatPercent, type PriceConfig } from "@/lib/pricing";
import { useLanguage } from "@/lib/LanguageContext";

let _cachedPrices: PriceConfig | null = null;

// Hakee hinnat /api/prices-reitistä ja välimuistittaa ne sivulatauksen ajaksi.
// Ennen vastausta käytetään defaultPriceConfigia, joten laskuri näyttää aina
// jotain järkevää myös silloin kun kantaan ei saada yhteyttä.
export function usePrices(): PriceConfig {
  const [prices, setPrices] = useState<PriceConfig>(defaultPriceConfig);

  useEffect(() => {
    if (_cachedPrices) {
      setTimeout(() => {
        setPrices(_cachedPrices!);
      }, 0);
      return;
    }
    fetch("/api/prices")
      .then((r) => r.json() as Promise<PriceConfig>)
      .then((data) => {
        _cachedPrices = data;
        setPrices(data);
      })
      .catch(() => {
        // keep defaults on error
      });
  }, []);

  return prices;
}

// Täyttää käännösten {rate}-paikkamerkin kannan ALV-kannalla, jotta
// "sis. ALV 25,5 %" -tyyppiset tekstit eivät jää jälkeen kun kanta muuttuu.
export function useVatRateText(prices?: PriceConfig): (text: string) => string {
  const fetched = usePrices();
  const { language } = useLanguage();
  const rate = formatVatPercent(prices ?? fetched, language === "en" ? "en-US" : "fi-FI");
  return (text: string) => text.replace("{rate}", rate);
}
