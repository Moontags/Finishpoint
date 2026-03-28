import { describe, expect, it } from "vitest";
import {
  ajoneuvohinta,
  kappaletavaraHinta,
  lisaaAlv,
  projektiHinta,
} from "./pricing";

describe("ajoneuvohinta", () => {
  it("15 km -> 102,79 euroa (ALV 0 %)", () => {
    expect(ajoneuvohinta(15, false)).toBe(102.79);
  });

  it("60 km -> 134,66 euroa (ALV 0 %)", () => {
    expect(ajoneuvohinta(60, false)).toBe(134.66);
  });

  it("80 km -> 134,66 euroa (ALV 0 %)", () => {
    expect(ajoneuvohinta(80, false)).toBe(134.66);
  });

  it("81 km -> 135,69 euroa (ALV 0 %)", () => {
    expect(ajoneuvohinta(81, false)).toBe(135.69);
  });

  it("100 km -> 155,26 euroa (ALV 0 %)", () => {
    expect(ajoneuvohinta(100, false)).toBe(155.26);
  });

  it("0 km -> 102,79 euroa (aloitushinta)", () => {
    expect(ajoneuvohinta(0, false)).toBe(102.79);
  });

  it("monipysahdys kayttaa km-hintaa", () => {
    expect(ajoneuvohinta(50, true)).toBe(51.5);
  });
});

describe("kappaletavaraHinta", () => {
  it("0-kerros ilman lisia -> lisa 0", () => {
    const result = kappaletavaraHinta(30, 0, 0, false, false);
    expect(result.perusHinta).toBe(86.85);
    expect(result.lisat).toBe(0);
    expect(result.yhteensa).toBe(86.85);
  });

  it("40 km -> 86,85 euroa", () => {
    const result = kappaletavaraHinta(40, 0, 0, false, false);
    expect(result.perusHinta).toBe(86.85);
    expect(result.yhteensa).toBe(86.85);
  });

  it("41 km -> 87,88 euroa", () => {
    const result = kappaletavaraHinta(41, 0, 0, false, false);
    expect(result.perusHinta).toBe(87.88);
    expect(result.yhteensa).toBe(87.88);
  });

  it("laskee kerroslisat molemmista paista", () => {
    const result = kappaletavaraHinta(50, 2, 3, false, false);
    expect(result.perusHinta).toBe(97.15);
    expect(result.lisat).toBe(59.75);
    expect(result.yhteensa).toBe(156.9);
  });

  it("hissiton lisa lisataan aina, kun valittu", () => {
    const result = kappaletavaraHinta(20, 1, 0, true, false);
    expect(result.lisat).toBe(31.87);
  });

  it("hissiton lisa lisataan ilman kerrosehtoa", () => {
    const result = kappaletavaraHinta(20, 2, 0, true, false);
    expect(result.lisat).toBe(43.82);
  });

  it("pakkausapu lisa lisataan", () => {
    const result = kappaletavaraHinta(20, 0, 0, false, true);
    expect(result.lisat).toBe(15.14);
    expect(result.yhteensa).toBe(101.99);
  });
});

describe("projektiHinta", () => {
  it("tuntihinta toimii", () => {
    expect(projektiHinta("tunti", 4)).toBe(175.3);
  });

  it("pieni muutto on kiintea", () => {
    expect(projektiHinta("pieni_muutto")).toBe(262.15);
  });

  it("suuri muutto palauttaa null", () => {
    expect(projektiHinta("suuri_muutto")).toBeNull();
  });

  it("kierratys 1 kuorma", () => {
    expect(projektiHinta("kierratys_1", undefined, undefined, 20, 35)).toBe(82.71);
  });

  it("kierratys lisakuormilla", () => {
    expect(projektiHinta("kierratys_lisa", undefined, 2, 30, 45)).toBe(158.34);
  });
});

describe("lisaaAlv", () => {
  it("laskee ALV 25,5 %", () => {
    expect(lisaaAlv(100)).toBe(125.5);
  });
});
