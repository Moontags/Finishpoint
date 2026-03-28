import type { ProjektiTyyppi } from "@/lib/types";

export const ALV = 0.255;

function pyoristaSentteihin(hinta: number): number {
  return Math.round(hinta * 100) / 100;
}

export function poistaAlv(hintaSisAlv: number): number {
  return pyoristaSentteihin(hintaSisAlv / (1 + ALV));
}

export function lisaaAlv(hintaAlv0: number): number {
  return pyoristaSentteihin(hintaAlv0 * (1 + ALV));
}

// Kategoria A
export function ajoneuvohinta(km: number, monipysahdys: boolean): number {
  const turvallinenKm = Math.max(0, km);
  const kmHintaAlv0 = poistaAlv(1.29);

  if (monipysahdys) return pyoristaSentteihin(turvallinenKm * kmHintaAlv0);
  if (turvallinenKm <= 40) return poistaAlv(129);
  if (turvallinenKm <= 80) return poistaAlv(169);

  return pyoristaSentteihin(poistaAlv(169) + (turvallinenKm - 80) * kmHintaAlv0);
}

// Kategoria B
export function kappaletavaraHinta(
  km: number,
  kerrosNouto: number,
  kerrosToimitus: number,
  hissiton: boolean,
  pakkaus: boolean,
): { perusHinta: number; lisat: number; yhteensa: number } {
  const turvallinenKm = Math.max(0, km);
  const kerroksetYhteensa = kerrosNouto + kerrosToimitus;

  let perus: number;
  if (turvallinenKm <= 40) perus = poistaAlv(89);
  else perus = poistaAlv(89) + (turvallinenKm - 40) * poistaAlv(1.29);

  let lisat = 0;
  if (hissiton && kerroksetYhteensa > 0) {
    lisat += kerroksetYhteensa * poistaAlv(5);
  }
  if (pakkaus) lisat += poistaAlv(19);

  const perusHinta = pyoristaSentteihin(perus);
  const lisaHinta = pyoristaSentteihin(lisat);
  const yhteensa = pyoristaSentteihin(perusHinta + lisaHinta);

  return { perusHinta, lisat: lisaHinta, yhteensa };
}

// Kategoria C
export function projektiHinta(
  tyyppi: ProjektiTyyppi,
  tunnit?: number,
  lisakuormat?: number,
  kierratysKm?: number,
  kierratysMaksu?: number,
  kerrosNouto?: number,
  kerrosToimitus?: number,
  hissiton?: boolean,
  pakkaus?: boolean,
): number | null {
  if (tyyppi === "tunti") return pyoristaSentteihin((tunnit ?? 0) * (55 / (1 + ALV)));

  const kerroksetYhteensa = (kerrosNouto ?? 0) + (kerrosToimitus ?? 0);
  const kerrosLisatSisAlv = hissiton && kerroksetYhteensa > 0 ? kerroksetYhteensa * 5 : 0;
  const pakkausLisaSisAlv = pakkaus ? 19 : 0;

  let muuttoLisat = 0;
  muuttoLisat += poistaAlv(kerrosLisatSisAlv + pakkausLisaSisAlv);

  if (tyyppi === "pieni_muutto") return (269 + kerrosLisatSisAlv + pakkausLisaSisAlv) / (1 + ALV);
  if (tyyppi === "suuri_muutto") return null;

  const perusKierratys = poistaAlv(54.99);
  const kierratysKmHinta = poistaAlv(0.69);
  const lisakuormaHinta = poistaAlv(39);
  const kierratysMaksuAlv0 = poistaAlv(kierratysMaksu ?? 0);

  if (tyyppi === "kierratys_1") {
    return pyoristaSentteihin(
      perusKierratys + (kierratysKm ?? 0) * kierratysKmHinta + kierratysMaksuAlv0 + muuttoLisat,
    );
  }

  if (tyyppi === "kierratys_lisa") {
    return pyoristaSentteihin(
      perusKierratys +
        (lisakuormat ?? 0) * lisakuormaHinta +
        (kierratysKm ?? 0) * kierratysKmHinta +
        kierratysMaksuAlv0 +
        muuttoLisat,
    );
  }

  return null;
}
