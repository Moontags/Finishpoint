import {
  kappaletavaraHinta,
  ajoneuvohinta,
  projektiHinta,
  lisaaAlv,
  pyoristaAsiakkaalle,
} from "../lib/pricing";

function poistaAlv(hintaSisAlv: number) {
  return +(hintaSisAlv / 1.255).toFixed(2);
}

describe("kappaletavaraHinta", () => {
  it("returns correct price for 0-40km", () => {
    expect(kappaletavaraHinta(20)).toBeCloseTo(poistaAlv(50), 2); // ~39.84
  });
  it("returns correct price for over 40km", () => {
    // base + 10km extra
    const base = poistaAlv(50); // ~39.84
    const extra = 10 * poistaAlv(1.29); // ~7.97
    expect(kappaletavaraHinta(50)).toBeCloseTo(base + extra, 2); // ~47.81
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
    expect(projektiHinta("pieni_muutto", undefined, undefined, 0)).toBeCloseTo(poistaAlv(269), 2); // ~214.46
  });
  it("returns correct price for kierratys_1", () => {
    expect(projektiHinta("kierratys_1", undefined, undefined, 0, 0)).toBeCloseTo(poistaAlv(54.99), 2); // ~43.82
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
