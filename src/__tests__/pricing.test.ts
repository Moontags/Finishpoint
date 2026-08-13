import {
  kappaletavaraHinta,
  ajoneuvohinta,
  projektiHinta,
  lisaaAlv,
  poistaAlv as poistaAlvConfig,
  pyoristaAsiakkaalle,
  normalizeVatRate,
  vatMultiplier,
  formatVatPercent,
  defaultPriceConfig,
  ALV_PROSENTTI,
  type PriceConfig,
} from "../lib/pricing";

function poistaAlv(hintaSisAlv: number) {
  return +(hintaSisAlv / 1.255).toFixed(2);
}

describe("kappaletavaraHinta", () => {
  it("returns correct price for 0-40km", () => {
    expect(kappaletavaraHinta(20)).toBeCloseTo(poistaAlv(59), 2); // ~47.01
  });
  it("returns correct price for over 40km", () => {
    // base + 10km extra
    const base = poistaAlv(59); // ~47.01
    const extra = 10 * poistaAlv(1.29); // 10 * 1.03 = ~10.30
    expect(kappaletavaraHinta(50)).toBeCloseTo(base + extra, 2); // ~57.31
  });
});

describe("ajoneuvohinta", () => {
  it("returns correct price for 0-40km", () => {
    expect(ajoneuvohinta(20, false)).toBeCloseTo(poistaAlv(129), 2); // ~102.79
  });
  it("returns correct price for 41-80km", () => {
    expect(ajoneuvohinta(60, false)).toBeCloseTo(poistaAlv(169), 2); // ~134.66
  });
  it("returns correct price for over 80km", () => {
    // 80km = 134.66, 100km = 134.66 + 20 * poistaAlv(1.29)
    expect(ajoneuvohinta(100, false)).toBeCloseTo(poistaAlv(169) + 20 * poistaAlv(1.29), 2);
  });
  it("applies monipysahdys (multi-stop)", () => {
    // 50km * poistaAlv(1.29)
    expect(ajoneuvohinta(50, true)).toBeCloseTo(50 * poistaAlv(1.29), 2);
  });
});

describe("projektiHinta", () => {
  it("returns correct price for pieni_muutto 0km", () => {
    expect(projektiHinta("pieni_muutto", undefined, 0)).toBeCloseTo(poistaAlv(269), 2); // ~214.46
  });
  it("returns 269,00 € incl. VAT for pieni_muutto under 40 km", () => {
    const alv0 = projektiHinta("pieni_muutto", undefined, 10)!;
    expect(pyoristaAsiakkaalle(lisaaAlv(alv0))).toBe(269);
  });
  it("adds km charge for pieni_muutto over 40 km", () => {
    const alv0 = projektiHinta("pieni_muutto", undefined, 60)!;
    expect(alv0).toBeCloseTo(poistaAlv(269) + 20 * poistaAlv(0.69), 2);
  });
  it("returns null for suuri_muutto", () => {
    expect(projektiHinta("suuri_muutto")).toBeNull();
  });
});

describe("lisaaAlv", () => {
  it("adds 25.5% VAT", () => {
    expect(lisaaAlv(100)).toBeCloseTo(125.5, 2);
    expect(lisaaAlv(70.92)).toBeCloseTo(89, 0); // ~89
  });
});

describe("pyoristaAsiakkaalle", () => {
  it("rounds to nearest integer", () => {
    expect(pyoristaAsiakkaalle(89.4)).toBe(89);
    expect(pyoristaAsiakkaalle(89.5)).toBe(90);
    expect(pyoristaAsiakkaalle(125.3)).toBe(125);
  });
});

// ALV-kanta luetaan PriceConfigista (kanta = totuuden lähde). Kanta tallentaa
// arvon prosenttilukuna (25.50), koska prices.value on numeric(8,2) eikä
// pysty tallentamaan murtolukua 0.255 tarkasti.
function config(overrides: Partial<PriceConfig> = {}): PriceConfig {
  return { ...defaultPriceConfig, ...overrides };
}

describe("normalizeVatRate", () => {
  it("hyväksyy prosenttiluvun sellaisenaan", () => {
    expect(normalizeVatRate(25.5)).toBe(25.5);
    expect(normalizeVatRate(24)).toBe(24);
  });

  it("tulkitsee alle 1:n arvot vanhaksi kerroinmuodoksi", () => {
    expect(normalizeVatRate(0.255)).toBeCloseTo(25.5, 5);
    // Tuotannossa ollut 0.26 (numeric(8,2):n pyöristämä 0.255) ei saa
    // tarkoittaa 0,26 %:n ALV:tä.
    expect(normalizeVatRate(0.26)).toBeCloseTo(26, 5);
  });

  it("palaa oletukseen kelvottomilla arvoilla", () => {
    expect(normalizeVatRate(0)).toBe(ALV_PROSENTTI);
    expect(normalizeVatRate(-5)).toBe(ALV_PROSENTTI);
    expect(normalizeVatRate(NaN)).toBe(ALV_PROSENTTI);
    expect(normalizeVatRate(null)).toBe(ALV_PROSENTTI);
    expect(normalizeVatRate(undefined)).toBe(ALV_PROSENTTI);
  });
});

describe("vatMultiplier", () => {
  it("käyttää oletusta 25,5 % ilman configia", () => {
    expect(vatMultiplier()).toBeCloseTo(1.255, 5);
  });

  it("seuraa configin vat_rate-arvoa", () => {
    expect(vatMultiplier(config({ vat_rate: 24 }))).toBeCloseTo(1.24, 5);
    expect(vatMultiplier(config({ vat_rate: 0 }))).toBeCloseTo(1.255, 5);
  });
});

describe("ALV-kanta tulee PriceConfigista eikä ole kiinteä", () => {
  it("lisaaAlv/poistaAlv seuraavat vat_rate-arvoa", () => {
    expect(lisaaAlv(100, config({ vat_rate: 24 }))).toBeCloseTo(124, 2);
    expect(lisaaAlv(100, config({ vat_rate: 25.5 }))).toBeCloseTo(125.5, 2);
    expect(poistaAlvConfig(124, config({ vat_rate: 24 }))).toBeCloseTo(100, 2);
  });

  it("laskurin ALV-sisältävä hinta muuttuu kun vat_rate vaihdetaan 24:ään", () => {
    const oletus = config();
    const alv24 = config({ vat_rate: 24 });

    const hintaOletus = ajoneuvohinta(20, false, oletus);
    const hinta24 = ajoneuvohinta(20, false, alv24);

    // Verollinen 129 € pysyy samana, joten pienempi ALV-kanta kasvattaa
    // veroprosentitonta hintaa — ja verollinen hinta pysyy asiakkaan näkemänä.
    expect(hinta24).not.toBeCloseTo(hintaOletus, 2);
    expect(hinta24).toBeCloseTo(129 / 1.24, 2);
    expect(pyoristaAsiakkaalle(lisaaAlv(hinta24, alv24))).toBe(129);

    // Ilman kytkentää tämä olisi jäänyt kiinteäksi 1.255-kertoimeen:
    expect(lisaaAlv(hinta24, oletus)).not.toBeCloseTo(129, 2);
  });

  it("muuton hinta seuraa vat_rate-arvoa kaikissa laskentapoluissa", () => {
    const alv24 = config({ vat_rate: 24 });
    const alv0 = projektiHinta("pieni_muutto", undefined, 10, alv24)!;
    expect(alv0).toBeCloseTo(269 / 1.24, 2);
    expect(pyoristaAsiakkaalle(lisaaAlv(alv0, alv24))).toBe(269);
  });

  it("kappaletavaran km-lisät käyttävät samaa kantaa", () => {
    const alv24 = config({ vat_rate: 24 });
    const odotettu = 59 / 1.24 + 10 * +(1.29 / 1.24).toFixed(2);
    expect(kappaletavaraHinta(50, alv24)).toBeCloseTo(odotettu, 1);
  });

  it("vanha kerroinmuoto kannassa ei romahduta hintoja", () => {
    // Jos tuotannon 0.26 ehtii koodin nähtäväksi ennen kantapäivitystä,
    // se tulkitaan 26 %:ksi eikä 0,26 %:ksi.
    const legacy = config({ vat_rate: 0.26 });
    expect(lisaaAlv(100, legacy)).toBeCloseTo(126, 2);
    expect(lisaaAlv(100, legacy)).not.toBeCloseTo(100.26, 2);
  });

  it("muutto pysyy 269,00 € oletuskannalla (25,5 %)", () => {
    const alv0 = projektiHinta("pieni_muutto", undefined, 10)!;
    expect(pyoristaAsiakkaalle(lisaaAlv(alv0))).toBe(269);
  });
});

describe("formatVatPercent", () => {
  it("näyttää kannan lokaalin mukaisessa muodossa", () => {
    expect(formatVatPercent()).toBe("25,5");
    expect(formatVatPercent(config({ vat_rate: 24 }))).toBe("24");
    expect(formatVatPercent(defaultPriceConfig, "en-US")).toBe("25.5");
    // Vanha kerroinmuoto ei saa näkyä käyttäjälle muodossa "0,26".
    expect(formatVatPercent(config({ vat_rate: 0.26 }))).toBe("26");
  });
});
