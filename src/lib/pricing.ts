import type { ProjektiTyyppi } from "@/lib/types";

// ALV-kanta prosenttilukuna (25.5 = 25,5 %). Sama yksikkö kuin
// prices.vat_rate-kannassa ja orders.vat_rate-sarakkeessa. Käytetään vain
// fallbackina, jos kannasta ei saada arvoa.
export const ALV_PROSENTTI = 25.5;

// Tukikohta, josta kalusto lähtee ja jonne se palaa. Pikakuljetuksen
// positiointimaksu (tyhjänä ajo) lasketaan tästä osoitteesta noutopaikkaan ja
// jättöpaikasta takaisin tähän.
export const HOME_BASE = "Petsamonkatu 27, Riihimäki";

export type PositioningRateKey =
  | "positioning_rate_40_80"
  | "positioning_rate_80_200"
  | "positioning_rate_200_400"
  | "positioning_rate_400_600"
  | "positioning_rate_600_plus";

export type PriceConfig = {
  base_kappaletavara: number;
  km_rate_tavara: number;
  base_muutto: number;
  base_kierratys: number;
  km_rate_muutto: number;
  vat_rate: number;
} & Record<PositioningRateKey, number>;

export const defaultPriceConfig: PriceConfig = {
  base_kappaletavara: 59,
  km_rate_tavara: 1.29,
  base_muutto: 269,
  base_kierratys: 79,
  km_rate_muutto: 0.69,
  vat_rate: ALV_PROSENTTI,
  // Positioinnin €/km sis. ALV, kuten muutkin tämän configin hinnat.
  positioning_rate_40_80: 0.5,
  positioning_rate_80_200: 0.4,
  positioning_rate_200_400: 0.3,
  positioning_rate_400_600: 0.2,
  positioning_rate_600_plus: 0.15,
};

// Vapaat positiointikilometrit. Sama luku kuin base_kappaletavara sisältää
// (0–40 km), jotta perusmaksun sisään mahtuva lähikuljetus ei saa
// positiointilisää.
export const POSITIONING_FREE_KM = 40;

// Portaiden ylärajat kilometreinä. Rajat ovat kiinteitä; €/km-hinnat luetaan
// hintakonfiguraatiosta, joten ne ovat säädettävissä kannasta.
export const positioningTiers: ReadonlyArray<{
  untilKm: number;
  rateKey: PositioningRateKey;
}> = [
  { untilKm: 80, rateKey: "positioning_rate_40_80" },
  { untilKm: 200, rateKey: "positioning_rate_80_200" },
  { untilKm: 400, rateKey: "positioning_rate_200_400" },
  { untilKm: 600, rateKey: "positioning_rate_400_600" },
  { untilKm: Number.POSITIVE_INFINITY, rateKey: "positioning_rate_600_plus" },
];

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

// Kategoria B
export function kappaletavaraHinta(km: number, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Math.max(0, km);

  if (turvallinenKm <= 40) return poistaAlv(prices.base_kappaletavara, prices);
  return pyoristaSentteihin(
    poistaAlv(prices.base_kappaletavara, prices) + (turvallinenKm - 40) * poistaAlv(prices.km_rate_tavara, prices),
  );
}

// Positiointimaksu yhdelle tyhjänä ajetulle osuudelle (tukikohta→nouto tai
// jättö→tukikohta). Laskenta on progressiivinen: jokainen porras laskuttaa vain
// omalle välilleen osuvat kilometrit, ei koko matkaa ylimmän portaan hinnalla.
export function positiointimaksu(km: number, prices: PriceConfig = defaultPriceConfig): number {
  const turvallinenKm = Number.isFinite(km) ? Math.max(0, km) : 0;

  let laskutettuAsti = POSITIONING_FREE_KM;
  let hintaAlv0 = 0;

  for (const { untilKm, rateKey } of positioningTiers) {
    if (turvallinenKm <= laskutettuAsti) break;

    const portaanKm = Math.min(turvallinenKm, untilKm) - laskutettuAsti;
    if (portaanKm > 0) {
      hintaAlv0 += portaanKm * poistaAlv(prices[rateKey], prices);
    }
    laskutettuAsti = untilKm;
  }

  return pyoristaSentteihin(hintaAlv0);
}

// Nouto ja jättö lasketaan erikseen toisistaan ja summataan. Puuttuva etäisyys
// (esim. epäonnistunut etäisyyshaku) hinnoitellaan 0 €:na.
export function positiointiYhteensa(
  noutoKm: number | null | undefined,
  jattoKm: number | null | undefined,
  prices: PriceConfig = defaultPriceConfig,
): number {
  return pyoristaSentteihin(
    positiointimaksu(noutoKm ?? 0, prices) + positiointimaksu(jattoKm ?? 0, prices),
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
