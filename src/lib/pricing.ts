import type { ProjektiTyyppi } from "@/lib/types";

export const ALV = 0.255;

export function lisaaAlv(hintaAlv0: number): number {
  return Math.round(hintaAlv0 * (1 + ALV) * 100) / 100;
}

// Kategoria A
export function ajoneuvohinta(km: number, monipysahdys: boolean): number {
  if (monipysahdys) return km * 1.4;
  if (km <= 40) return 120;
  if (km <= 80) return 180;
  return 180 + (km - 80) * 1.4;
}

// Kategoria B
export function kappaletavaraHinta(
  km: number,
  kerrosNouto: number,
  kerrosToimitus: number,
  hissiton: boolean,
  pakkaus: boolean,
): { perusHinta: number; lisat: number; yhteensa: number } {
  let perus: number;
  if (km <= 40) perus = 99;
  else perus = 99 + (km - 40) * 1.4;

  let lisat = (kerrosNouto + kerrosToimitus) * 20;
  if (hissiton && (kerrosNouto > 1 || kerrosToimitus > 1)) lisat += 30;
  if (pakkaus) lisat += 25;

  return { perusHinta: perus, lisat, yhteensa: perus + lisat };
}

// Kategoria C
export function projektiHinta(
  tyyppi: ProjektiTyyppi,
  tunnit?: number,
  lisakuormat?: number,
  kierratysKm?: number,
  kierratysMaksu?: number,
): number | null {
  if (tyyppi === "tunti") return (tunnit ?? 0) * 59;
  if (tyyppi === "pieni_muutto") return 295;
  if (tyyppi === "suuri_muutto") return null;
  if (tyyppi === "kierratys_1") {
    return 110 + (kierratysKm ?? 0) * 0.8 + (kierratysMaksu ?? 0);
  }
  if (tyyppi === "kierratys_lisa") {
    return 110 + (lisakuormat ?? 0) * 50 + (kierratysKm ?? 0) * 0.8 + (kierratysMaksu ?? 0);
  }
  return null;
}
