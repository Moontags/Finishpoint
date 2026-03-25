import { describe, expect, it } from "vitest";
import {
  ajoneuvohinta,
  kappaletavaraHinta,
  lisaaAlv,
  projektiHinta,
} from "./pricing";

describe("ajoneuvohinta", () => {
  it("15 km -> 120 euroa", () => {
    expect(ajoneuvohinta(15, false)).toBe(120);
  });

  it("60 km -> 180 euroa", () => {
    expect(ajoneuvohinta(60, false)).toBe(180);
  });

  it("80 km -> 180 euroa", () => {
    expect(ajoneuvohinta(80, false)).toBe(180);
  });

  it("81 km -> 181,40 euroa", () => {
    expect(ajoneuvohinta(81, false)).toBe(181.4);
  });

  it("100 km -> 208 euroa", () => {
    expect(ajoneuvohinta(100, false)).toBe(208);
  });

  it("monipysahdys kayttaa km-hintaa", () => {
    expect(ajoneuvohinta(50, true)).toBe(70);
  });
});

describe("kappaletavaraHinta", () => {
  it("0-kerros ilman lisia -> lisa 0", () => {
    const result = kappaletavaraHinta(30, 0, 0, false, false);
    expect(result.perusHinta).toBe(99);
    expect(result.lisat).toBe(0);
    expect(result.yhteensa).toBe(99);
  });

  it("40 km -> 99 euroa", () => {
    const result = kappaletavaraHinta(40, 0, 0, false, false);
    expect(result.perusHinta).toBe(99);
    expect(result.yhteensa).toBe(99);
  });

  it("41 km -> 100,40 euroa", () => {
    const result = kappaletavaraHinta(41, 0, 0, false, false);
    expect(result.perusHinta).toBe(100.4);
    expect(result.yhteensa).toBe(100.4);
  });

  it("laskee kerroslisat molemmista paista", () => {
    const result = kappaletavaraHinta(50, 2, 3, false, false);
    expect(result.perusHinta).toBe(113);
    expect(result.lisat).toBe(100);
    expect(result.yhteensa).toBe(213);
  });

  it("hissiton lisa lisataan vain yli 1. kerroksessa", () => {
    const result = kappaletavaraHinta(20, 1, 0, true, false);
    expect(result.lisat).toBe(20);
  });

  it("hissiton lisa lisataan kun ehto tayttyy", () => {
    const result = kappaletavaraHinta(20, 2, 0, true, false);
    expect(result.lisat).toBe(70);
  });

  it("pakkausapu lisa lisataan", () => {
    const result = kappaletavaraHinta(20, 0, 0, false, true);
    expect(result.lisat).toBe(25);
    expect(result.yhteensa).toBe(124);
  });
});

describe("projektiHinta", () => {
  it("tuntihinta toimii", () => {
    expect(projektiHinta("tunti", 4)).toBe(236);
  });

  it("pieni muutto on kiintea", () => {
    expect(projektiHinta("pieni_muutto")).toBe(295);
  });

  it("suuri muutto palauttaa null", () => {
    expect(projektiHinta("suuri_muutto")).toBeNull();
  });

  it("kierratys 1 kuorma", () => {
    expect(projektiHinta("kierratys_1", undefined, undefined, 20, 35)).toBe(161);
  });

  it("kierratys lisakuormilla", () => {
    expect(projektiHinta("kierratys_lisa", undefined, 2, 30, 45)).toBe(279);
  });
});

describe("lisaaAlv", () => {
  it("laskee ALV 25,5 %", () => {
    expect(lisaaAlv(100)).toBe(125.5);
  });
});
