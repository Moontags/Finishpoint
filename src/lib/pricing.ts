import type { ProjektiTyyppi } from "@/lib/types";

// ALV-kanta prosenttilukuna (25.5 = 25,5 %). Sama yksikkö kuin
// prices.vat_rate-kannassa ja orders.vat_rate-sarakkeessa. Käytetään vain
// fallbackina, jos kannasta ei saada arvoa.
export const ALV_PROSENTTI = 25.5;

export type PriceConfig = {
  base_ajoneuvo_40: number;
  base_ajoneuvo_80: number;
  km_rate_ajoneuvo: number;
  base_kappaletavara: number;
  km_rate_tavara: number;
  base_muutto: number;
  base_kierratys: number;
  km_rate_muutto: number;
  vat_rate: number;
};

export const defaultPriceConfig: PriceConfig = {
  base_ajoneuvo_40: 129,
  base_ajoneuvo_80: 169,
  km_rate_ajoneuvo: 1.29,
  base_kappaletavara: 59,
  km_rate_tavara: 1.29,
  base_muutto: 269,
  base_kierratys: 79,
  km_rate_muutto: 0.69,
  vat_rate: ALV_PROSENTTI,
};

function pyoristaSentteihin(hinta: number): number {
  return Math.round(hinta * 100) / 100;
}

// Kanta tallentaa ALV:n prosenttilukuna (25.50), koska prices.value on
// numeric(8,2) eikä pysty tallentamaan murtolukua 0.255 (se pyöristyisi
// arvoon 0.26). Vanhoissa riveissä kenttä on kuitenkin voinut olla murtoluku,
// joten alle 1:n arvot tulkitaan kertoimeksi — muuten 0.26 tarkoittaisi
// 0,26 %:n ALV:tä ja kaikki hinnat romahtaisivat.
export function normalizeVatRate(rate: number | null | undefined): number {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    return ALV_PROSENTTI;
  }
  return rate < 1 ? rate * 100 : rate;
}

// ALV-kanta näyttömuodossa (esim. "25,5" tai en-US:ssa "25.5"). Käytetään
// käännösten {rate}-paikkamerkin täyttämiseen, jotta tekstit seuraavat kantaa.
export function formatVatPercent(prices: PriceConfig = defaultPriceConfig, locale = "fi-FI"): string {
  return normalizeVatRate(prices.vat_rate).toLocaleString(locale);
}

// Kerroin, jolla ALV 0 % -hinnasta saadaan verollinen hinta (esim. 1.255).
export function vatMultiplier(prices: PriceConfig = defaultPriceConfig): number {
  return 1 + normalizeVatRate(prices.vat_rate) / 100;
}

export function poistaAlv(hintaSisAlv: number, prices: PriceConfig = defaultPriceConfig): number {
  return pyoristaSentteihin(hintaSisAlv / vatMultiplier(prices));
}

export function lisaaAlv(hintaAlv0: number, prices: PriceConfig = defaultPriceConfig): number {
  return pyoristaSentteihin(hintaAlv0 * vatMultiplier(prices));
}

export function pyoristaAsiakkaalle(hintaSisAlv: number): number {
  return Math.round(hintaSisAlv);
}

// Kategoria A
export function ajoneuvohinta(km: number, monipysahdys: boolean, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Math.max(0, km);
  const kmHintaAlv0 = poistaAlv(prices.km_rate_ajoneuvo, prices);

  if (monipysahdys) return pyoristaSentteihin(turvallinenKm * kmHintaAlv0);
  if (turvallinenKm <= 40) return poistaAlv(prices.base_ajoneuvo_40, prices);
  if (turvallinenKm <= 80) return poistaAlv(prices.base_ajoneuvo_80, prices);

  return pyoristaSentteihin(poistaAlv(prices.base_ajoneuvo_80, prices) + (turvallinenKm - 80) * kmHintaAlv0);
}

// Kategoria B
export function kappaletavaraHinta(km: number, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Math.max(0, km);

  if (turvallinenKm <= 40) return poistaAlv(prices.base_kappaletavara, prices);
  return pyoristaSentteihin(
    poistaAlv(prices.base_kappaletavara, prices) + (turvallinenKm - 40) * poistaAlv(prices.km_rate_tavara, prices),
  );
}

// Kategoria C
export function projektiHinta(
  tyyppi: ProjektiTyyppi,
  tunnit?: number,
  projektiKm?: number,
  prices: PriceConfig = defaultPriceConfig,
): number | null {
  if (tyyppi === "tunti") return pyoristaSentteihin((tunnit ?? 0) * (55 / vatMultiplier(prices)));
  if (tyyppi === "suuri_muutto") return null;

  const kmHintaAlv0 = poistaAlv(prices.km_rate_muutto, prices);
  const turvallinenKm = Math.max(0, projektiKm ?? 0);
  const kmLisat = pyoristaSentteihin(Math.max(0, turvallinenKm - 40) * kmHintaAlv0);

  if (tyyppi === "pieni_muutto") {
    return pyoristaSentteihin(poistaAlv(prices.base_muutto, prices) + kmLisat);
  }

  return null;
}
