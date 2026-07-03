import {
  calculateVat,
  formatVatRate,
  generateReceiptHtml,
} from "@/lib/email-templates";
import type { OrderData } from "@/lib/types";

describe("formatVatRate", () => {
  it("näyttää prosenttiluvun Suomen muodossa", () => {
    expect(formatVatRate(25.5)).toBe("25,5");
  });

  it("normalisoi murtolukuna tallennetun kannan prosentiksi (defensiivinen)", () => {
    // Vanha bugi tallensi kannan muodossa 0.255, joka pyöristyi tietokannassa
    // arvoon 0.26. Näyttölogiikan ei pidä koskaan tulostaa "0.26 %".
    expect(formatVatRate(0.255)).toBe("25,5");
  });

  it("ei koskaan tuota vanhaa virheellistä '0.26' näyttöä", () => {
    expect(formatVatRate(25.5)).not.toContain("0.26");
    expect(formatVatRate(0.255)).not.toContain("0.26");
  });
});

describe("calculateVat", () => {
  it("laskee verottoman ja ALV-osuuden oikein 25,5 % kannalla", () => {
    const { netAmount, vatAmount, vatRate } = calculateVat(212.0, 25.5);
    expect(vatRate).toBe(25.5);
    expect(netAmount + vatAmount).toBeCloseTo(212.0, 2);
    // net = 212 / 1.255
    expect(netAmount).toBeCloseTo(168.92, 2);
    expect(vatAmount).toBeCloseTo(43.08, 2);
  });
});

describe("generateReceiptHtml — ALV-rivin näyttö", () => {
  const baseOrder: OrderData = {
    orderId: "PV-2026-07-03-e41ad472",
    orderDate: "2026-07-03T10:00:00.000Z",
    customerName: "Janne Eteläaho",
    customerEmail: "janne.etelaaho@example.com",
    customerPhone: "0401234567",
    serviceDescription: "Ajoneuvokuljetus",
    pickupAddress: "Helsinki",
    deliveryAddress: "Riihimäki",
    // Kuitilla käytetään laskurin summia sellaisenaan:
    // priceExclVat 168.59 + vatAmount 43.41 = priceInclVat 212.00
    netAmount: 168.59,
    vatAmount: 43.41,
    totalWithVat: 212.0,
    vatRate: 25.5,
    paymentMethod: "mobilepay",
  };

  it("näyttää ALV-kannan muodossa 25,5 % eikä 0.26 %", () => {
    const html = generateReceiptHtml(baseOrder);
    expect(html).toContain("25,5 %");
    expect(html).not.toContain("0.26 %");
    expect(html).not.toContain("0.255 %");
  });

  it("näyttää summat oikein", () => {
    const html = generateReceiptHtml(baseOrder);
    expect(html).toContain("168.59 EUR");
    expect(html).toContain("43.41 EUR");
    expect(html).toContain("212.00 EUR");
  });

  it("näyttää oikean kannan myös jos vanha rivi on tallentanut kannan murtolukuna", () => {
    const html = generateReceiptHtml({ ...baseOrder, vatRate: 0.255 });
    expect(html).toContain("25,5 %");
    expect(html).not.toContain("0.26 %");
  });
});
