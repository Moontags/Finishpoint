import type { ProjektiTyyppi } from "@/lib/types";

export const ALV = 0.255;

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
  base_kappaletavara: 89,
  km_rate_tavara: 1.29,
  base_muutto: 269,
  base_kierratys: 54.99,
  km_rate_muutto: 0.69,
  vat_rate: 25.5,
};

function pyoristaSentteihin(hinta: number): number {
  return Math.round(hinta * 100) / 100;
}

export function poistaAlv(hintaSisAlv: number): number {
  return pyoristaSentteihin(hintaSisAlv / (1 + ALV));
}

export function lisaaAlv(hintaAlv0: number): number {
  return pyoristaSentteihin(hintaAlv0 * (1 + ALV));
}

export function pyoristaAsiakkaalle(hintaSisAlv: number): number {
  return Math.round(hintaSisAlv);
}

// Kategoria A
export function ajoneuvohinta(km: number, monipysahdys: boolean, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Math.max(0, km);
  const kmHintaAlv0 = poistaAlv(prices.km_rate_ajoneuvo);

  if (monipysahdys) return pyoristaSentteihin(turvallinenKm * kmHintaAlv0);
  if (turvallinenKm <= 40) return poistaAlv(prices.base_ajoneuvo_40);
  if (turvallinenKm <= 80) return poistaAlv(prices.base_ajoneuvo_80);

  return pyoristaSentteihin(poistaAlv(prices.base_ajoneuvo_80) + (turvallinenKm - 80) * kmHintaAlv0);
}

// Kategoria B
export function kappaletavaraHinta(km: number, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Math.max(0, km);

  if (turvallinenKm <= 40) return poistaAlv(prices.base_kappaletavara);
  return pyoristaSentteihin(poistaAlv(prices.base_kappaletavara) + (turvallinenKm - 40) * poistaAlv(prices.km_rate_tavara));
}

// Kategoria C
export function projektiHinta(
  tyyppi: ProjektiTyyppi,
  tunnit?: number,
  lisakuormat?: number,
  kierratysKm?: number,
  kierratysMaksu?: number,
  prices: PriceConfig = defaultPriceConfig,
): number | null {
  if (tyyppi === "tunti") return pyoristaSentteihin((tunnit ?? 0) * (55 / (1 + ALV)));

  const perusKierratys = poistaAlv(prices.base_kierratys);
  const kierratysKmHinta = poistaAlv(prices.km_rate_muutto);
  const lisakuormaHinta = poistaAlv(39);
  const kierratysMaksuAlv0 = poistaAlv(kierratysMaksu ?? 0);
  const projektiKm = Math.max(0, kierratysKm ?? 0);
  const kmLisat = pyoristaSentteihin(Math.max(0, projektiKm - 40) * kierratysKmHinta);

  if (tyyppi === "pieni_muutto") {
    return pyoristaSentteihin(poistaAlv(prices.base_muutto) + kmLisat);
  }
  if (tyyppi === "suuri_muutto") return null;

  if (tyyppi === "kierratys_1") {
    return pyoristaSentteihin(perusKierratys + kmLisat + kierratysMaksuAlv0);
  }

  if (tyyppi === "kierratys_lisa") {
    return pyoristaSentteihin(
      perusKierratys +
        (lisakuormat ?? 0) * lisakuormaHinta +
        kmLisat +
        kierratysMaksuAlv0,
    );
  }

  return null;
}
