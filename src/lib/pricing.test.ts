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
  it("0-kerros ilman lisia -> 70,92 euroa", () => {
    expect(kappaletavaraHinta(30)).toBe(70.92);
  });

  it("40 km -> 70,92 euroa", () => {
    expect(kappaletavaraHinta(40)).toBe(70.92);
  });

  it("41 km -> 71,95 euroa", () => {
    expect(kappaletavaraHinta(41)).toBe(71.95);
  });

  it("100 km -> 132,72 euroa", () => {
    expect(kappaletavaraHinta(100)).toBe(132.72);
  });

  it("0 km -> 70,92 euroa (aloitushinta)", () => {
    expect(kappaletavaraHinta(0)).toBe(70.92);
  });
});

describe("projektiHinta", () => {
  it("tuntihinta toimii", () => {
    expect(projektiHinta("tunti", 4)).toBe(175.3);
  });

  it("pieni muutto on kiintea", () => {
    expect(projektiHinta("pieni_muutto")).toBeCloseTo(214.34, 2);
  });

  it("suuri muutto palauttaa null", () => {
    expect(projektiHinta("suuri_muutto")).toBeNull();
  });

  it("kierratys 1 kuorma", () => {
    expect(projektiHinta("kierratys_1", undefined, undefined, 20, 35)).toBe(71.71);
  });

  it("kierratys lisakuormilla", () => {
    expect(projektiHinta("kierratys_lisa", undefined, 2, 30, 45)).toBe(141.84);
  });

  it("projektikategoriaan km-lisa alkaa vasta 40 km jalkeen", () => {
    const aloitus = projektiHinta("kierratys_1", undefined, undefined, 40, 35);
    const yli = projektiHinta("kierratys_1", undefined, undefined, 60, 35);
    expect(aloitus).not.toBeNull();
    expect(yli).not.toBeNull();
    expect((yli as number) - (aloitus as number)).toBeCloseTo(11, 2);
  });

  it("pieni muutto saa km-lisan vasta 40 km jalkeen", () => {
    const aloitus = projektiHinta("pieni_muutto", undefined, undefined, 40);
    const yli = projektiHinta("pieni_muutto", undefined, undefined, 60);
    expect(aloitus).not.toBeNull();
    expect(yli).not.toBeNull();
    expect((yli as number) - (aloitus as number)).toBeCloseTo(11, 2);
  });
});

describe("lisaaAlv", () => {
  it("laskee ALV 25,5 %", () => {
    expect(lisaaAlv(100)).toBe(125.5);
  });
});
