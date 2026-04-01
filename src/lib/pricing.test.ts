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
    expect(result.perusHinta).toBe(70.92);
    expect(result.lisat).toBe(0);
    expect(result.yhteensa).toBe(70.92);
  });

  it("40 km -> 70,92 euroa", () => {
    const result = kappaletavaraHinta(40, 0, 0, false, false);
    expect(result.perusHinta).toBe(70.92);
    expect(result.yhteensa).toBe(70.92);
  });

  it("41 km -> 71,95 euroa", () => {
    const result = kappaletavaraHinta(41, 0, 0, false, false);
    expect(result.perusHinta).toBe(71.95);
    expect(result.yhteensa).toBe(71.95);
  });

  it("kerroslisat eivat vaikuta ilman hissitonta valintaa", () => {
    const result = kappaletavaraHinta(50, 2, 3, false, false);
    expect(result.perusHinta).toBe(81.22);
    expect(result.lisat).toBe(0);
    expect(result.yhteensa).toBe(81.22);
  });

  it("hissiton lisa lisataan aina, kun valittu", () => {
    const result = kappaletavaraHinta(20, 1, 0, true, false);
    expect(result.lisat).toBe(3.98);
  });

  it("hissiton ei nosta hintaa, jos kerrokset ovat 0", () => {
    const result = kappaletavaraHinta(20, 0, 0, true, false);
    expect(result.lisat).toBe(0);
    expect(result.yhteensa).toBe(70.92);
  });

  it("kerroslisays kasvattaa hintaa 5 euroa kerrokselta (ALV-sisainen)", () => {
    const yksiKerros = kappaletavaraHinta(20, 1, 0, true, false);
    const kaksiKerrosta = kappaletavaraHinta(20, 2, 0, true, false);
    expect(kaksiKerrosta.lisat - yksiKerros.lisat).toBeCloseTo(3.98, 2);
  });

  it("hissiton lisa lisataan ilman kerrosehtoa", () => {
    const result = kappaletavaraHinta(20, 2, 0, true, false);
    expect(result.lisat).toBe(7.96);
  });

  it("pakkausapu lisa lisataan", () => {
    const result = kappaletavaraHinta(20, 0, 0, false, true);
    expect(result.lisat).toBe(15.14);
    expect(result.yhteensa).toBe(86.06);
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

  it("pieni muutto huomioi kerros- ja palvelulisat", () => {
    expect(
      projektiHinta("pieni_muutto", undefined, undefined, undefined, undefined, 1, 2, true, true),
    ).toBeCloseTo(241.43, 2);
  });

  it("kierratys huomioi kerros- ja palvelulisat", () => {
    expect(
      projektiHinta("kierratys_1", undefined, undefined, 20, 35, 1, 2, true, true),
    ).toBe(98.8);
  });

  it("kerroslisat eivat vaikuta projektilaskurissa ilman hissitonta valintaa", () => {
    expect(
      projektiHinta("pieni_muutto", undefined, undefined, undefined, undefined, 2, 3, false, false),
    ).toBeCloseTo(214.34, 2);
  });

  it("hissiton ei nosta projektihintaa, jos kerrokset ovat 0", () => {
    expect(
      projektiHinta("pieni_muutto", undefined, undefined, undefined, undefined, 0, 0, true, false),
    ).toBeCloseTo(214.34, 2);
  });

  it("projektissa lisakerros kasvattaa hintaa 5 euroa kerrokselta (ALV-sisainen)", () => {
    const yksiKerros = projektiHinta(
      "pieni_muutto",
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      0,
      true,
      false,
    );
    const kaksiKerrosta = projektiHinta(
      "pieni_muutto",
      undefined,
      undefined,
      undefined,
      undefined,
      2,
      0,
      true,
      false,
    );
    expect(yksiKerros).not.toBeNull();
    expect(kaksiKerrosta).not.toBeNull();
    expect((kaksiKerrosta as number) - (yksiKerros as number)).toBeCloseTo(3.99, 2);
  });
});

describe("lisaaAlv", () => {
  it("laskee ALV 25,5 %", () => {
    expect(lisaaAlv(100)).toBe(125.5);
  });
});
