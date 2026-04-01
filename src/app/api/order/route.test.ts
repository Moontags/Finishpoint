import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    sendMail: vi.fn(),
    createTransport: vi.fn(),
  };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

import { POST } from "./route";

describe("POST /api/order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTransport.mockReturnValue({
      sendMail: mocks.sendMail,
    });

    process.env.SMTP_HOST = "posti.zoner.fi";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "kuljetus@finishpoint.fi";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "kuljetus@finishpoint.fi";
    process.env.QUOTE_RECIPIENT = "kuljetus@finishpoint.fi";
    process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK = "https://pay.mobilepay.fi/test-link";
  });

  it("lahettaa tilauksen sahkopostiin ja palauttaa maksulinkin", async () => {
    const request = new Request("http://localhost/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Matti Meikalainen",
        phone: "0401234567",
        email: "matti@example.com",
        serviceType: "Moottoripyorakuljetus",
        addresses: "Nouto: Helsinki -> Toimitus: Turku",
        message: "Nopea toimitus",
        estimatedPriceVat0: 100,
        estimatedPriceVatIncl: 125.5,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, paymentUrl: "https://pay.mobilepay.fi/test-link" });
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "kuljetus@finishpoint.fi",
        subject: expect.stringContaining("Tilaus ja maksu"),
      }),
    );
  });

  it("estaa tilauksen ilman laskurin hintaa", async () => {
    const request = new Request("http://localhost/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Matti Meikalainen",
        phone: "0401234567",
        email: "matti@example.com",
        serviceType: "Moottoripyorakuljetus",
        addresses: "Nouto: Helsinki -> Toimitus: Turku",
        message: "Nopea toimitus",
        estimatedPriceVat0: null,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
});
