import { isValidEmail, normalizeEmail } from "@/lib/email-validation";

describe("isValidEmail", () => {
  it("hyväksyy kelvollisen osoitteen", () => {
    expect(isValidEmail("janne.etelaaho@mailroomsolutions.fi")).toBe(true);
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("hylkää osoitteen jossa on välilyönti (bugin juurisyy)", () => {
    // Asiakas syötti "janne.etelaaho@mailroom solutions" — domain katkesi
    // välilyöntiin ja kuitti meni osoitteeseen janne.etelaaho@mailroom.
    expect(isValidEmail("janne.etelaaho@mailroom solutions")).toBe(false);
  });

  it("hylkää osoitteet ilman @-merkkiä tai domainia", () => {
    expect(isValidEmail("janne.etelaaho")).toBe(false);
    expect(isValidEmail("janne@mailroom")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("hylkää ei-string-arvot", () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });

  it("hyväksyy osoitteen ympäröivillä välilyönneillä (trimmataan)", () => {
    expect(isValidEmail("  test@example.com  ")).toBe(true);
    expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
  });
});
