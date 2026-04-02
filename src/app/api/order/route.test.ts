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
    delete process.env.MOBILEPAY_CLIENT_ID;
    delete process.env.MOBILEPAY_CLIENT_SECRET;
    delete process.env.MOBILEPAY_SUBSCRIPTION_KEY;
    delete process.env.MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY;
    delete process.env.MOBILEPAY_SUBSCRIPTION_KEY_SECONDARY;
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

  it("luo maksulinkin MobilePay API:lla kun palvelinavaimet on asetettu", async () => {
    process.env.NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK = "";
    process.env.MOBILEPAY_CLIENT_ID = "client-id";
    process.env.MOBILEPAY_CLIENT_SECRET = "client-secret";
    process.env.MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY = "sub-key";
    process.env.MOBILEPAY_TOKEN_URL = "https://mobilepay.example/token";
    process.env.MOBILEPAY_PAYMENTS_URL = "https://mobilepay.example/payments";

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "test-token" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ redirectUrl: "https://pay.mobilepay.fi/dynamic-link" }),
      } as Response);

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
    expect(body).toEqual({ ok: true, paymentUrl: "https://pay.mobilepay.fi/dynamic-link" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);

    fetchMock.mockRestore();
  });
});
